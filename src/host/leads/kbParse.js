// 文件正文抽取。
//
// 四种来源，三条路径：
//   text  直接读（csv/md/txt/json）
//   docx  zlib 解 zip → 抓 word/document.xml 里的 <w:t>
//   xlsx  zlib 解 zip → 抓 xl/sharedStrings.xml
//   pdf   unpdf（pdfjs 的轻量封装），零原生依赖
//   图片  tesseract.js OCR（异步，较慢）
//
// DOCX/XLSX 故意不引库：格式是标准 zip + XML，用 node:zlib 手解只需百来行，
// 比引 unpack 依赖更可控，也避免 ref 版本传递被上游改动打断。
import { inflateSync } from 'node:zlib';
import { MAX_TEXT_BYTES, MAX_UNZIP_BYTES } from './kbStore.js';

/* ── 通用：zip 读取 ───────────────────────────────────── */

/**
 * 从 zip 缓冲区读取指定条目并解压。
 * 只支持 store(0) 与 deflate(8) 两种压缩法 —— OOXML 文档只用这两种。
 */
export function readZipEntry(buffer, targetName) {
  let offset = 0;
  const target = Buffer.from(targetName, 'utf8');

  while (offset + 30 <= buffer.length) {
    const sig = buffer.readUInt32LE(offset);
    if (sig !== 0x04034b50) break; // 非 local file header，停止

    const method = buffer.readUInt16LE(offset + 8);
    const compSize = buffer.readUInt32LE(offset + 18);
    const rawSize = buffer.readUInt32LE(offset + 22);
    const nameLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLen + extraLen;
    const name = buffer.subarray(nameStart, nameStart + nameLen);

    if (rawSize > MAX_UNZIP_BYTES) {
      const e = new Error('解压后体积超限（疑似 zip bomb）');
      e.code = 'UNZIP_TOO_LARGE';
      throw e;
    }

    if (name.equals(target)) {
      const data = buffer.subarray(dataStart, dataStart + compSize);
      if (method === 0) return Buffer.from(data);
      if (method === 8) return inflateSync(data);
      const e = new Error(`不支持的压缩方法 ${method}`);
      e.code = 'UNSUPPORTED_COMPRESSION';
      throw e;
    }
    offset = dataStart + compSize;
  }
  return null;
}

/** 列出 zip 内所有条目名（调试与 xlsx 多 sheet 用）。 */
export function listZipEntries(buffer) {
  const names = [];
  let offset = 0;
  while (offset + 30 <= buffer.length) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) break;
    const compSize = buffer.readUInt32LE(offset + 18);
    const nameLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);
    names.push(buffer.subarray(offset + 30, offset + 30 + nameLen).toString('utf8'));
    offset = offset + 30 + nameLen + extraLen + compSize;
  }
  return names;
}

/* ── DOCX ─────────────────────────────────────────────── */

const XML_ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
function decodeXml(s) {
  return String(s).replace(/&(?:amp|lt|gt|quot|apos);/g, (m) => XML_ENTITIES[m] ?? m);
}

/**
 * 抽 docx 正文。
 * <w:p> 段落边界换行，<w:t> 文本，<w:tab/> 制表，<w:br/> 换行。
 */
