// 知识库附件服务：上传 → 抽取正文 → 生成/更新条目。
//
// 三种关系（用户选的 B：允许散文件）：
//   1. 上传时指定 entryId  → 挂到已有条目，把正文追加进条目内容
//   2. 上传时不指定 entryId → 建一条 source=file 的条目，正文即抽取结果
//   3. 上传时指定 asFileOnly → 只存文件不建条目，稍后再归类
//
// 抽取失败不阻断上传：文件照样存下，extract_status 记 failed，
// 用户可在面板里点「重新解析」重试（换解析器或补装依赖后很有用）。
import { existsSync, readFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';

import * as kb from './kb.js';
import { getLeadsDb } from './db.js';
import { audit } from './audit.js';
import { DATA_DIR } from './config.js';
import { FileStore, kindOf, mimeOf } from './kbStore.js';
import { extractDocx, extractPdf, extractXlsx, guessTitle, normalizeText } from './kbParse.js';
import { ocrAvailable, ocrImage } from './kbOcr.js';

let store = null;
function fileStore() {
  if (!store) store = new FileStore(DATA_DIR);
  return store;
}

/* ── 表操作 ───────────────────────────────────────────── */

// 直接复用 db.js 的连接：kb.js 与本模块共用同一个 DatabaseSync，
// 不做二次打开（同路径重复打开会产生两个 WAL 写者互相阻塞）。
function db() {
  return getLeadsDb();
}

function rowToFile(row) {
  if (!row) return null;
  return {
    id: row.id,
    entryId: row.entry_id,
    name: row.name,
    stored: row.stored,
    size: row.size,
    mime: row.mime,
    sha256: row.sha256,
    extractStatus: row.extract_status,
    extractError: row.extract_error,
    ocrUsed: row.ocr_used === 1,
    createdAt: row.created_at,
  };
}

export function listFiles({ entryId, status, limit = 100 } = {}) {
  const handle = db();
  let sql = 'SELECT * FROM kb_files';
  const where = [];
  const args = [];
  if (entryId !== undefined) {
    if (entryId === null) where.push('entry_id IS NULL');
    else { where.push('entry_id = ?'); args.push(entryId); }
  }
  if (status) { where.push('extract_status = ?'); args.push(status); }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY created_at DESC LIMIT ?';
  args.push(limit);
  return handle.prepare(sql).all(...args).map(rowToFile);
}

export function getFile(id) {
  return rowToFile(db().prepare('SELECT * FROM kb_files WHERE id = ?').get(id));
}

/** 按哈希查已存在文件（去重与幂等）。 */
export function findBySha(sha256) {
  return rowToFile(db().prepare('SELECT * FROM kb_files WHERE sha256 = ?').get(sha256));
}

function insertFile(rec) {
  db().prepare(`
    INSERT INTO kb_files (id, entry_id, name, stored, size, mime, sha256,
                          extract_status, extract_error, ocr_used, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    rec.id, rec.entryId ?? null, rec.name, rec.stored, rec.size, rec.mime,
    rec.sha256, rec.extractStatus, rec.extractError ?? '', rec.ocrUsed ? 1 : 0, rec.createdAt,
  );
}

function updateFileExtract(id, { status, error = '', ocrUsed }) {
  db().prepare(
    'UPDATE kb_files SET extract_status = ?, extract_error = ?, ocr_used = ? WHERE id = ?',
  ).run(status, String(error).slice(0, 500), ocrUsed ? 1 : 0, id);
}

/* ── 抽取 ─────────────────────────────────────────────── */

/**
 * 按类型抽正文。返回 { text, status, error, ocrUsed }。
 * status: done | empty | failed | image
 */
export async function extractBuffer(buffer, name, { signal } = {}) {
  const kind = kindOf(name);
  try {
    if (kind === 'text') {
      const text = normalizeText(buffer.toString('utf8'));
      return text ? { text, status: 'done', ocrUsed: false }
        : { text: '', status: 'empty', error: '文件为空', ocrUsed: false };
    }
    if (kind === 'docx') {
      const text = extractDocx(buffer);
      return text ? { text, status: 'done', ocrUsed: false }
        : { text: '', status: 'empty', error: 'docx 无正文', ocrUsed: false };
    }
    if (kind === 'xlsx') {
      const text = extractXlsx(buffer);
      return text ? { text, status: 'done', ocrUsed: false }
        : { text: '', status: 'empty', error: 'xlsx 无文本', ocrUsed: false };
    }
    if (kind === 'pdf') {
      const text = await extractPdf(buffer);
      return { text, status: 'done', ocrUsed: false };
    }
    if (kind === 'image') {
      const avail = ocrAvailable();
      if (!avail.ok) {
        return { text: '', status: 'image', error: avail.reason, ocrUsed: false };
      }
      // 图片 OCR 可能较慢，跳过 signal 之外的取消检查
      const { text, confidence } = await ocrImage(buffer, { signal });
      if (!text) {
        return { text: '', status: 'empty', error: '未识别到文字', ocrUsed: true };
      }
      return {
        text,
        status: 'done',
        ocrUsed: true,
        note: `OCR 置信度 ${confidence}`,
      };
    }
    return { text: '', status: 'empty', error: '不支持的文件类型，仅存档', ocrUsed: false };
  } catch (error) {
    const code = error?.code ?? '';
    const message = String(error?.message ?? error);
    if (code === 'NO_TEXT_LAYER') {
      return { text: '', status: 'empty', error: 'PDF 是扫描件（无文本层），请另存为图片后重新上传以 OCR', ocrUsed: false };
    }
    if (code === 'PARSER_MISSING') {
      return { text: '', status: 'failed', error: '未安装 PDF 解析依赖 unpdf', ocrUsed: false };
    }
    return { text: '', status: 'failed', error: message, ocrUsed: false };
  }
}

/* ── 上传 ─────────────────────────────────────────────── */

/**
 * 上传一个文件。
 *
 * @param {object} opts
 * @param {Buffer} opts.buffer
 * @param {string} opts.name        原始文件名（只用于展示与扩展名判断）
 * @param {string} [opts.entryId]   挂到已有条目
 * @param {boolean} [opts.fileOnly] 只存文件，不建条目
 * @param {string} [opts.type]      建条目时的类型，默认 product
 * @param {boolean} [opts.force]    哈希已存在时仍重新抽取
 */
export async function uploadFile({ buffer, name, entryId, fileOnly, type = 'product', force = false, signal } = {}) {
  if (!buffer || buffer.length === 0) {
    const e = new Error('空文件');
    e.status = 400;
    throw e;
  }

  const saved = fileStore().save(buffer, name);
  const mime = mimeOf(name);
  const now = new Date().toISOString();

  // 同哈希已存在：默认直接复用记录（避免重复建条目），force 时重抽
  const existing = findBySha(saved.sha256);
  if (existing && !force) {
    // 若这次指定了 entryId 而原记录是散文件，顺手挂上去
    if (entryId && existing.entryId !== entryId) {
      db().prepare('UPDATE kb_files SET entry_id = ? WHERE id = ?').run(entryId, existing.id);
      return { file: getFile(existing.id), entry: null, reused: true };
    }
    return { file: existing, entry: null, reused: true };
  }

  const extract = await extractBuffer(buffer, name, { signal });
  const id = `F${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  let targetEntryId = entryId ?? null;
  let entryRecord = null;

  // 建条目：除非明确只要文件，否则抽取到正文就自动建/更新条目
  if (!fileOnly && extract.text) {
    if (targetEntryId) {
      // 追加到已有条目
      const target = kb.get(targetEntryId);
      if (target) {
        const merged = normalizeText(`${target.content}\n\n── ${name} ──\n${extract.text}`);
        entryRecord = kb.setContent(targetEntryId, merged, { source: `file:${id}` });
      }
    } else {
      entryRecord = kb.upsert({
        type,
        title: guessTitle(extract.text, name),
        content: extract.text,
        tags: [],
        source: `file:${id}`,
      });
      targetEntryId = entryRecord.id;
    }
  }

  const rec = {
    id,
    entryId: targetEntryId,
    name: String(name ?? 'unnamed').slice(0, 200),
    stored: saved.stored,
    size: saved.size,
    mime,
    sha256: saved.sha256,
    extractStatus: extract.status,
    extractError: extract.error ?? '',
    ocrUsed: extract.ocrUsed ?? false,
    createdAt: now,
  };
  insertFile(rec);
  audit('kb.file.upload', { id, name: rec.name, status: extract.status, bytes: saved.size });

  return {
    file: getFile(id),
    entry: entryRecord,
    reused: false,
    extractNote: extract.note ?? null,
  };
}

/** 重新抽取（补装依赖、换解析器、OCR 首次失败后重试）。 */
export async function reparseFile(id, { signal } = {}) {
  const file = getFile(id);
  if (!file) {
    const e = new Error('文件不存在');
    e.status = 404;
    throw e;
  }
  const buffer = fileStore().read(file.stored);
  const extract = await extractBuffer(buffer, file.name, { signal });
  updateFileExtract(id, {
    status: extract.status,
    error: extract.error ?? '',
    ocrUsed: extract.ocrUsed ?? false,
  });

  let entryRecord = null;
  if (extract.text) {
    if (file.entryId) {
      const target = kb.get(file.entryId);
      if (target && !target.content.includes(extract.text.slice(0, 80))) {
        const marker = `── ${file.name} ──`;
        const base = target.content.includes(marker)
          ? target.content.split(marker)[0].trimEnd()
          : target.content;
        entryRecord = kb.setContent(file.entryId, normalizeText(`${base}\n\n${marker}\n${extract.text}`), {
          source: `file:${id}`,
        });
      } else {
        entryRecord = target ?? null;
      }
    } else {
      entryRecord = kb.upsert({
        type: 'product',
        title: guessTitle(extract.text, file.name),
        content: extract.text,
        source: `file:${id}`,
      });
      db().prepare('UPDATE kb_files SET entry_id = ? WHERE id = ?').run(entryRecord.id, id);
    }
  }
  audit('kb.file.reparse', { id, status: extract.status });
  return { file: getFile(id), entry: entryRecord, note: extract.note ?? null };
}

/** 把散文件挂到条目上。 */
export function attachFile(id, entryId) {
  const file = getFile(id);
  if (!file) {
    const e = new Error('文件不存在');
    e.status = 404;
    throw e;
  }
  if (entryId && !kb.get(entryId)) {
    const e = new Error('目标条目不存在');
    e.status = 404;
    throw e;
  }
  db().prepare('UPDATE kb_files SET entry_id = ? WHERE id = ?').run(entryId ?? null, id);
  audit('kb.file.attach', { id, entryId: entryId ?? null });
  return getFile(id);
}

/** 删除文件记录与物理文件（同哈希有其他记录时保留磁盘文件）。 */
export function deleteFile(id) {
  const file = getFile(id);
  if (!file) {
    const e = new Error('文件不存在');
    e.status = 404;
    throw e;
  }
  db().prepare('DELETE FROM kb_files WHERE id = ?').run(id);
  const still = db().prepare('SELECT COUNT(*) c FROM kb_files WHERE sha256 = ?').get(file.sha256);
  let removedBytes = false;
  if ((still?.c ?? 0) === 0) {
    removedBytes = fileStore().remove(file.stored);
  }
  audit('kb.file.delete', { id, name: file.name, removedBytes });
  return { deleted: true, removedBytes };
}

export function readFileBytes(id) {
  const file = getFile(id);
  if (!file) {
    const e = new Error('文件不存在');
    e.status = 404;
    throw e;
  }
  return { file, buffer: fileStore().read(file.stored) };
}

/** 统计：给面板显示用。 */
export function fileStats() {
  const handle = db();
  const total = handle.prepare('SELECT COUNT(*) c, COALESCE(SUM(size),0) s FROM kb_files').get();
  const byStatus = {};
  for (const row of handle.prepare('SELECT extract_status, COUNT(*) c FROM kb_files GROUP BY extract_status').all()) {
    byStatus[row.extract_status] = row.c;
  }
  const orphan = handle.prepare('SELECT COUNT(*) c FROM kb_files WHERE entry_id IS NULL').get();
  return {
    total: total?.c ?? 0,
    bytes: total?.s ?? 0,
    byStatus,
    unattached: orphan?.c ?? 0,
  };
}
