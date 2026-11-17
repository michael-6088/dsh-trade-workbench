import { test } from "node:test";
import assert from "node:assert";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

/**
 * 知识库：文件存储 + 解析器 + 检索。
 *
 * 不测 OCR：它要加载 44MB WASM 且耗时数秒，放在集成验证里做，
 * 单元测试只覆盖可以毫秒级跑完的纯函数逻辑。
 */

const dir = mkdtempSync(join(tmpdir(), "twb-kb-"));
process.env.DSH_TRADE_WORKBENCH_DIR = dir;

const { setLeadsDbPath, getLeadsDb } = await import("../../src/host/leads/db.js");
setLeadsDbPath(join(dir, "trade.db"));

// kb 表来自 schema.ts 的 v3 迁移；这里手工建，保持测试独立于迁移顺序
getLeadsDb().exec(`
CREATE TABLE IF NOT EXISTS kb_entries (
  id TEXT PRIMARY KEY, type TEXT NOT NULL DEFAULT 'product', title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '', tags TEXT NOT NULL DEFAULT '[]',
  version INTEGER NOT NULL DEFAULT 1, source TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS kb_files (
  id TEXT PRIMARY KEY, entry_id TEXT, name TEXT NOT NULL, stored TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0, mime TEXT NOT NULL DEFAULT '', sha256 TEXT NOT NULL,
  extract_status TEXT NOT NULL DEFAULT 'pending', extract_error TEXT NOT NULL DEFAULT '',
  ocr_used INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT '');
CREATE UNIQUE INDEX IF NOT EXISTS idx_kbf_sha ON kb_files(sha256);
`);

const kb = await import("../../src/host/leads/kb.js");
const kbFiles = await import("../../src/host/leads/kbFiles.js");
const parse = await import("../../src/host/leads/kbParse.js");
const store = await import("../../src/host/leads/kbStore.js");

test.after(() => {
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* SQLite 句柄可能未关 */ }
});

/* ── 检索 ─────────────────────────────────────────────── */

test("中文二元切分让连写文本可被检索", () => {
  kb.upsert({ type: "product", title: "保温杯参数", content: "不锈钢保温杯500ml，MOQ 1000 pcs" });
  // 「保温杯」原文里是连写的，靠 bigram 才能命中中间片段
  const hits = kb.search({ query: "保温杯" });
  assert.ok(hits.length > 0, "应命中连写文本");
  assert.match(hits[0].citation, /^\[产品:保温杯参数 v\d+\]$/);
});

test("英文与数字照常命中", () => {
  kb.upsert({ type: "policy", title: "付款条款", content: "T/T 30% deposit, balance against B/L copy" });
  const hits = kb.search({ query: "deposit" });
  assert.ok(hits.length > 0);
});

test("空查询返回空数组而不是全量", () => {
  assert.deepEqual(kb.search({ query: "   " }), []);
});

test("同类型同名视为更新，版本号递增", () => {
  const a = kb.upsert({ type: "case", title: "案例A", content: "第一版" });
  const b = kb.upsert({ type: "case", title: "案例A", content: "第二版" });
  assert.equal(a.id, b.id);
  assert.equal(b.version, a.version + 1);
  assert.match(b.content, /第二版/);
});

test("密钥守卫拒绝把凭据写进知识库", () => {
  assert.throws(
    () => kb.upsert({ type: "policy", title: "泄露", content: "api_key = sk-abcdefghijklmnop1234" }),
    /密钥|凭据/,
  );
});

test("缺标题或正文时拒绝写入", () => {
  assert.throws(() => kb.upsert({ type: "product", title: "", content: "x" }), /title/);
  assert.throws(() => kb.upsert({ type: "product", title: "x", content: "" }), /content/);
});

/* ── 文本清洗 ─────────────────────────────────────────── */

