# 开发说明

## 架构

```
┌─ Client 半身（浏览器，React）────────────────────────┐
│  App.tsx       13 个 Tab，四组导航：获客/触达/经营/分析 │
│  panels/*      各业务面板                              │
│  api.ts        所有读写 → POST /api/trade-workbench/rpc│
└───────────────────────┬──────────────────────────────┘
                        │ 同源 fetch
┌───────────────────────▼──────────────────────────────┐
│ Host 半身（Node）                                      │
│  index.ts      数据目录解析、工具注册、RPC 分派         │
│  ├─ 通用 op    dashboard/settings/list/get/create…     │
│  └─ 获客 op    含 "/" 的走 leads/rpc.js（49 个）        │
│                                                        │
│  leads/        获客子系统（fork 自 dsh-waimao v0.8.0）  │
│  ├─ index.js   54 个工具 → registerLeadsPlugin()       │
│  ├─ rpc.js     RPC 分派器                              │
│  ├─ db.js      leads / lead_runs 表                    │
│  ├─ migrate.js 旧 ~/.waimao 导入                       │
│  └─ 41 个业务模块                                      │
│                                                        │
│  trade.db      SQLite：订单/单证/收汇 + leads/lead_runs │
└────────────────────────────────────────────────────────┘
```

## 传输层选择

所有业务收敛到 `ctx.connection.fetch.register` 的精确路由：

| 路由 | 用途 |
|---|---|
| `POST /api/trade-workbench/rpc` | 全部业务读写（含获客 49 个 op） |
| `GET /api/trade-workbench/health` | 健康检查，含迁移结果 |
| `POST /api/trade-workbench/upload` | 单证上传（multipart） |
| `GET /api/trade-workbench/export/pi/:id` | PI 打印视图 |
| `GET /api/trade-workbench/files/:name` | 单证下载 |

**为什么不用 webServer 前缀路由**：`ctx.connection.fetch` 是载体无关的——Web 载体把它交给 HTTP bridge，Electron 载体由 shell 直接分派同一 handler，且统一套用浏览器认证。`webServer` 前缀路由只在"存在 Web 服务器"时可用，是载体耦合写法，且会绕过认证。

**代价**：exact 路由按完整路径匹配，不能含动态段，因此业务操作全部收敛到单个 `/rpc` 端点，用 `op` 字段区分。

## 数据目录

解析优先级：

1. 配置项 `dataDir`
2. 环境变量 `DSH_TRADE_WORKBENCH_DIR`
3. `<包根>/data/`
4. 不可写则回退 `~/.dsh/trade-workbench/`

获客子系统的数据根 = `<dataDir>/leads/`，通过环境变量在 `apply()` 中钉好，**必须早于任何 `leads/*` 模块被 import**——`config.js` 在模块顶层就用它构造文件名常量（`DATA_DIR`/`CONFIG_PATH` 参与 `join()`），晚设无效。

```js
// index.ts 的 apply()
process.env.DSH_TRADE_WORKBENCH_DIR = dataDir;
const leadsDb = await import("./leads/db.js");   // 此时才解析路径
```

## 打包约束

**动态 import 必须用字符串字面量**：

```ts
// ✅ esbuild 能静态分析，把 leads/ 的 45 个模块内联进 lib/index.js
await import("./leads/db.js");

// ❌ esbuild 当作外部模块放过，运行时去 lib/leads/ 找文件 → MODULE_NOT_FOUND
const p = "./leads/db.js"; await import(p);
```

这个坑实测踩过：产物只有 26KB 且 `npm test` 报 `leads subsystem failed`。改用字面量后产物 395KB，45 个模块全内联。

`src/host/leads/**` 是纯 JS，不参与 tsc（`tsconfig.json` 只 include `*.ts`/`*.tsx`）。导入点用 `@ts-expect-error` 标注：

```ts
// @ts-expect-error leads/ 是原样 fork 的纯 JS，无声明文件
const leadsDb: any = await import("./leads/db.js");
```

**为什么不改成 .ts**：实测把 45 个模块改 `.ts` 后 `tsc` 报 1392 个隐式 any 错误，逐行补标注对 1.1 万行代码收益为零，且后续同步上游 diff 会变得极其困难。

## SQLite 接入

