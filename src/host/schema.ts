// 版本化迁移：user_version 递增，只增不改历史
export interface Migration { version: number; sql: string }
export const MIGRATIONS: Migration[] = [
  { version: 1, sql: `
CREATE TABLE customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL DEFAULT '', country TEXT DEFAULT '', source TEXT DEFAULT '', contact TEXT DEFAULT '', email TEXT DEFAULT '', whatsapp TEXT DEFAULT '', tags TEXT DEFAULT '', note TEXT DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE followups (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER NOT NULL, at TEXT NOT NULL, channel TEXT DEFAULT '', content TEXT DEFAULT '', next_at TEXT DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE inquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, product TEXT DEFAULT '', qty REAL DEFAULT 0, channel TEXT DEFAULT '', content TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'new', received_at TEXT DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE quotes (id INTEGER PRIMARY KEY AUTOINCREMENT, no TEXT NOT NULL, customer_id INTEGER NOT NULL, inquiry_id INTEGER, currency TEXT NOT NULL DEFAULT 'USD', fx_rate REAL NOT NULL DEFAULT 1, items TEXT NOT NULL DEFAULT '[]', validity_days INTEGER NOT NULL DEFAULT 30, status TEXT NOT NULL DEFAULT 'draft', note TEXT DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, no TEXT NOT NULL, quote_id INTEGER, customer_id INTEGER NOT NULL, amount_cents INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'USD', sign_date TEXT DEFAULT '', delivery_date TEXT DEFAULT '', stage TEXT NOT NULL DEFAULT 'pi', progress TEXT NOT NULL DEFAULT '[]', note TEXT DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE shipments (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, booking_no TEXT DEFAULT '', vessel TEXT DEFAULT '', etd TEXT DEFAULT '', ata TEXT DEFAULT '', container TEXT DEFAULT '', bl_no TEXT DEFAULT '', customs_status TEXT DEFAULT '', note TEXT DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE receipts (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, type TEXT NOT NULL DEFAULT '尾款', amount_cents INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'USD', date TEXT DEFAULT '', bank_ref TEXT DEFAULT '', note TEXT DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE documents (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, kind TEXT NOT NULL DEFAULT '', file TEXT NOT NULL DEFAULT '', note TEXT DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '');
CREATE INDEX idx_inq_customer ON inquiries(customer_id);
CREATE INDEX idx_ord_customer ON orders(customer_id);
CREATE INDEX idx_rcpt_order ON receipts(order_id);
CREATE INDEX idx_doc_order ON documents(order_id);
` },
  { version: 2, sql: `
-- 获客子系统并入：与主库共用 trade.db，由 src/host/leads/db.js 建表；
-- 这里只负责给既有表补字段，让「线索 → 客户」能对上号。
ALTER TABLE customers ADD COLUMN lead_id TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN domain TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN lead_status TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN score INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN tier TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN fit TEXT DEFAULT '';
CREATE INDEX idx_cust_lead ON customers(lead_id);
CREATE INDEX idx_cust_domain ON customers(domain);
` },
  { version: 3, sql: `
-- 知识库从 kb.json 迁到 SQLite，并引入文件附件。
--
-- 为什么换库：原实现是单文件 JSON 全量读写，加附件元数据后每次改一条都要
-- 重写整库；且文件信息与文本条目混在一个数组里，查"某条目有哪些附件"只能
-- 全表扫描。分成两张表后，附件挂载、按条目过滤、按内容哈希去重都是索引查询。
--
-- kb_files.entry_id 允许为 NULL：用户可以选择先传文件、稍后再归类（散文件）。
CREATE TABLE kb_entries (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL DEFAULT 'product',
  title       TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  tags        TEXT NOT NULL DEFAULT '[]',
  version     INTEGER NOT NULL DEFAULT 1,
  source      TEXT NOT NULL DEFAULT 'user',
  created_at  TEXT NOT NULL DEFAULT '',
  updated_at  TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_kbe_type  ON kb_entries(type);
CREATE INDEX idx_kbe_updated ON kb_entries(updated_at DESC);

CREATE TABLE kb_files (
  id             TEXT PRIMARY KEY,
  entry_id       TEXT,
  name           TEXT NOT NULL,
  stored         TEXT NOT NULL,
  size           INTEGER NOT NULL DEFAULT 0,
  mime           TEXT NOT NULL DEFAULT '',
  sha256         TEXT NOT NULL,
  extract_status TEXT NOT NULL DEFAULT 'pending',
  extract_error  TEXT NOT NULL DEFAULT '',
  ocr_used       INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX idx_kbf_sha ON kb_files(sha256);
CREATE INDEX idx_kbf_entry ON kb_files(entry_id);
CREATE INDEX idx_kbf_status ON kb_files(extract_status);
` },
];