export function extractDocx(buffer) {
  const xmlBuf = readZipEntry(buffer, 'word/document.xml');
  if (!xmlBuf) {
    const e = new Error('不是有效的 docx（缺 word/document.xml）');
    e.code = 'BAD_DOCX';
    throw e;
  }
  let xml = xmlBuf.toString('utf8');

  // 段落与换行先转成占位符，再统一抽文本，避免正则跨标签误吞
  xml = xml
    .replace(/<w:tab\b[^>]*\/>/g, '\t')
    .replace(/<w:br\b[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n');

  const texts = [];
  const re = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
  let m;
  let last = 0;
  while ((m = re.exec(xml)) !== null) {
    // 把两个 <w:t> 之间出现的 \n / \t 保留下来
    const between = xml.slice(last, m.index);
    for (const ch of between) {
      if (ch === '\n' || ch === '\t') texts.push(ch);
    }
    texts.push(decodeXml(m[1]));
    last = re.lastIndex;
  }
  const tail = xml.slice(last);
  for (const ch of tail) if (ch === '\n') texts.push(ch);

  return normalizeText(texts.join(''));
}

/* ── XLSX ─────────────────────────────────────────────── */

/**
 * 抽 xlsx 文本。
 * 单元格文本存在 sharedStrings.xml；数字直接内联在 sheet 里，这里只取字符串
 * —— 对知识库检索来说，公式与样式无关紧要，把字符串捞全就够。
 */
export function extractXlsx(buffer) {
  const parts = [];

  const shared = readZipEntry(buffer, 'xl/sharedStrings.xml');
  if (shared) {
    const xml = shared.toString('utf8');
    const re = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const t = decodeXml(m[1]).trim();
      if (t) parts.push(t);
    }
  }

  // 数字单元格（<v>）在 sheet 里，按 sheet 顺序补齐
  const entries = listZipEntries(buffer).filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n));
  for (const name of entries) {
    const buf = readZipEntry(buffer, name);
    if (!buf) continue;
    const xml = buf.toString('utf8');
    const re = /<v>([^<]+)<\/v>/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const v = m[1].trim();
      if (v && !/^\d+(\.\d+)?$/.test(v)) parts.push(v);
    }
  }

  if (parts.length === 0) {
    const e = new Error('xlsx 里没有找到文本（可能是纯数值表）');
    e.code = 'NO_TEXT';
    throw e;
  }
  // sharedStrings 按单元格顺序排列，用换行分隔便于阅读与切片
  return normalizeText(parts.join('\n'));
}

/* ── PDF ──────────────────────────────────────────────── */

/**
 * 抽 PDF 文本。unpdf 是动态加载的：没装时抛出可读错误，
 * 让调用方降级为「仅存档」，而不是整个知识库不可用。
 */
export async function extractPdf(buffer) {
  let unpdf;
  try {
    unpdf = await import('unpdf');
  } catch {
    const e = new Error('未安装 unpdf，无法解析 PDF');
    e.code = 'PARSER_MISSING';
    throw e;
  }
  const doc = await unpdf.getDocumentProxy(new Uint8Array(buffer));
  const { text } = await unpdf.extractText(doc, { mergePages: true });
  const merged = Array.isArray(text) ? text.join('\n') : String(text ?? '');
  if (merged.trim() === '') {
    const e = new Error('PDF 没有文本层（可能是扫描件），需 OCR');
    e.code = 'NO_TEXT_LAYER';
    throw e;
  }
  return normalizeText(merged);
}

/* ── 文本与清洗 ───────────────────────────────────────── */

const CJK = '\\u4e00-\\u9fff\\u3040-\\u30ff\\uac00-\\ud7af';

/**
 * OCR 结果清洗。
 *
 * Tesseract 对中文会在每个字之间插空格（"不 锈 钢"），直接入库会让
 * 子串检索彻底失效。这里只删「两个 CJK 字符之间」的空格，
 * 不碰英文单词间空格，也不碰行结构 —— 行结构一旦破坏，
 * 标题与正文会被粘成一句，可读性崩掉。
 */
export function cleanOcrText(text) {
  return String(text ?? '')
    .split('\n')
    .map((line) => {
      const t = line.trim();
      if (t === '') return '';
      return t.replace(new RegExp(`([${CJK}])\\s+(?=[${CJK}])`, 'g'), '$1');
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** 统一换行、压缩空白、截断超长文本。 */
export function normalizeText(text) {
  let out = String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (Buffer.byteLength(out, 'utf8') > MAX_TEXT_BYTES) {
    out = out.slice(0, Math.floor(MAX_TEXT_BYTES / 3));
  }
  return out;
}

/** 从正文首行猜一个标题，用于自动建条目。 */
export function guessTitle(text, fallback) {
  const first = String(text ?? '').split('\n').map((l) => l.trim()).find((l) => l.length > 0);
  if (!first) return fallback;
  return first.length > 60 ? first.slice(0, 60) + '…' : first;
}
