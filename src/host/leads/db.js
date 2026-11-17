// 获客子系统的 SQLite 接入。
//
// 与工作台主库共用同一个 trade.db 文件，但由本模块单独持有连接：
// node:sqlite 的 DatabaseSync 在同一路径上重复打开会产生两个独立的 WAL
// 写者，容易在并发写时互相阻塞。因此 Host 半身通过 setLeadsDbPath()
// 把主库路径传进来，这里只开一次，crm.js 通过 getLeadsDb() 取用。
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';

/** crm.js 的 load()/save() 是同步的，而 node:sqlite 的动态 import 是异步，
 *  故用 createRequire 同步取得内建模块。 */
const require = createRequire(import.meta.url);

let handle = null;
let dbPath = null;
let unavailable = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS leads (
  id          TEXT PRIMARY KEY,
  dedup_key   TEXT,
  company     TEXT NOT NULL DEFAULT '',
  domain      TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'new',
  score       INTEGER NOT NULL DEFAULT 0,
  tier        TEXT NOT NULL DEFAULT '',
  fit         TEXT,
  created_at  TEXT NOT NULL DEFAULT '',
  updated_at  TEXT NOT NULL DEFAULT '',
  payload     TEXT NOT NULL DEFAULT '{}'
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_dedup ON leads(dedup_key) WHERE dedup_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads(domain);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_updated ON leads(updated_at DESC);

CREATE TABLE IF NOT EXISTS lead_runs (
  id          TEXT PRIMARY KEY,
  product     TEXT NOT NULL DEFAULT '',
  market      TEXT NOT NULL DEFAULT '',
  engine      TEXT NOT NULL DEFAULT '',
  total       INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT '',
  payload     TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_runs_created ON lead_runs(created_at DESC);
`;

/** Host 半身在解析出 dataDir 后调用，必须在任何 CRM 读写之前完成。 */
export function setLeadsDbPath(path) {
  dbPath = path;
  handle = null;
  unavailable = null;
}

export function leadsDbPath() {
  return dbPath;
}

/** 同步取连接；node:sqlite 在 Node >= 22.5 才有，缺失时抛出可读错误。 */
export function getLeadsDb() {
  if (handle !== null) {
    return handle;
  }
  if (unavailable !== null) {
    throw unavailable;
  }
  if (dbPath === null) {
    unavailable = new Error('leads db path not configured: call setLeadsDbPath() first');
    throw unavailable;
  }
  let sqlite;
  try {
    sqlite = require('node:sqlite');
  } catch {
    sqlite = null;
  }
  if (!sqlite?.DatabaseSync) {
    unavailable = new Error('node:sqlite 不可用：需要 Node >= 22.5 的宿主');
    throw unavailable;
  }
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new sqlite.DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);
  handle = db;
  return handle;
}

/** 仅测试用：关掉连接并清空缓存。 */
export function closeLeadsDb() {
  if (handle !== null) {
    try {
      handle.close();
    } catch {
      // 已关闭
    }
  }
  handle = null;
}
