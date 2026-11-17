import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { accessSync, constants, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { openDatabase } from "./db.ts";
import { DOMAIN_NAMES, computeDashboard, createRow, deleteRow, getRow, getSettings, listRows, orderBalance, putSettings, toOrder, updateRow } from "./repo.ts";
import { renderPi } from "./export.ts";
import { aiChat } from "./ai.ts";

export interface TradeConfig {
  /** 数据目录；为空时用插件目录下的 data/。 */
  dataDir?: string;
  /** 把 ~/.dsh/trade-workbench 的旧数据自动搬到新目录（仅当新目录还没有库时）。 */
  migrateLegacy?: boolean;
  /** 获客工具名前缀，默认 "twb_"。传空串还原为上游原始名（如 lead_search）。 */
  toolPrefix?: string;
  /** 是否启动获客定时任务（序列执行、回复扫描、官网监控）。默认 true。 */
  leadsCron?: boolean;
  /** 首次启动时把旧 ~/.waimao 数据导入工作台。默认 true。 */
  migrateLeads?: boolean;
}

/**
 * 传输层注册在 Connection 的共享 /api 通道上（ctx.connection.fetch），而不是自建 webServer 前缀路由。
 *
 * 为什么：Connection 的精确 Fetch 路由是**载体无关**的 — Web 载体把同一份 handler 交给 HTTP bridge，
 * 桌面（Electron）载体由 shell 直接分派同一个 handler，且统一套用 Host/Origin 围栏与浏览器认证。
 * webServer 前缀路由只在"存在 Web 服务器"时可用，是载体耦合的写法。
 *
 * 由于 exact 路由按路径精确匹配（不能含动态 id），全部业务操作收敛到一个 RPC 端点：
 *   POST /api/trade-workbench/rpc  { op, domain?, id?, action?, body?, q?, messages? }
 * 需要浏览器直接打开/下载的仍保留独立 GET 路由（PI 打印、单证下载）。
 */
const P = "/api/trade-workbench";

function json(status: number, body: any): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
function failure(err: any): Response {
  const status = Number(err?.status ?? 500);
  return json(status, { error: { code: status >= 500 ? "internal" : "bad_request", message: String(err?.message ?? err) } });
}
function badRequest(message: string, status = 400): Error {
  const e: any = new Error(message);
  e.status = status;
  return e;
}
async function readJson(request: Request): Promise<any> {
  const type = request.headers.get("content-type") ?? "";
  const text = await request.text();
  if (!text) return {};
  if (type.includes("application/json")) {
    try { return JSON.parse(text); } catch { throw badRequest("invalid JSON body"); }
  }
  const out: Record<string, string> = {};
  for (const [k, v] of new URLSearchParams(text)) out[k] = v;
  return out;
}
async function readForm(request: Request): Promise<{ fields: Record<string, string>; files: { filename: string; data: Buffer }[] }> {
  const form = await request.formData();
  const fields: Record<string, string> = {};
  const files: { filename: string; data: Buffer }[] = [];
  for (const [k, v] of form.entries()) {
    if (typeof v === "string") fields[k] = v;
    else files.push({ filename: (v as File).name, data: Buffer.from(await (v as File).arrayBuffer()) });
  }
  return { fields, files };
}

export const inject = ["connection"];

/**
 * 默认数据目录 = 插件包目录下的 data/。
 * lib/index.js 位于 <包根>/lib/，所以包根是 dirname(dirname(import.meta.url))。
 */
export function defaultDataDir(): string {
  try {
    return join(dirname(dirname(fileURLToPath(import.meta.url))), "data");
  } catch {
    return join(homedir(), ".dsh", "trade-workbench");
  }
}

/** 目录是否可写；不可写（如装在只读路径）时回退到 DSH_HOME。 */
function writable(dir: string): boolean {
  try { mkdirSync(dir, { recursive: true }); accessSync(dir, constants.W_OK); return true; }
  catch { return false; }
}

/** 旧位置（~/.dsh/trade-workbench）；仅在显式要求迁移时读取。 */
function legacyDir(): string { return join(homedir(), ".dsh", "trade-workbench"); }

function migrateLegacy(oldDir: string, newDir: string): { moved: boolean; reason?: string } {
  const from = join(oldDir, "trade.db");
  const to = join(newDir, "trade.db");
  if (!existsSync(from)) return { moved: false, reason: "no-legacy-db" };
  if (existsSync(to)) return { moved: false, reason: "target-exists" };
  try {
    // 不能只 copyFile 主库：WAL 模式下最近提交还在 -wal 里，复制会丢数据。
    // 用 VACUUM INTO 让 SQLite 自己写出一份一致且已合并 WAL 的快照。
    const sqlite: any = (globalThis as any).process?.getBuiltinModule?.("node:sqlite");
    if (!sqlite?.DatabaseSync) return { moved: false, reason: "sqlite-unavailable" };
    const src = new sqlite.DatabaseSync(from, { readOnly: true });
    try {
      src.exec("PRAGMA wal_checkpoint(TRUNCATE)");
      src.prepare("VACUUM INTO ?").run(to);
    } finally {
      try { src.close(); } catch {}
    }
    return { moved: true };
  } catch (e: any) {
    return { moved: false, reason: String(e?.message ?? e) };
  }
}

export function apply(ctx: any, config: TradeConfig = {}): void {
  const preferred = config.dataDir?.trim() || process.env.DSH_TRADE_WORKBENCH_DIR?.trim() || defaultDataDir();
  const dataDir = writable(preferred) ? preferred : writable(legacyDir()) ? legacyDir() : preferred;
  const fellBack = dataDir !== preferred;
  mkdirSync(join(dataDir, "files"), { recursive: true });
  const migration = config.migrateLegacy === false || fellBack
    ? { moved: false, reason: "skipped" }
    : migrateLegacy(legacyDir(), dataDir);
  const dbPath = join(dataDir, "trade.db");
  let db: any = null;
  const ready = async (): Promise<any> => db ?? (db = await openDatabase(dbPath));

  // ---- 获客子系统装载 ------------------------------------------------
  // 必须在任何 leads/* 模块被 import 之前把数据根钉好：config.js 在模块
  // 顶层就用它构造文件名常量，晚于首次 import 再设就无效了。
  process.env.DSH_TRADE_WORKBENCH_DIR = dataDir;
  let leadsReady: Promise<{ tools: string[] }> | null = null;
  /** 旧 ~/.waimao 导入结果，挂到 /health 让前端与排查都能看到。 */
  let leadsMigration: any = null;
  const loadLeads = async () => {
    if (leadsReady) return leadsReady;
    leadsReady = (async () => {
      // 这里必须用「字面量动态 import」：esbuild 才能静态分析出依赖并把
      // leads/ 下的 45 个模块内联进 lib/index.js。若改成变量路径，
      // 打包器会当作外部模块放过，运行时就会去 lib/leads/ 找文件而失败。
      // 数据目录已在上面通过环境变量钉好，此时 import 是安全的。
      // @ts-expect-error leads/ 是原样 fork 的纯 JS，无声明文件
      const leadsDb: any = await import("./leads/db.js");
      // 复用主库连接而不是再开一个：同文件双开会产生两个 WAL 写者，
      // 并发写时互相 BUSY。主库这时可能还没打开（懒加载），
      // 因此先 ready() 拿到句柄再交接。
      const mainDb = await ready();
      leadsDb.adoptLeadsDb(mainDb);
      if (config.migrateLeads !== false) {
        try {
          // @ts-expect-error 同上
          const mig: any = await import("./leads/migrate.js");
          leadsMigration = mig.migrateLegacyWaimao();
        } catch (e: any) {
          leadsMigration = { skipped: true, reason: String(e?.message ?? e), errors: [] };
        }
      }
      // @ts-expect-error 同上
      const leadsIndex: any = await import("./leads/index.js");
      const result = leadsIndex.registerLeadsPlugin(ctx, {
        prefix: config.toolPrefix ?? "twb_",
        startCron: config.leadsCron !== false,
      });
      return { tools: result.tools as string[] };
    })();
    return leadsReady;
  };
  // 立即触发（不 await）：工具应尽早可见；失败不阻塞主工作台。
  const loadLeadsStarted = loadLeads().catch((e: any) => {
    console.error("[trade-workbench] leads subsystem failed:", e?.message ?? e);
    return { tools: [] as string[] };
  });

  let leadsRpcCache: any = null;
  const getLeadsRpc = async (): Promise<any> => {
    if (leadsRpcCache) return leadsRpcCache;
    await loadLeadsStarted;
    // @ts-expect-error 同上
    const rpcMod: any = await import("./leads/rpc.js");
    // 线索转客户要把档案落进主库的 customers 表：leads/ 不该反向依赖
    // repo 层，故在此注入一个 createRow 包一层。
    leadsRpcCache = rpcMod.createLeadsRpc({
      createCustomer: async (payload: any) => {
        const handle = await ready();
        return createRow(handle, "customers", payload);
      },
    });
    return leadsRpcCache;
  };

  async function dispatch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();
    try {
      if (path === P + "/health") {
        return json(200, {
          ok: true, version: "0.2.0", storage: db ? "sqlite" : "lazy", transport: "connection.fetch",
          dbPath, dataDir, fallbackToHome: fellBack, legacyMigration: migration,
          leadsMigration, leadsTools: leadsReady ? undefined : "pending",
        });
      }
      const d = await ready();

      // PI 打印视图：浏览器直接打开，故保留独立 GET
      if (path === P + "/export/pi" && method === "GET") {
        const piId = Number(url.searchParams.get("id") ?? 0);
        const quote = piId ? getRow(d, "quotes", piId) : null;
        if (!quote) return json(404, { error: { code: "not_found", message: "quote not found" } });
        const customer = quote.customer_id ? getRow(d, "customers", quote.customer_id) : null;
        return new Response(renderPi(quote, customer, getSettings(d)), {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8", "content-disposition": 'inline; filename="PI-' + quote.no + '.html"' },
        });
      }
      // 单证下载：浏览器直开，故保留独立 GET
      if (path === P + "/files" && method === "GET") {
        const name = String(url.searchParams.get("name") ?? "").replace(/[\\/]/g, "");
        try {
          const data = readFileSync(join(dataDir, "files", name));
          return new Response(data, {
            status: 200,
            headers: { "content-type": "application/octet-stream", "content-disposition": 'attachment; filename="' + encodeURIComponent(name) + '"' },
          });
        } catch { return json(404, { error: { code: "not_found", message: "file not found" } }); }
      }
      // 单证上传：multipart，走同一条 rpc 入口
      if (path === P + "/upload" && method === "POST") {
        const { fields, files } = await readForm(request);
        const file = files.find((f) => f.data.length);
        const order = Number(fields.order_id ?? 0);
        if (!file || !order) throw badRequest("file and order_id required");
        const safe = String(file.filename ?? "doc").replace(/[^A-Za-z0-9._-]/g, "_").slice(-80);
        const stored = Date.now() + "-" + safe;
        writeFileSync(join(dataDir, "files", stored), file.data);
        return json(200, createRow(d, "documents", { order_id: order, kind: fields.kind ?? "other", file: stored, note: fields.note ?? "" }));
      }

      // 知识库文件上传：multipart，一次一个文件
      if (path === P + "/kb-upload" && method === "POST") {
        const { fields, files } = await readForm(request);
        const file = files.find((f) => f.data.length);
        if (!file) throw badRequest("file required");
        // @ts-expect-error leads/ 是纯 JS
        const { uploadFile } = await import("./leads/kbFiles.js");
        const result = await uploadFile({
          buffer: file.data,
          name: String(file.filename ?? fields.name ?? "upload"),
          entryId: fields.entryId ? String(fields.entryId) : undefined,
          fileOnly: fields.fileOnly === "1",
          type: fields.type ? String(fields.type) : undefined,
          force: fields.force === "1",
        });
        return json(200, result);
      }

      // 知识库文件下载/预览。
      // Connection 的 fetch 路由只做精确 path 匹配（无前缀/通配），
      // 因此文件 id 走查询参数而不是路径段。
      if (path === P + "/kb-file" && method === "GET") {
        const id = url.searchParams.get("id") ?? "";
        if (!id) throw badRequest("id required");
        // @ts-expect-error 同上
        const kbFilesMod: any = await import("./leads/kbFiles.js");
        const { file, buffer } = kbFilesMod.readFileBytes(id);
        return new Response(buffer, {
          status: 200,
          headers: {
            "content-type": file.mime || "application/octet-stream",
            "content-disposition": 'inline; filename="' + encodeURIComponent(file.name) + '"',
            "cache-control": "private, max-age=300",
          },
        });
      }

      // 统一 RPC 入口
      if (path === P + "/rpc") {
        if (method !== "POST") return json(405, { error: { code: "method_not_allowed", message: method } });
        const req: any = await readJson(request);
        const op = String(req.op ?? "");
        const domain = String(req.domain ?? "");
        // 需要 domain 的操作才校验白名单；dashboard/settings/ai/to-order/balance 不需要。
        const NEEDS_DOMAIN = ["list", "get", "create", "update", "delete"];
        if (NEEDS_DOMAIN.includes(op) && !DOMAIN_NAMES.includes(domain)) {
          return json(400, { error: { code: "bad_request", message: "unknown domain " + JSON.stringify(domain) } });
        }
        switch (op) {
          case "dashboard": return json(200, computeDashboard(d));
          case "settings":
            if (req.body === undefined) return json(200, getSettings(d));
            return json(200, putSettings(d, req.body ?? {}));
          case "ai": return json(200, await aiChat(getSettings(d), Array.isArray(req.messages) ? req.messages : []));
          case "list": return json(200, listRows(d, domain, String(req.q ?? "")));
          case "get": return json(200, getRow(d, domain, Number(req.id)) ?? null);
          case "create": return json(200, createRow(d, domain, req.body ?? {}));
          case "update": return json(200, updateRow(d, domain, Number(req.id), req.body ?? {}));
          case "delete": return json(200, deleteRow(d, domain, Number(req.id)));
          case "to-order": return json(200, toOrder(d, Number(req.id)));
          case "balance": return json(200, orderBalance(d, getRow(d, "orders", Number(req.id))));
          default: {
            // 获客子系统：op 含 "/" 的走 leads 分派器，与上面 8 个通用 op 不冲突。
            if (op.includes("/")) {
              await loadLeadsStarted;
              const leadsRpc = await getLeadsRpc();
              if (!leadsRpc.has(op)) {
                return json(400, { error: { code: "bad_request", message: "unknown op " + op } });
              }
              const value = await leadsRpc.run(op, req.args ?? req.body ?? {});
              return json(200, value ?? null);
            }
            return json(400, { error: { code: "bad_request", message: "unknown op " + op } });
          }
        }
      }
      return json(404, { error: { code: "not_found", message: "no such route: " + path } });
    } catch (err: any) {
      if (/node:sqlite/.test(String(err?.message))) return json(503, { error: { code: "storage_unavailable", message: String(err.message) } });
      return failure(err);
    }
  }

  // 精确路由：Connection 只按完整路径匹配，因此每条路由单独注册。
  const exact: { path: string; methods: ("GET" | "HEAD" | "POST")[] }[] = [
    { path: P + "/health", methods: ["GET", "HEAD"] },
    { path: P + "/rpc", methods: ["POST"] },
    { path: P + "/upload", methods: ["POST"] },
    { path: P + "/kb-upload", methods: ["POST"] },
    { path: P + "/kb-file", methods: ["GET"] },
    { path: P + "/export/pi", methods: ["GET"] },
    { path: P + "/files", methods: ["GET"] },
  ];
  for (const route of exact) {
    ctx.effect(() => ctx.connection.fetch.register({
      path: route.path,
      methods: route.methods,
      requestBody: "buffered",
      fetch: (request: Request) => dispatch(request),
    }), "trade-workbench: " + route.path);
  }
}