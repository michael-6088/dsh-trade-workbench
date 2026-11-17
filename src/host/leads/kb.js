// 知识库（RAG-lite）：产品目录 / 报价政策 / 案例 / 市场规则 / 品牌信息。
//
// v2 起改用 SQLite（表 kb_entries / kb_files），不再读写 kb.json。
// 对外 API 签名保持不变，这样 54 个获客工具与 5 个 RPC 一行都不用改。
//
// 检索算法仍是「分词命中打分」（标题3x/标签2x/内容1x），但分词补了中文二元切分：
// 原来只按标点空格切，中文长句几乎切不出词，导致搜"不锈钢保温杯"命中不到
// "不锈钢保温杯500ml" 这种连写文本。
import { getLeadsDb } from './db.js';
import { audit } from './audit.js';

export const TYPES = ['product', 'policy', 'case', 'market', 'brand'];
const TYPE_LABELS = { product: '产品', policy: '政策', case: '案例', market: '市场', brand: '品牌' };

/** 内容哈希用的字节上限：与旧实现一致的 20000 字符。 */
const MAX_CONTENT = 20_000;

function db() {
  return getLeadsDb();
}

function rowToEntry(row) {
  if (!row) return null;
  let tags = [];
  try { tags = JSON.parse(row.tags ?? '[]'); } catch { tags = []; }
  return {
    id: row.id,
    type: row.type,
    typeLabel: TYPE_LABELS[row.type] ?? row.type,
    title: row.title,
    content: row.content,
    tags,
    source: row.source,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 全量读取；条目量在千级以内，检索时统一在内存里打分即可。 */
function loadAll() {
  try {
    const rows = db().prepare('SELECT * FROM kb_entries ORDER BY updated_at DESC, rowid DESC').all();
    return rows.map(rowToEntry);
  } catch {
    return [];
  }
}

/** 密钥守卫：知识库明文落盘，绝不能存凭据。 */
function assertNoSecret(fields) {
  const hit = /(?:sk-[A-Za-z0-9]{16,}|api[_-]?key\s*[:=]\s*\S+|password\s*[:=]\s*\S+|BEGIN (?:RSA )?PRIVATE KEY)/i.test(
    JSON.stringify(fields),
  );
  if (hit) {
    throw new Error('kb 条目疑似包含密钥/凭据，拒绝写入（知识库会明文落盘）');
  }
}

/* ── 写入 ─────────────────────────────────────────────── */

export function upsert({ type, title, content, tags = [], source = 'user' }) {
  if (!TYPES.includes(type)) {
    throw new Error(`invalid type: ${type} (use ${TYPES.join('/')})`);
  }
  if (!String(title ?? '').trim() || !String(content ?? '').trim()) {
    throw new Error('kb entry needs title and content');
  }
  assertNoSecret([type, title, content, tags]);

  const now = new Date().toISOString();
  const handle = db();

  // 同类型同名视为更新（保持旧语义）
  const existing = handle.prepare(
    'SELECT * FROM kb_entries WHERE type = ? AND lower(title) = lower(?) LIMIT 1',
  ).get(type, String(title));

  if (existing) {
    handle.prepare(`
      UPDATE kb_entries SET content = ?, tags = ?, source = ?, version = version + 1, updated_at = ?
      WHERE id = ?
    `).run(
      String(content).slice(0, MAX_CONTENT),
      JSON.stringify(tags),
      source,
      now,
      existing.id,
    );
    const updated = rowToEntry(handle.prepare('SELECT * FROM kb_entries WHERE id = ?').get(existing.id));
    audit('kb.update', { id: updated.id, type, version: updated.version });
    return updated;
  }

  const id = `K${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  handle.prepare(`
    INSERT INTO kb_entries (id, type, title, content, tags, version, source, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  `).run(
    id,
    type,
    String(title).slice(0, 120),
    String(content).slice(0, MAX_CONTENT),
    JSON.stringify(tags),
    source,
    now,
    now,
  );
  audit('kb.create', { id, type, title: String(title) });
  return rowToEntry(handle.prepare('SELECT * FROM kb_entries WHERE id = ?').get(id));
}

/** 直接按 id 更新正文（文件抽取结果回填用）。 */
export function setContent(id, content, { source } = {}) {
  const now = new Date().toISOString();
  const handle = db();
  const stmt = source
    ? handle.prepare('UPDATE kb_entries SET content = ?, source = ?, version = version + 1, updated_at = ? WHERE id = ?')
    : handle.prepare('UPDATE kb_entries SET content = ?, version = version + 1, updated_at = ? WHERE id = ?');
  if (source) stmt.run(String(content).slice(0, MAX_CONTENT), source, now, id);
  else stmt.run(String(content).slice(0, MAX_CONTENT), now, id);
  return rowToEntry(handle.prepare('SELECT * FROM kb_entries WHERE id = ?').get(id));
}

/* ── 检索 ─────────────────────────────────────────────── */

/**
 * 分词：先按标点/空白切，再对含中文的片段补二元切分。
 *
 * 例："不锈钢保温杯规格" 切完后会带上 不锈/锈钢/钢保/保温/温杯/杯规/规格，
 * 这样即使原文写成 "不锈钢保温杯500ml"，搜中间任何两字也能命中。
 */
function tokenize(query) {
  const raw = String(query ?? '').toLowerCase().trim();
  if (!raw) return [];
  const parts = raw.split(/[\s,;，；、。！？!?()（）[\]【】]+/).filter(Boolean);
  const tokens = new Set();
  for (const part of parts) {
    tokens.add(part);
    // 中文二元切分：只对含 CJK 且长度 > 2 的片段做
    if (/[\u4e00-\u9fff]/.test(part) && part.length > 2) {
      for (let i = 0; i + 2 <= part.length; i += 1) {
        tokens.add(part.slice(i, i + 2));
      }
    }
  }
  return [...tokens].filter((t) => t.length > 0);
}

function scoreEntry(entry, tokens) {
  let score = 0;
  const title = entry.title.toLowerCase();
  const content = entry.content.toLowerCase();
  const tags = (entry.tags ?? []).join(' ').toLowerCase();
  for (const token of tokens) {
    if (title.includes(token)) score += 3;
    if (tags.includes(token)) score += 2;
    if (content.includes(token)) score += 1;
  }
  return score;
}

/** 检索：返回 [{id,title,snippet,citation,...}]，按命中分排序。 */
export function search({ query, type, limit = 5 } = {}) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  let entries = loadAll();
  if (type) entries = entries.filter((e) => e.type === type);

  const scored = entries
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, limit));

  return scored.map(({ entry, score }) => {
    const lower = entry.content.toLowerCase();
    const first = tokens.find((t) => lower.includes(t));
    const at = first ? Math.max(0, lower.indexOf(first) - 40) : 0;
    return {
      id: entry.id,
      type: entry.type,
      typeLabel: entry.typeLabel,
      title: entry.title,
      snippet: `${at > 0 ? '…' : ''}${entry.content.slice(at, at + 200)}…`,
      tags: entry.tags,
      version: entry.version,
      updatedAt: entry.updatedAt,
      score,
      citation: `[${entry.typeLabel}:${entry.title} v${entry.version}]`,
    };
  });
}

export function list({ type, limit = 50 } = {}) {
  let entries = loadAll();
  if (type) entries = entries.filter((e) => e.type === type);
  return entries.slice(0, limit).map((entry) => ({
    id: entry.id,
    type: entry.type,
    typeLabel: entry.typeLabel,
    title: entry.title,
    tags: entry.tags,
    version: entry.version,
    updatedAt: entry.updatedAt,
    contentPreview: entry.content.slice(0, 120),
  }));
}

/** 取单条完整内容（详情面板用）。 */
export function get(id) {
  return rowToEntry(db().prepare('SELECT * FROM kb_entries WHERE id = ?').get(id));
}

export function remove(id) {
  const handle = db();
  const row = handle.prepare('SELECT * FROM kb_entries WHERE id = ?').get(id);
  if (!row) throw new Error(`kb entry not found: ${id}`);
  // 附件不删，只解绑 —— 文件可能是用户唯一的存档
  handle.prepare('UPDATE kb_files SET entry_id = NULL WHERE entry_id = ?').run(id);
  handle.prepare('DELETE FROM kb_entries WHERE id = ?').run(id);
  audit('kb.delete', { id, title: row.title });
  return rowToEntry(row);
}

/** 把命中的知识拼成给 LLM 的上下文串。 */
export function contextFor(query, limit = 3) {
  return search({ query, limit }).map((hit) => `${hit.citation} ${hit.snippet}`).join('\n');
}

/* ── 旧数据迁移 ───────────────────────────────────────── */

/**
 * 从旧 kb.json 导入。幂等：同名同类型视为已存在则跳过。
 * 导入后把源文件改名 .migrated，不删（数据无价，留退路）。
 */
export function migrateFromJson(readJson, renameJson) {
  const parsed = readJson();
  if (!parsed || !Array.isArray(parsed.entries) || parsed.entries.length === 0) {
    return { imported: 0, skipped: 0 };
  }
  const handle = db();
  let imported = 0;
  let skipped = 0;
  for (const e of parsed.entries) {
    if (!e?.title || !e?.content) { skipped += 1; continue; }
    const type = TYPES.includes(e.type) ? e.type : 'product';
    const exists = handle.prepare(
      'SELECT id FROM kb_entries WHERE type = ? AND lower(title) = lower(?) LIMIT 1',
    ).get(type, String(e.title));
    if (exists) { skipped += 1; continue; }
    handle.prepare(`
      INSERT INTO kb_entries (id, type, title, content, tags, version, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      e.id ?? `K${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      type,
      String(e.title).slice(0, 120),
      String(e.content).slice(0, MAX_CONTENT),
      JSON.stringify(e.tags ?? []),
      Number(e.version ?? 1),
      e.source ?? 'user',
      e.createdAt ?? new Date().toISOString(),
      e.updatedAt ?? new Date().toISOString(),
    );
    imported += 1;
  }
  if (imported > 0) renameJson();
  audit('kb.migrate', { imported, skipped });
  return { imported, skipped };
}
