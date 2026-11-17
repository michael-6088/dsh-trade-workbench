// 领域 CRUD + 聚合，全部走参数化 SQL
import { nowIso } from "./db.ts";
import { STAGES, quoteTotal, receiptBalance } from "../shared/types.ts";

export interface DomainSpec { table: string; columns: string[]; jsonFields: string[] }
export const DOMAINS: Record<string, DomainSpec> = {
  customers: { table: "customers", columns: ["name", "country", "source", "contact", "email", "whatsapp", "tags", "note"], jsonFields: [] },
  followups: { table: "followups", columns: ["customer_id", "at", "channel", "content", "next_at"], jsonFields: [] },
  inquiries: { table: "inquiries", columns: ["customer_id", "product", "qty", "channel", "content", "status", "received_at"], jsonFields: [] },
  quotes: { table: "quotes", columns: ["no", "customer_id", "inquiry_id", "currency", "fx_rate", "items", "validity_days", "status", "note"], jsonFields: ["items"] },
  orders: { table: "orders", columns: ["no", "quote_id", "customer_id", "amount_cents", "currency", "sign_date", "delivery_date", "stage", "progress", "note"], jsonFields: ["progress"] },
  shipments: { table: "shipments", columns: ["order_id", "booking_no", "vessel", "etd", "ata", "container", "bl_no", "customs_status", "note"], jsonFields: [] },
  receipts: { table: "receipts", columns: ["order_id", "type", "amount_cents", "currency", "date", "bank_ref", "note"], jsonFields: [] },
  documents: { table: "documents", columns: ["order_id", "kind", "file", "note"], jsonFields: [] },
};
export const DOMAIN_NAMES = Object.keys(DOMAINS);

function hydrate(spec: DomainSpec, row: any) { if (!row) return row; for (const f of spec.jsonFields) { try { row[f] = JSON.parse(row[f] ?? "null"); } catch { row[f] = null; } } return row; }

