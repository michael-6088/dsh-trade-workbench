// 知识库文件存储。
//
// 布局：<数据目录>/kb-files/<sha256前两位>/<sha256>.<ext>
// —— 按内容寻址，同一份文件（比如同一张证书传两次）只占一份磁盘空间，
//    且哈希天然可用来做幂等判断。
//
// 安全边界：
//   单文件 ≤ 50MB（防误传大文件把磁盘塞满）
//   解压后总大小 ≤ 100MB（防 zip bomb，docx/xlsx 都会解压）
//   路径一律由 sha256 与受控扩展名拼出，绝不使用用户传入的文件名落盘
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';

export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_UNZIP_BYTES = 100 * 1024 * 1024;
export const MAX_TEXT_BYTES = 200 * 1024;

/** 只保留白名单内的扩展名，其余统一 .bin —— 防止用文件名注入路径。 */
const SAFE_EXT = new Set([
  '.pdf', '.docx', '.xlsx', '.doc', '.xls', '.csv', '.txt', '.md', '.json',
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp',
]);

export function safeExt(name) {
  const e = extname(String(name ?? '')).toLowerCase();
  return SAFE_EXT.has(e) ? e : '.bin';
}

export function sha256Of(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

/** 由数据目录构造存储根；调用方负责保证 dataDir 已确定。 */
export function filesRoot(dataDir) {
  return join(dataDir, 'kb-files');
}

/** 相对路径（入库用）与绝对路径（读盘用）。 */
export function relPathFor(sha256, ext) {
  return `${sha256.slice(0, 2)}/${sha256}${ext}`;
}

export function absPathFor(dataDir, stored) {
  return join(filesRoot(dataDir), stored);
}

export class FileStore {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.root = filesRoot(dataDir);
  }

  /** 校验并落盘；已存在（同哈希）则直接复用。返回 { sha256, stored, size, reused }。 */
  save(buffer, originalName) {
    const size = buffer?.length ?? 0;
    if (size === 0) {
      const e = new Error('空文件');
      e.status = 400;
      throw e;
    }
    if (size > MAX_FILE_BYTES) {
      const e = new Error(`文件超过 ${MAX_FILE_BYTES / 1024 / 1024}MB 上限`);
      e.status = 413;
      throw e;
    }
    const sha256 = sha256Of(buffer);
    const ext = safeExt(originalName);
    const stored = relPathFor(sha256, ext);
    const abs = absPathFor(this.dataDir, stored);

    if (existsSync(abs)) {
      return { sha256, stored, size, reused: true, ext };
    }
    mkdirSync(dirname(abs), { recursive: true, mode: 0o700 });
    writeFileSync(abs, buffer, { mode: 0o600 });
    return { sha256, stored, size, reused: false, ext };
  }

  /** 读取字节；文件被外部删除时抛 404。 */
  read(stored) {
    const abs = absPathFor(this.dataDir, stored);
    if (!existsSync(abs)) {
      const e = new Error('文件不存在');
      e.status = 404;
      throw e;
    }
    return readFileSync(abs);
  }

  exists(stored) {
    return existsSync(absPathFor(this.dataDir, stored));
  }

  stat(stored) {
    const abs = absPathFor(this.dataDir, stored);
    return existsSync(abs) ? statSync(abs) : null;
  }

  /** 删除物理文件。多个条目可能共用同一哈希，调用方需先确认无引用。 */
  remove(stored) {
    const abs = absPathFor(this.dataDir, stored);
    if (!existsSync(abs)) return false;
    unlinkSync(abs);
    return true;
  }
}

/* ── 文件类型判定 ─────────────────────────────────────── */

/** 从扩展名推断解析类别。 */
export function kindOf(name) {
  const e = safeExt(name);
  if (e === '.pdf') return 'pdf';
  if (e === '.docx') return 'docx';
  if (e === '.xlsx') return 'xlsx';
  if (['.csv', '.txt', '.md', '.json'].includes(e)) return 'text';
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'].includes(e)) return 'image';
  return 'other';
}

/** 粗略 MIME，用于浏览器预览与下载头。 */
export function mimeOf(name) {
  const e = safeExt(name);
  return {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv', '.txt': 'text/plain', '.md': 'text/markdown', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.webp': 'image/webp', '.gif': 'image/gif', '.bmp': 'image/bmp',
  }[e] ?? 'application/octet-stream';
}
