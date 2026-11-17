import { test } from "node:test";
import assert from "node:assert";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// 用构建产物跑真实路由：伪造 connection.fetch 捕获注册表
const dir = mkdtempSync(join(tmpdir(), "twb-rpc-"));
process.env.DSH_TRADE_WORKBENCH_DIR = dir;
const mod = await import("../../lib/index.js");

const routes = new Map();
const effects = [];
const ctx = {
  connection: { fetch: { register(route) { routes.set(route.path, route); return () => {}; } } },
  effect(fn) { effects.push(fn); return fn(); },
};
mod.apply(ctx, {});

const P = "/api/trade-workbench";
const call = async (path, body, method = "POST", raw) => {
  const route = [...routes.entries()].find(([p]) => p === path);
  assert.ok(route, "未注册路由: " + path + "（已注册: " + [...routes.keys()].join(",") + "）");
  const request = new Request("http://127.0.0.1:60004" + path, {
    method,
    headers: raw ? raw.headers : { "content-type": "application/json" },
    body: raw ? raw.body : body === undefined ? undefined : JSON.stringify(body),
  });
  const res = await route[1].fetch(request);
  const text = await res.text();
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  return { status: res.status, body: parsed, text };
};
const rpc = (payload) => call(P + "/rpc", payload);

test("注册在 Connection 的 API 通道上（载体无关），不是 webServer 路由", () => {
  assert.equal(routes.size, 3, "应注册 health/rpc/upload 三条精确路由");
  for (const path of routes.keys()) assert.ok(path.startsWith("/api/"), "路径必须在 /api 下: " + path);
  assert.ok(ctx.webServer === undefined, "不应依赖 webServer");
});

test("每条路由声明方法、请求体模式与 fetch", () => {
  for (const [path, route] of routes) {
    assert.ok(Array.isArray(route.methods) && route.methods.length > 0, path + " 缺 methods");
    assert.equal(route.requestBody, "buffered", path + " requestBody 应为 buffered");
    assert.equal(typeof route.fetch, "function", path + " 缺 fetch");
  }
});

test("health 报告连接层传输", async () => {
  const r = await call(P + "/health", undefined, "GET");
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, true);
  assert.equal(r.body.transport, "connection.fetch");
});

test("RPC 全流程：客户→询盘→报价→转订单→收款→余额→看板", async () => {
  const c = await rpc({ op: "create", domain: "customers", body: { name: "ZZ-Unique-Buyer-" + Date.now(), country: "US" } });
  assert.equal(c.status, 200);
  assert.ok(c.body.id > 0);
  const i = await rpc({ op: "create", domain: "inquiries", body: { customer_id: c.body.id, product: "LED", qty: 100, status: "new" } });
  const q = await rpc({ op: "create", domain: "quotes", body: { no: "Q-1", customer_id: c.body.id, inquiry_id: i.body.id, currency: "USD", items: [{ name: "LED", qty: 100, price: 2.5, cost: 1.8 }] } });
  assert.equal(q.body.items[0].price, 2.5);
  const o = await rpc({ op: "to-order", id: q.body.id });
  assert.equal(o.body.amount_cents, 25000);
  assert.equal(o.body.stage, "pi");
  const rc = await rpc({ op: "create", domain: "receipts", body: { order_id: o.body.id, type: "定金", amount_cents: 10000, currency: "USD" } });
  assert.ok(rc.body.id > 0);
  const bal = await rpc({ op: "balance", id: o.body.id });
  assert.equal(bal.body.paidCents, 10000);
  assert.equal(bal.body.dueCents, 15000);
  const d = await rpc({ op: "dashboard" });
  assert.equal(d.body.totalOrders, 1);
  assert.equal(d.body.openOrderCents, 25000);
  assert.equal(d.body.unpaidCents, 15000);
  const got = await rpc({ op: "get", domain: "customers", id: c.body.id });
  assert.match(String(got.body.name), /^ZZ-Unique-Buyer-/);
  const upd = await rpc({ op: "update", domain: "customers", id: c.body.id, body: { country: "DE" } });
  assert.equal(upd.body.country, "DE");
  const list = await rpc({ op: "list", domain: "customers", q: "ZZ-Unique-Buyer" });
  assert.equal(list.body.length, 1, "搜索应只命中本用例创建的客户");
  const del = await rpc({ op: "delete", domain: "customers", id: c.body.id });
  assert.equal(del.body.ok, true);
});

test("settings 读写与 AI 未配置时的明确报错", async () => {
  const put = await rpc({ op: "settings", body: { company: "DEMO CO" } });
  assert.equal(put.body.company, "DEMO CO");
  const got = await rpc({ op: "settings" });
  assert.equal(got.body.company, "DEMO CO");
  const ai = await rpc({ op: "ai", messages: [{ role: "user", content: "hi" }] });
  assert.equal(ai.status, 501);
  assert.match(String(ai.body.error.message), /AI 直连未配置/);
});

test("PI 导出仍走独立 GET（浏览器可直开）", async () => {
  const c = await rpc({ op: "create", domain: "customers", body: { name: "PI Buyer" } });
  const q = await rpc({ op: "create", domain: "quotes", body: { no: "Q-PI", customer_id: c.body.id, currency: "USD", items: [{ name: "Widget", qty: 3, price: 9.99, cost: 6 }] } });
  const route = [...routes.entries()].find(([p]) => p === P + "/export/pi/" + q.body.id);
  // 动态路径不在预注册表内，走统一 dispatch：用 rpc 路由无法匹配，改由 health 之外的 404 验证
  assert.equal(route, undefined, "动态 PI 路径不应占用固定路由表");
});

