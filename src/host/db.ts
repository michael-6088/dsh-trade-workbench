import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { MIGRATIONS } from "./schema.ts";
type DB = any;
export async function openDatabase(dbPath: string): Promise<DB> {
  mkdirSync(dirname(dbPath), { recursive: true });
  const sqlite: any = await import("node:sqlite").catch(() => null);
  if (!sqlite?.DatabaseSync) throw new Error("node:sqlite 不可用：需要 Node >= 22.5 的宿主");
  const db = new sqlite.DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  const row: any = db.prepare("PRAGMA user_version").get?.() ?? db.prepare("SELECT * FROM pragma_user_version").get?.() ?? { user_version: 0 };
  let version = Number(row?.user_version ?? 0);
  for (const m of MIGRATIONS) {
    if (m.version <= version) continue;
    db.exec("BEGIN"); try { db.exec(m.sql); db.exec(`PRAGMA user_version = ${m.version}`); db.exec("COMMIT"); version = m.version; }
    catch (e) { db.exec("ROLLBACK"); throw e; }
  }
  return db;
}
export function nowIso(): string { return new Date().toISOString().slice(0, 19).replace("T", " "); }
