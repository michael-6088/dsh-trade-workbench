import { test } from "node:test";
import assert from "node:assert";
import { quoteTotal, receiptBalance, STAGES } from "../../src/shared/types.ts";

test("quoteTotal 合计与毛利率", () => {
  const t = quoteTotal({ items: [{ name: "A", qty: 10, price: 5.5, cost: 4 }, { name: "B", qty: 2, price: 20, cost: 12 }] });
  assert.equal(t.totalCents, 9500);
  assert.equal(t.costCents, 6400);
  assert.equal(t.marginCents, 3100);
  assert.ok(Math.abs(t.marginRate - 3100 / 9500) < 1e-9);
});
test("空明细", () => {
  assert.deepEqual(quoteTotal({ items: [] }), { totalCents: 0, costCents: 0, marginCents: 0, marginRate: 0 });
});
test("receiptBalance 忽略费用", () => {
  const b = receiptBalance(10000, [
    { type: "定金", amount_cents: 3000 }, { type: "费用", amount_cents: 500 }, { type: "尾款", amount_cents: 7000 },
  ]);
  assert.equal(b, 0);
});
test("STAGES 顺序", () => {
  assert.equal(STAGES[0], "inquiry");
  assert.equal(STAGES[STAGES.length - 1], "closed");
});