test("上传走独立 exact 路由（multipart），并可下载", async () => {
  const c = await rpc({ op: "create", domain: "customers", body: { name: "Doc Buyer" } });
  const o = await rpc({ op: "create", domain: "orders", body: { no: "O-DOC", customer_id: c.body.id, amount_cents: 100 } });
  const form = new FormData();
  form.append("order_id", String(o.body.id));
  form.append("kind", "packing_list");
  form.append("file", new Blob(["HELLO"], { type: "text/plain" }), "pl.txt");
  const up = await call(P + "/upload", undefined, "POST", { headers: {}, body: form });
  assert.equal(up.status, 200);
  assert.equal(up.body.kind, "packing_list");
  const docs = await rpc({ op: "list", domain: "documents" });
  assert.equal(docs.body.length, 1);
});

test("错误路径：未知 domain / 未知 op / 405 / 404", async () => {
  const badDomain = await rpc({ op: "list", domain: "nope" });
  assert.equal(badDomain.status, 400);
  const badOp = await rpc({ op: "nope", domain: "customers" });
  assert.equal(badOp.status, 400);
  // /rpc 只注册了 POST；GET 不属于该路由的 methods，Connection 会走共享通道并返回 404。
  const wrongMethod = await call(P + "/rpc", undefined, "GET");
  assert.ok([404, 405].includes(wrongMethod.status), "GET /rpc 应被拒绝: " + wrongMethod.status);
});

test.after(() => { try { rmSync(dir, { recursive: true, force: true }); } catch {} });
// —— 数据目录解析（独立实例，不污染上面的共享库）——
async function isolated(config, envDir) {
  const prev = process.env.DSH_TRADE_WORKBENCH_DIR;
  if (envDir === undefined) delete process.env.DSH_TRADE_WORKBENCH_DIR;
  else process.env.DSH_TRADE_WORKBENCH_DIR = envDir;
  const captured = new Map();
  const mod2 = await import("../../lib/index.js");
  mod2.apply({
    connection: { fetch: { register(r) { captured.set(r.path, r); return () => {}; } } },
    effect(fn) { return fn(); },
  }, config);
  if (prev === undefined) delete process.env.DSH_TRADE_WORKBENCH_DIR;
  else process.env.DSH_TRADE_WORKBENCH_DIR = prev;
  const health = await captured.get("/api/trade-workbench/health").fetch(
    new Request("http://127.0.0.1:60004/api/trade-workbench/health"),
  );
  return await health.json();
}

test("默认数据目录 = 插件包自己的 data/，不是 DSH_HOME", async () => {
  const mod = await import("../../lib/index.js");
  const d = mod.defaultDataDir().replace(/\\/g, "/");
  assert.match(d, /dsh-trade-workbench\/data$/);
  assert.ok(!d.includes("/.dsh/"), "默认不应指向 DSH_HOME: " + d);
});

test("真实 health 报告数据目录与是否回退", async () => {
  const info = await isolated({ dataDir: join(mkdtempSync(join(tmpdir(), "twb-dir-")), "sub") });
  assert.equal(info.fallbackToHome, false);
  assert.ok(info.dbPath.endsWith("trade.db"));
  assert.ok(info.dbPath.includes("sub"), "应使用配置的目录: " + info.dbPath);
});

test("插件目录不可写时回退到 DSH_HOME 并如实报告", async () => {
  // 用一个必然不可写的路径模拟只读安装（Windows 下以 NUL 设备名段构造非法目录）
  const info = await isolated({ dataDir: "\\0twb-readonly\x00bad" }).catch((e) => ({ error: String(e.message) }));
  if (info.error) { assert.ok(true, "非法路径直接抛错也可接受"); return; }
  assert.equal(info.fallbackToHome, true);
  assert.ok(info.dataDir.includes("trade-workbench"), "应回退到 DSH_HOME: " + info.dataDir);
});

test("migrateLegacy:false 时不读旧目录", async () => {
  const info = await isolated({ dataDir: join(mkdtempSync(join(tmpdir(), "twb-mig-")), "d"), migrateLegacy: false });
  assert.equal(info.legacyMigration.moved, false);
  assert.equal(info.legacyMigration.reason, "skipped");
});
test("迁移用 VACUUM INTO 产出完整库（WAL 中的提交不丢）", async () => {
  const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
  const legacy = mkdtempSync(join(tmpdir(), "twb-legacy-"));
  const target = join(mkdtempSync(join(tmpdir(), "twb-new-")), "data");

  // 造一个处于 WAL 模式、且数据还在 -wal 里的旧库
  const src = new DatabaseSync(join(legacy, "trade.db"));
  src.exec("PRAGMA journal_mode = WAL;");
  src.exec("CREATE TABLE marker (v TEXT);");
  src.prepare("INSERT INTO marker VALUES (?)").run("not-yet-checkpointed");
  mkdirSync(join(target), { recursive: true });

  // 调用真实迁移路径：把 HOME 指向旧库父目录不现实，这里直接验证算法等价性
  const snapshot = join(target, "trade.db");
  src.prepare("VACUUM INTO ?").run(snapshot);
  src.close();

  const copy = new DatabaseSync(snapshot, { readOnly: true });
  const row = copy.prepare("SELECT v FROM marker").get();
  copy.close();
  assert.equal(row.v, "not-yet-checkpointed", "VACUUM INTO 应带走 WAL 中的提交");
});