获客子系统与主库共用 `trade.db`，但由 `leads/db.js` 单独持有连接——`node:sqlite` 的 `DatabaseSync` 在同一路径重复打开会产生两个 WAL 写者，容易互相阻塞。

CRM 的表设计：整条线索以 JSON blob 存 `payload` 列，同时把去重与筛选要用的字段（`dedup_key`/`status`/`score`/`domain`）抽成独立列建索引。这样 462 行业务逻辑（合并、活动流、批量操作）一行都不用改，只替换 `load()`/`save()` 两个函数。

```js
// crm.js — 唯一的存储改造点
function load() { /* SELECT payload FROM leads → JSON.parse */ }
function save(state) { /* 事务内 upsert 全量 + 删除已移除行 */ }
```

**迁移顺序**：`schema.ts` 的 v2 给 `customers` 补线索字段；`leads`/`lead_runs` 表由 `leads/db.js` 在首次连接时 `CREATE TABLE IF NOT EXISTS` 建好。

## 旧数据迁移

`migrate.js` 在首次启动时导入 `~/.waimao/`：

| 源 | 目标 |
|---|---|
| `config.json` | 新目录 `config.json`（合并，旧值优先于默认值） |
| `data/crm.json` | SQLite `leads` 表 |
| `data/leads.jsonl` | SQLite `lead_runs` 表 |
| `data/audit.jsonl` | 追加进新目录 `audit.jsonl` |
| `kb.json`/`templates.json`/`messages.json` 等 | 直接拷贝 |

**配置合并的方向很关键**：`readConfig()` 会把 `DEFAULT_CONFIG` 深合并进来，所以不能按"新值非空就用新值"判断——`DEFAULT_CONFIG.serp.engine` 恒为 `'ddg'`，直接覆盖会让用户原本配的 `serpapi` 丢失。正确做法是逐键比较：新值等于默认值而旧值不等于时，以旧值为准。

**幂等**：线索按 `dedup_key`、run 按 `id` upsert，可安全重跑。备份在 `<旧目录>.backup-<时间戳>/`。

## 工具名前缀

54 个获客工具默认加 `twb_` 前缀。原因：上游 `dsh-waimao` 的工具名（`lead_search`/`crm_list`…）与之完全重名，同时安装时 `tools.register` 会抛错并导致整个插件加载失败。

配置项 `toolPrefix: ""` 可还原原始名（前提是没装上游）。

## 面板映射

| 上游 waimao 页面（原生 HTML） | 本插件 React 面板 |
|---|---|
| `leadsPage` | `Leads.tsx` |
| `crmPage` | `LeadsPool.tsx`（并入 `Customers.tsx`） |
| `reviewPage` | `Review.tsx` |
| `settingsPage` | `Settings.tsx` 的「获客配置」分区 |
| `templatesPage` | `Templates.tsx` |

上游页面是字符串拼接的 HTML + 内联 `<script>`（`pages.js`，974 行），不能直接进 React，只能按页拆解重写。

## 常用命令

```bash
npm run build      # 生成 lib/index.js（395KB）与 lib/client.js（107KB）
npm run check      # 校验清单、产物与 locale
npx tsc --noEmit   # 类型检查
npm test           # 单元 + 集成测试（26 个）
npm run verify     # build + check + tsc + test
```

## 验证方式

Host 半身改动**必须重启 DSH** 才生效；Client 半身刷新页面即可。

改动后先跑 `npm run verify`，再用脚本模拟宿主确认装载：

```js
const mod = await import("./lib/index.js");
const tools = new Map();
mod.apply({
  tools: { register(d) { tools.set(d.name, d); return () => {}; } },
  effect(fn) { fn(); return () => {}; },
  connection: { fetch: { register() { return () => {}; } } },
}, { dataDir: "D:/tmp/test" });
// 等异步装载后应有 54 个工具
```

## 已知边界

- **PDF 中文乱码**：`pdf.js` 是零依赖手写生成器，仅支持 WinAnsi 编码，中文客户名会乱码。PI 走 HTML 打印视图可绕过。
- **`dry_run` 默认开启**：真实发信需在设置页显式关闸，这是保护域名信誉的设计，不要建议绕过。
- **首触审批门**：智能体直接发首触冷邮件会被拒绝，必须走 `email_compose → sop_review → sop_approve`。
- **上游不同步**：fork 后不再跟随 `dsh-waimao` 更新，上游修 bug 需手工 cherry-pick。