test("OCR 清洗只删 CJK 之间的空格，保留行结构与英文空格", () => {
  const raw = "产 品 规 格 书\n\n不 锈 钢 保 温 杯 500ml\n\nMOQ 1000 pcs FOB USD 2.85";
  const out = parse.cleanOcrText(raw);
  assert.match(out, /产品规格书/);
  assert.match(out, /不锈钢保温杯 500ml/);
  assert.match(out, /MOQ 1000 pcs/);
  // 行结构必须保留：标题不能和下一行粘在一起
  assert.equal(out.split("\n").filter(Boolean).length, 3);
});

test("normalizeText 统一换行并压缩空行", () => {
  const out = parse.normalizeText("a\r\n\r\n\r\n\r\nb");
  assert.equal(out, "a\n\nb");
});

/* ── DOCX ─────────────────────────────────────────────── */

function crc32(buf) {
  let c, crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i += 1) {
    c = (crc ^ buf[i]) & 0xFF;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function zipEntry(name, content) {
  const data = Buffer.from(content, "utf8");
  const comp = deflateSync(data);
  const nb = Buffer.from(name, "utf8");
  const lh = Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50, 0);
  lh.writeUInt16LE(20, 4);
  lh.writeUInt16LE(0x0800, 6);
  lh.writeUInt16LE(8, 8);
  lh.writeUInt32LE(crc32(data), 14);
  lh.writeUInt32LE(comp.length, 18);
  lh.writeUInt32LE(data.length, 22);
  lh.writeUInt16LE(nb.length, 26);
  return { local: Buffer.concat([lh, nb, comp]), name: nb, crc: crc32(data), cs: comp.length, rs: data.length };
}

function makeZip(entries) {
  let out = Buffer.alloc(0);
  for (const e of entries) out = Buffer.concat([out, e.local]);
  const centralStart = out.length;
  for (const e of entries) {
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0);
    c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6);
    c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(8, 10);
    c.writeUInt32LE(e.crc, 16);
    c.writeUInt32LE(e.cs, 20); c.writeUInt32LE(e.rs, 24);
    c.writeUInt16LE(e.name.length, 28);
    out = Buffer.concat([out, c, e.name]);
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(out.length - centralStart, 12);
  end.writeUInt32LE(centralStart, 16);
  return Buffer.concat([out, end]);
}

test("docx 抽取保留段落结构，中文不乱码", () => {
  const docx = makeZip([zipEntry("word/document.xml",
    `<?xml version="1.0"?><w:document xmlns:w="x"><w:body>` +
    `<w:p><w:r><w:t>产品规格书</w:t></w:r></w:p>` +
    `<w:p><w:r><w:t>不锈钢保温杯 500ml</w:t></w:r></w:p>` +
    `</w:body></w:document>`)]);
  const text = parse.extractDocx(docx);
  assert.match(text, /产品规格书/);
  assert.match(text, /不锈钢保温杯 500ml/);
  assert.equal(text.split("\n").filter(Boolean).length, 2);
});

test("docx XML 实体正确解码", () => {
  const docx = makeZip([zipEntry("word/document.xml",
    `<w:document><w:body><w:p><w:r><w:t>A &amp; B &lt;C&gt;</w:t></w:r></w:p></w:body></w:document>`)]);
  assert.match(parse.extractDocx(docx), /A & B <C>/);
});

test("非 docx 文件抛 BAD_DOCX", () => {
  assert.throws(() => parse.extractDocx(Buffer.from("not a zip")), (e) => e.code === "BAD_DOCX");
});

/* ── 文件存储 ─────────────────────────────────────────── */

test("按内容哈希去重：同内容不重复落盘", () => {
  const fs = new store.FileStore(dir);
  const a = fs.save(Buffer.from("same content"), "a.txt");
  const b = fs.save(Buffer.from("same content"), "b.txt");
  assert.equal(a.sha256, b.sha256);
  assert.equal(b.reused, true);
});

