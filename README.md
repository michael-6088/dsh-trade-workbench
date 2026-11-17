# dsh-trade-workbench 外贸工作台

DeepSeek Harness 插件：左侧栏入口的全流程外贸工作台，覆盖**从找到买家到收回货款**的完整链路。

```
线索搜索 → 线索池 → 邮箱验证 → 开发信/模板 → 客服审核
   → 询盘 → 报价/PI → 订单履约 → 物流单证 → 收汇对账 → 看板复盘
```

## 能力总览

| 分组 | Tab | 说明 |
|---|---|---|
| **获客** | 线索搜索 | 三层搜索（基础词 / LinkedIn 定向 / 采购信号）、多市场预设、引擎自动 failover |
| | 线索池 | CRM 状态机看板（新→已评估→已触达→已回复→已报价→成交/流失）、跨搜索去重、活动流 |
| | 邮箱验证 | 35+ 模式猜测 + MX 记录 + SMTP RCPT 探测 + catch-all 检测 |
| **触达** | 邮件模板 | 多语模板、`{Name}` 变量、`{a\|b\|c}` spintax 变体 |
| | 客服审核 | WhatsApp 待审队列，AI 起草 + 人工确认后发送 |
| **经营** | 询盘 / 客户 | 询盘登记与来源追踪，客户档案（公司/国家/联系人/标签） |
| | 报价/PI | 按明细报价，实时合计与毛利率，一键转订单 |
| | 订单 | PI→生产→订舱→报关→出运→收款→结案，交期临期高亮 |
| | 物流单证 | 订舱/船期/柜号/提单登记，单证上传与下载 |
| | 收汇对账 | 定金/尾款登记，自动算每单应收与账龄 |
| **分析** | 看板 | 转化率、在手金额、未收汇、月度毛利 |
| | 设置 | 公司抬头、银行信息、获客配置（SERP/SMTP/IMAP/DeepSeek/Evolution）、数据备份 |

另有 **54 个对话工具**（`twb_` 前缀），AI 可直接调用完成搜索、评分、发信、回复扫描、SOP 推进等操作。

## 安装

开发（本仓库目录）：

```bash
npm install && npm run build
dsh plugin --profile desktop add link:"<本目录绝对路径>"
```

确保 `profiles/<profile>/package.json` 的 `dsh.profile.bundles` 数组里包含 `dsh-trade-workbench`。

> Host 半身改动需要重启 DSH 才生效；Client 半身改动刷新页面即可。

## 与 dsh-waimao 的关系

本插件的获客子系统 fork 自 [dsh-waimao](https://github.com/shine-233/dsh-waimao) v0.8.0（MIT），并做了三处结构性改造：

1. **工具名加 `twb_` 前缀** —— 避免与上游同时安装时 `tools.register` 重名抛错。配置项 `toolPrefix: ""` 可还原原始名。
2. **存储接入 SQLite** —— CRM 线索入 `trade.db` 的 `leads` 表，与订单/单证同库；搜索记录入 `lead_runs` 表。其余模块（邮件/序列/知识库/审计）仍用 JSON 文件，因为它对当前量级够用。
3. **传输收敛到 RPC** —— 上游用 `webServer` 前缀路由（绕过认证），本插件统一走 `ctx.connection.fetch` 的 `/api/trade-workbench/rpc`，载体无关且自带认证围栏。

**首次启动会自动导入**旧 `~/.waimao/` 的数据（线索、搜索记录、配置、审计、知识库），导入前先备份到 `~/.waimao.backup-<时间戳>/`。设 `migrateLeads: false` 可跳过。

## 配置

设置页「获客配置」可填：

| 项 | 说明 |
|---|---|
| `serp.engine` | `ddg`（免密钥）或 `serpapi`（需 key） |
| `serp.serpapiKey` | SerpAPI 密钥 |
| `serp.proxy` | 大陆网络必填，如 `http://127.0.0.1:7890` |
| `icp.product` / `icp.buyers` | ICP 画像，评分与写信都依赖它 |
| `smtp.*` | 发信配置；**`dryRun` 默认 true**，只预览不真发 |
| `imap.*` | 收回复；配合定时任务自动扫描分类 |
| `deepseek.apiKey` | AI 生成个性化开发信 |
| `evolution.*` | WhatsApp 网关 |

敏感字段只存 host 侧，前端读的是掩码版本。

## 安全设计

- **`dry_run` 默认开启**：首次真实发送前需在设置页显式关闸。
- **首触审批门**：智能体直接发首触冷邮件会被拒绝，必须走 `email_compose → sop_review → sop_approve`（哈希绑定，草稿改动即失效）。
- **三层日上限**：全局 / 每邮箱 / 每邮箱总量，达限即拒发，保护域名信誉。
- **抑制列表**：地址+域名两级，退信整域拉黑，发送时强制拦截。
- **全量审计**：所有发送、状态变更、配置改动都落 `audit.jsonl`。

## 开发

| 命令 | 作用 |
|---|---|
| `npm run build` | 生成 `lib/index.js`（Host，含获客子系统）与 `lib/client.js`（Client） |
| `node scripts/check.mjs` | 校验清单、产物与 locale |
| `npx tsc --noEmit -p tsconfig.json` | 类型检查（`src/host/leads/**` 是纯 JS，不参与） |
| `npm test` | 单元 + 集成测试 |
| `npm run verify` | build + check + tsc + test 全流程 |

### 目录结构

```
src/
  host/
    index.ts          Host 入口：数据目录解析、RPC、工具注册
    db.ts schema.ts   主库连接与版本化迁移
    leads/            获客子系统（fork 自 dsh-waimao，纯 JS）
      index.js        54 个工具注册入口 registerLeadsPlugin()
      rpc.js          49 个 RPC op 分派器
      db.js           leads / lead_runs 表
      migrate.js      旧 ~/.waimao 数据导入
      config.js       数据目录解析与配置读写
      ...             44 个业务模块（搜索/邮件/序列/CRM/SOP/知识库…）
  client/
    App.tsx           13 个 Tab 的分组导航
    panels/           各业务面板
```

> `src/host/leads/**` 为原样 fork 的纯 JS，改 `.js→.ts` 会引入大量隐式 any（实测 1392 个错误），
> 收益为零且后续同步上游 diff 困难。因此这些模块不参与 tsc，只在 `index.ts` 用 `@ts-expect-error` 标注导入点。

## 说明

- 数据默认存插件包内 `<包>/data/`，可用 `dataDir` 配置改到别处；卸载插件不会自动删数据。
- 需要 Node ≥ 22.5（`node:sqlite` 内建）。
- 界面为深浅色自适应，配色跟随宿主主题变量。
- MIT。
