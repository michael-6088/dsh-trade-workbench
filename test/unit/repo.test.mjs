import { test } from "node:test";
import assert from "node:assert";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rmSync } from "node:fs";
import { openDatabase } from "../../src/host/db.ts";
import { createRow, updateRow, deleteRow, listRows, getRow, computeDashboard, toOrder, orderBalance, getSettings, putSettings, DOMAINS } from "../../src/host/repo.ts";

const iso = (d = new Date()) => d.toISOString().slice(0, 19).replace("T", " ");

async function fresh() {
  const db = await openDatabase(":memory:");
  return { db, cleanup: () => { try { db.close(); } catch {} } };
}

test("customers CRUD", async () => {
  const { db, cleanup } = await fresh();
  const c = createRow(db, "customers", { name: "ACME", country: "US", email: "a@b.co" });
  assert.ok(c.id > 0);
  assert.equal(c.name, "ACME");
  assert.ok(c.created_at);
  const u = updateRow(db, "customers", c.id, { country: "DE" });
  assert.equal(u.country, "DE");
  assert.equal(u.email, "a@b.co");
  const rows = listRows(db, "customers", "");
  assert.equal(rows.length, 1);
  assert.deepEqual(deleteRow(db, "customers", c.id), { ok: true });
  assert.equal(getRow(db, "customers", c.id), undefined);
  cleanup();
});

test("quotes items JSON 与转订单", async () => {
  const { db, cleanup } = await fresh();
  const c = createRow(db, "customers", { name: "X" });
  const q = createRow(db, "quotes", { no: "Q1", customer_id: c.id, currency: "USD", fx_rate: 7.2, items: [{ name: "A", qty: 2, price: 10, cost: 6 }], validity_days: 30, status: "draft" });
  assert.deepEqual(q.items, [{ name: "A", qty: 2, price: 10, cost: 6 }]);
  const o = toOrder(db, q.id);
  assert.equal(o.amount_cents, 2000);
  assert.equal(getRow(db, "quotes", q.id).status, "won");
  const bal = orderBalance(db, o);
  assert.equal(bal.dueCents, 2000);
  createRow(db, "receipts", { order_id: o.id, type: "定金", amount_cents: 600, currency: "USD", date: iso().slice(0, 10) });
  assert.equal(orderBalance(db, o).dueCents, 1400);
  cleanup();
});

test("搜索命中 id 与名称", async () => {
  const { db, cleanup } = await fresh();
  const c = createRow(db, "customers", { name: "BigBuyer" });
  assert.equal(listRows(db, "customers", "Big").length, 1);
  assert.equal(listRows(db, "customers", String(c.id)).length, 1);
  assert.equal(listRows(db, "customers", "zzz").length, 0);
  cleanup();
});

test("dashboard 聚合与 settings", async () => {
  const { db, cleanup } = await fresh();
  const c = createRow(db, "customers", { name: "A" });
  createRow(db, "inquiries", { product: "P", qty: 1, channel: "web", status: "new" });
  const q = createRow(db, "quotes", { no: "Q2", customer_id: c.id, items: [{ name: "P", qty: 1, price: 100, cost: 60 }] });
  const o = toOrder(db, q.id);
  updateRow(db, "orders", o.id, { delivery_date: "2020-01-01", stage: "pi" });
  const d = computeDashboard(db);
  assert.equal(d.totalOrders, 1);
  assert.equal(d.openOrderCents, 10000);
  assert.equal(d.unpaidCents, 10000);
  assert.equal(d.overdueCount, 1);
  assert.equal(d.inquiryToOrderRate, 1);
  const s = putSettings(db, { company: "MY CORP", ai_base: "https://x" });
  assert.equal(getSettings(db).company, "MY CORP");
  cleanup();
});

test("未知 domain 抛 400", async () => {
  const { db, cleanup } = await fresh();
  assert.throws(() => listRows(db, "nope", ""), (e) => e.status === 400);
  cleanup();
});