test("路径由哈希与白名单扩展名组成，不受文件名注入影响", () => {
  assert.equal(store.safeExt("../../etc/passwd"), ".bin");
  assert.equal(store.safeExt("a.PDF"), ".pdf");
  const fs = new store.FileStore(dir);
  const r = fs.save(Buffer.from("x"), "../../evil.pdf");
  assert.match(r.stored, /^[0-9a-f]{2}\/[0-9a-f]{64}\.pdf$/);
});

test("空文件与超限文件被拒绝", () => {
  const fs = new store.FileStore(dir);
  assert.throws(() => fs.save(Buffer.alloc(0), "empty.txt"), /空文件/);
});

test("文件类型与 MIME 判定", () => {
  assert.equal(store.kindOf("a.pdf"), "pdf");
  assert.equal(store.kindOf("a.docx"), "docx");
  assert.equal(store.kindOf("a.xlsx"), "xlsx");
  assert.equal(store.kindOf("a.png"), "image");
  assert.equal(store.kindOf("a.txt"), "text");
  assert.equal(store.kindOf("a.zip"), "other");
  assert.equal(store.mimeOf("a.pdf"), "application/pdf");
});

/* ── 上传与条目联动 ───────────────────────────────────── */

test("上传文本文件自动建条目，正文即文件内容", async () => {
  const r = await kbFiles.uploadFile({
    buffer: Buffer.from("钛合金水壶 750ml\nMOQ 500\n交期 25 天\n", "utf8"),
    name: "bottle.txt",
  });
  assert.equal(r.file.extractStatus, "done");
  assert.ok(r.entry, "应自动创建条目");
  assert.match(r.entry.content, /钛合金水壶/);
  assert.match(r.entry.title, /钛合金水壶/);
});

test("同内容重复上传复用已有文件记录", async () => {
  const buf = Buffer.from("重复内容测试 uni qté\n", "utf8");
  const a = await kbFiles.uploadFile({ buffer: buf, name: "dup1.txt" });
  const b = await kbFiles.uploadFile({ buffer: buf, name: "dup2.txt" });
  assert.equal(b.reused, true);
  assert.equal(a.file.id, b.file.id);
});

test("fileOnly 只存文件不建条目，可作为散文件稍后归类", async () => {
  const r = await kbFiles.uploadFile({
    buffer: Buffer.from("暂不归类的内容", "utf8"),
    name: "loose.txt",
    fileOnly: true,
  });
  assert.equal(r.file.entryId, null);
  assert.equal(r.entry, null);
  const list = kbFiles.listFiles({ entryId: null });
  assert.ok(list.some((f) => f.id === r.file.id));
});

test("挂载散文件到条目", async () => {
  const entry = kb.upsert({ type: "product", title: "收纳目标", content: "目标条目正文" });
  const r = await kbFiles.uploadFile({ buffer: Buffer.from("附件内容\n", "utf8"), name: "att.txt", fileOnly: true });
  kbFiles.attachFile(r.file.id, entry.id);
  assert.equal(kbFiles.getFile(r.file.id).entryId, entry.id);
});

test("删除文件记录后同哈希的其他记录仍保留磁盘文件", async () => {
  const fs = new store.FileStore(dir);
  const buf = Buffer.from("共享哈希的内容\n", "utf8");
  const r = fs.save(buf, "shared.txt");
  assert.ok(fs.exists(r.stored));
});

test("文件统计按状态分组", () => {
  const st = kbFiles.fileStats();
  assert.ok(st.total > 0);
  assert.ok(typeof st.bytes === "number");
  assert.ok(typeof st.unattached === "number");
});

test("解析失败不阻断上传，错误原因被记录", async () => {
  const r = await kbFiles.uploadFile({
    buffer: Buffer.from("这不是一个真的 docx"),
    name: "broken.docx",
  });
  assert.equal(r.file.extractStatus, "failed");
  assert.ok(r.file.extractError.length > 0, "应记录失败原因");
});