export function listRows(db: any, domain: string, q: string): any[] {
  const spec = DOMAINS[domain]; if (!spec) throw bad("unknown domain");
  if (q) {
    const like = spec.columns.map(c => `${c} LIKE ?`).join(" OR ");
    const idHit = /^[0-9]+$/.test(q) ? "id = ? OR " : "";
    const sql = `SELECT * FROM ${spec.table} WHERE ${idHit}(${like}) ORDER BY id DESC LIMIT 300`;
    const params = /^[0-9]+$/.test(q) ? [Number(q), ...spec.columns.map(() => `%${q}%`)] : spec.columns.map(() => `%${q}%`);
    return db.prepare(sql).all(...params).map((r: any) => hydrate(spec, r));
  }
  const rows = db.prepare(`SELECT * FROM ${spec.table} ORDER BY id DESC LIMIT 300`).all();
  return rows.map((r: any) => hydrate(spec, r));
}
export function getRow(db: any, domain: string, id: number) {
  const spec = DOMAINS[domain]; if (!spec) throw bad("unknown domain");
  return hydrate(spec, db.prepare(`SELECT * FROM ${spec.table} WHERE id = ?`).get(id));
}
export function createRow(db: any, domain: string, body: any) {
  const spec = DOMAINS[domain]; if (!spec) throw bad("unknown domain");
  const cols = spec.columns.filter(c => body[c] !== undefined);
  const vals = cols.map(c => spec.jsonFields.includes(c) ? JSON.stringify(body[c] ?? null) : body[c]);
  if (!cols.length) throw bad("empty body");
  const created = db.prepare(`INSERT INTO ${spec.table} (${cols.join(",")}, created_at) VALUES (${cols.map(() => "?").join(",")}${spec.table === "settings" ? "" : ", ?"})`);
  let info: any;
  try { info = created.run(...vals, nowIso()); }
  catch { info = db.prepare(`INSERT INTO ${spec.table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).run(...vals); }
  return getRow(db, domain, Number(info.lastInsertRowid));
}
export function updateRow(db: any, domain: string, id: number, body: any) {
  const spec = DOMAINS[domain]; if (!spec) throw bad("unknown domain");
  const cols = spec.columns.filter(c => body[c] !== undefined);
  if (!cols.length) return getRow(db, domain, id);
  db.prepare(`UPDATE ${spec.table} SET ${cols.map(c => `${c} = ?`).join(", ")} WHERE id = ?`)
    .run(...cols.map(c => spec.jsonFields.includes(c) ? JSON.stringify(body[c]) : body[c]), id);
  return getRow(db, domain, id);
}
export function deleteRow(db: any, domain: string, id: number) {
  const spec = DOMAINS[domain]; if (!spec) throw bad("unknown domain");
  db.prepare(`DELETE FROM ${spec.table} WHERE id = ?`).run(id);
  return { ok: true };
}
function bad(message: string) { const e: any = new Error(message); e.status = 400; return e; }

export function getSettings(db: any): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of db.prepare("SELECT key, value FROM settings").all() as any[]) out[r.key] = r.value;
  return out;
}
export function putSettings(db: any, body: Record<string, string>) {
  for (const [k, v] of Object.entries(body))
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(String(k), String(v ?? ""));
  return getSettings(db);
}

export function computeDashboard(db: any) {
  const month = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);
  const count = (sql: string, ...p: any[]) => Number(db.prepare(sql).get(...p)?.n ?? 0);
  const sum = (sql: string, ...p: any[]) => Number(db.prepare(sql).get(...p)?.s ?? 0);
  const inquiriesThisMonth = count("SELECT COUNT(*) n FROM inquiries WHERE substr(created_at,1,7)=?", month);
  const inquiriesTotal = count("SELECT COUNT(*) n FROM inquiries");
  const orders = db.prepare("SELECT * FROM orders").all() as any[];
  const totalOrders = orders.length;
  const totalCustomers = count("SELECT COUNT(*) n FROM customers");
  let openCents = 0, unpaidCents = 0, overdue = 0;
  const byStage = new Map<string, number>();
  for (const s of STAGES) byStage.set(s, 0);
  for (const o of orders) {
    byStage.set(o.stage, (byStage.get(o.stage) ?? 0) + o.amount_cents);
    if (o.stage !== "closed") {
      openCents += o.amount_cents;
      const paid = sum("SELECT COALESCE(SUM(amount_cents),0) s FROM receipts WHERE order_id=? AND type!='费用'", o.id);
      unpaidCents += Math.max(0, o.amount_cents - paid);
      if (o.delivery_date && o.delivery_date < today && !["shipped", "receipt", "closed"].includes(o.stage)) overdue++;
    }
  }
  const marginRows: any[] = db.prepare("SELECT quotes.items AS items, substr(orders.sign_date,1,7) AS m FROM orders JOIN quotes ON quotes.id = orders.quote_id").all() as any[];
  const byMonth = new Map<string, { revenueCents: number; costCents: number }>();
  for (const r of marginRows) {
    if (!r.m) continue;
    let items = []; try { items = JSON.parse(r.items); } catch {}
    const t = quoteTotal({ items });
    const e = byMonth.get(r.m) ?? { revenueCents: 0, costCents: 0 };
    e.revenueCents += t.totalCents; e.costCents += t.costCents;
    byMonth.set(r.m, e);
  }
  return {
    inquiriesThisMonth, inquiryToOrderRate: inquiriesTotal ? totalOrders / inquiriesTotal : 0,
    openOrderCents: openCents, unpaidCents, overdueCount: overdue,
    revenueByStage: [...byStage.entries()].filter(([s]) => s !== "closed" && s !== "inquiry").map(([stage, cents]) => ({ stage, cents } as any)),
    marginByMonth: [...byMonth.entries()].sort().map(([month2, v]) => ({ month: month2, ...v })),
    totalCustomers, totalOrders,
  };
}

export function toOrder(db: any, quoteId: number) {
  const q = getRow(db, "quotes", quoteId);
  if (!q) throw bad("quote not found");
  const t = quoteTotal({ items: q.items ?? [] });
  const no = "PO-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + quoteId;
  const order = createRow(db, "orders", {
    no, quote_id: q.id, customer_id: q.customer_id,
    amount_cents: Math.round(t.totalCents), currency: q.currency,
    sign_date: new Date().toISOString().slice(0, 10), stage: "pi",
    progress: STAGES.map(s => ({ stage: s, done: false, at: "" })),
    note: "由报价 " + q.no + " 转入",
  });
  db.prepare("UPDATE quotes SET status='won' WHERE id=?").run(quoteId);
  return getRow(db, "orders", order.id);
}

export function orderBalance(db: any, order: any) {
  const receipts = db.prepare("SELECT * FROM receipts WHERE order_id=?").all(order.id) as any[];
  return { paidCents: receipts.filter((r: any) => r.type !== "费用").reduce((a: number, r: any) => a + r.amount_cents, 0), dueCents: receiptBalance(order.amount_cents, receipts), receipts };
}