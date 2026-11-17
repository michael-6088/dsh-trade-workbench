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

## 知识库与文件解析

### 为什么从 kb.json 换成 SQLite

原实现是单文件 JSON 全量读写。加附件后，每次改一个条目的元数据都要重写整库；
「某条目有哪些附件」只能全表扫描。拆成 `kb_entries` + `kb_files` 后，
附件挂载、按条目过滤、按内容哈希去重都是索引查询。

`kb.js` 的对外 API（`upsert`/`search`/`list`/`remove`/`contextFor`）签名不变，
只换了存储实现 —— 54 个工具与 5 个 RPC 一行都没改。

### 文件存储布局

```
data/kb-files/<sha256前2位>/<sha256>.<ext>
```

按内容寻址：同一份文件传多次只占一份磁盘。路径完全由哈希 + 白名单扩展名拼出，
**绝不使用用户传入的文件名落盘**（防路径注入）。

限制：单文件 ≤ 50MB；zip 解压后 ≤ 100MB（防 zip bomb）；抽取文本 ≤ 200KB。

### 三个解析器的实现取舍

| 格式 | 方案 | 为什么 |
|---|---|---|
| docx / xlsx | `node:zlib` 手解 zip + 正则抽 XML | 格式是标准 OOXML，百来行可控；引库会带来版本传递风险 |
| pdf | `unpdf` | `pdf-parse` 2.x 需 20MB 且依赖原生 `@napi-rs/canvas`；`pdfjs-dist` 36MB。`unpdf` 只 3.5MB 且零依赖 |
| 图片 | `tesseract.js`（WASM） | 本机 76 个 provider / 504 个模型全部 `vision: null`，没有任何模型能看图 |

### OCR 的两个坑

**1. 中文字间插空格。** Tesseract 输出 `"不 锈 钢 保 温 杯"`，直接入库会让子串检索
完全失效。清洗规则只删**两个 CJK 字符之间**的空格：

```js
line.replace(new RegExp(`([${CJK}])\\s+(?=[${CJK}])`, 'g'), '$1')
```

关键是**先按行 split 再处理**。用 `\s+` 全局替换会把标题和正文粘成一行，可读性崩掉。

**2. 语言包只有 chi_sim。** `@tesseract.js-data/chi_sim` 只带 `chi_sim.traineddata.gz`，
写成 `createWorker('chi_sim+eng')` 会去找不存在的 `eng.traineddata.gz` 而整体失败。
中文包自带拉丁字符集，中英混排照样能识别。

worker 会复用（每次新建要 3~5 秒），空闲 5 分钟自动释放 WASM 堆。

### 构建必须外置解析依赖

```js
// scripts/build.mjs
external: ["@deepseek-ai/*", "unpdf", "tesseract.js", "@tesseract.js-data/*"]
```

不外置的话 esbuild 会把它们打进 bundle，运行时动态加载 worker / wasm 的路径会失效。

### 本机 npm 安装会静默失败

MSYS Bash 下 `npm.cmd` 不执行，`npm install` 静默返回 0 但什么都没装。必须：

```bash
node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" install <pkg>
```

### 顺手修掉的两个既有缺陷

排查路由时发现 `/export/pi/:id` 与 `/files/:name` 从未注册成路由
（`HostConnectionFetch` 只做**精确 path 匹配**，无前缀/通配），所以 PI 打印和
单证下载一直是坏的，测试只断言了「动态路径不在固定路由表内」所以没暴露。

改为固定路径 + 查询参数：

```
/api/trade-workbench/export/pi?id=123
/api/trade-workbench/files?name=xxx.pdf
/api/trade-workbench/kb-file?id=F123
```

### SQLite 连接必须复用

`db.ts` 与 `leads/db.js` 原本各开一个 `DatabaseSync` 指向同一个 `trade.db`。
同文件双开会产生两个独立的 WAL 写者，并发写时互相 `SQLITE_BUSY`。
现在由 Host 入口把主库句柄通过 `adoptLeadsDb()` 交接给 leads 层。


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
