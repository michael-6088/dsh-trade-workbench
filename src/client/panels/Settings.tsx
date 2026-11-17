import * as React from "react";
import { useEffect, useState } from "react";
import { api, leads } from "../api.ts";
import { Field, TextInput, TextArea, Select, toasts, PageHead, Section, Segmented, Badge, KeyValue } from "../ui.tsx";

const BIZ_KEYS: [string, string, string?][] = [
  ["company", "公司名称（英文抬头）"], ["company_address", "公司地址"],
  ["company_tel", "公司电话"], ["company_email", "公司邮箱"],
  ["incoterms", "默认贸易条款"], ["bank_info", "收款银行信息", "textarea"],
  ["ai_base", "AI 直连 base URL", "留空则仅用会话交接"],
  ["ai_key", "AI Key", "password"],
  ["ai_model", "AI 模型名"],
];

const LEADS_KEYS: { path: string; label: string; type?: string; hint?: string }[] = [
  { path: "serp.engine", label: "搜索引", hint: "ddg 免密钥 / serpapi 需 key" },
  { path: "serp.serpapiKey", label: "SerpAPI Key", type: "password" },
  { path: "serp.proxy", label: "本地代理", hint: "大陆网络必填，如 http://127.0.0.1:7890" },
  { path: "serp.perLayer", label: "每层结果数" },
  { path: "icp.product", label: "卖什么（ICP 产品）", hint: "评分与开发信都会用" },
  { path: "icp.buyers", label: "找什么买家（ICP 画像）" },
  { path: "smtp.host", label: "SMTP 主机" },
  { path: "smtp.port", label: "SMTP 端口" },
  { path: "smtp.user", label: "SMTP 用户名" },
  { path: "smtp.pass", label: "SMTP 密码", type: "password" },
  { path: "smtp.from", label: "发件邮箱" },
  { path: "smtp.dailyCap", label: "每日发送上限" },
  { path: "imap.host", label: "IMAP 主机（收回复）" },
  { path: "imap.user", label: "IMAP 用户名" },
  { path: "imap.pass", label: "IMAP 密码", type: "password" },
  { path: "deepseek.apiKey", label: "DeepSeek Key", type: "password", hint: "AI 写开发信用" },
  { path: "evolution.baseURL", label: "Evolution 地址（WhatsApp）" },
  { path: "evolution.instance", label: "Evolution 实例名" },
  { path: "evolution.apiKey", label: "Evolution Key", type: "password" },
  { path: "track.publicBaseUrl", label: "追踪公网地址", hint: "邮件打开/点击统计用" },
];

function getPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}
function setPath(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const out = { ...(obj ?? {}) };
  let cur = out;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...(cur[keys[i]] ?? {}) };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return out;
}

export function Settings() {
  const [f, setF] = useState<Record<string, string>>({});
  const [health, setHealth] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [leadCfg, setLeadCfg] = useState<any>({});
  const [summary, setSummary] = useState<any>(null);
  const [section, setSection] = useState<"biz" | "leads">("biz");

  useEffect(() => {
    api.getSettings().then(setF).catch((e: any) => toasts.push(e.message));
    fetch("/api/trade-workbench/health").then((r) => r.json()).then(setHealth).catch(() => {});
    leads.configRaw().then(setLeadCfg).catch(() => {});
    leads.configSummary().then(setSummary).catch(() => {});
  }, []);

  const save = async () => {
    setBusy(true);
    try { setF(await api.putSettings(f)); toasts.push("设置已保存", "ok"); }
    catch (e: any) { toasts.push(e.message); }
    finally { setBusy(false); }
  };

  const saveLeads = async () => {
    setBusy(true);
    try {
      await leads.configWrite(leadCfg);
      setSummary(await leads.configSummary());
      toasts.push("获客配置已保存", "ok");
    } catch (e: any) { toasts.push(e.message); }
    finally { setBusy(false); }
  };

  const exportBackup = async () => {
    try {
      const domains = ["customers", "followups", "inquiries", "quotes", "orders", "shipments", "receipts", "documents"];
      const dump: Record<string, any> = {};
      for (const d of domains) dump[d] = await api.list(d);
      dump.settings = f;
      dump.leads = await leads.crmList().catch(() => []);
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "trade-workbench-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      a.click();
      URL.revokeObjectURL(a.href);
      toasts.push("备份已导出", "ok");
    } catch (e: any) { toasts.push(e.message); }
  };

  const bizPane = React.createElement("div", { style: { maxWidth: 620 } },
    BIZ_KEYS.map(([k, label, hint]) =>
      React.createElement(Field, { key: k, label, hint: hint && hint !== "textarea" ? hint : undefined },
        hint === "textarea"
          ? React.createElement(TextArea, {
              rows: 3, value: (f as any)[k] ?? "",
              onChange: (e: any) => setF({ ...f, [k]: e.target.value }),
            })
          : React.createElement(TextInput, {
              type: hint === "password" ? "password" : "text",
              value: (f as any)[k] ?? "",
              onChange: (e: any) => setF({ ...f, [k]: e.target.value }),
            }))),
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement("button", { className: "twb-btn", onClick: save, disabled: busy },
        busy ? "保存中…" : "保存设置"),
      React.createElement("button", { className: "twb-btn secondary", onClick: exportBackup }, "导出全量备份")));

  const statusCards = summary ? React.createElement("div", { className: "twb-cards", style: { marginBottom: 18 } },
    React.createElement("div", { className: "twb-card" },
      React.createElement("div", { className: "k" }, "搜索引"),
      React.createElement("div", { className: "v", style: { fontSize: 15, fontFamily: "inherit" } }, summary.serp?.engine ?? "-"),
      React.createElement("div", { className: "sub" }, summary.serp?.hasSerpapiKey ? "已配 Key" : "未配 Key")),
    React.createElement("div", { className: "twb-card" + (summary.smtp?.ready ? (summary.smtp.dryRun ? " tone-warn" : " tone-ok") : "") },
      React.createElement("div", { className: "k" }, "发信"),
      React.createElement("div", { className: "v", style: { fontSize: 15, fontFamily: "inherit" } },
        summary.smtp?.ready ? (summary.smtp.dryRun ? "演练中" : "真实发送") : "未配置"),
      React.createElement("div", { className: "sub" }, summary.smtp?.dryRun ? "只预览不真发" : "已关闭演练")),
    React.createElement("div", { className: "twb-card" + (summary.icp?.ready ? " tone-ok" : "") },
      React.createElement("div", { className: "k" }, "ICP 画像"),
      React.createElement("div", { className: "v", style: { fontSize: 15, fontFamily: "inherit" } },
        summary.icp?.ready ? "已设置" : "未设置"),
      React.createElement("div", { className: "sub" }, summary.icp?.product || "评分与写信依赖它")),
    React.createElement("div", { className: "twb-card" + (summary.evolution?.ready ? " tone-ok" : "") },
      React.createElement("div", { className: "k" }, "WhatsApp"),
      React.createElement("div", { className: "v", style: { fontSize: 15, fontFamily: "inherit" } },
        summary.evolution?.ready ? "已连接" : "未配置"),
      React.createElement("div", { className: "sub" }, summary.evolution?.instance || "Evolution 网关"))) : null;

  const leadsPane = React.createElement("div", { style: { maxWidth: 700 } },
    statusCards,
    React.createElement("div", { className: "twb-grid2" },
      LEADS_KEYS.map(({ path, label, type, hint }) =>
        React.createElement(Field, { key: path, label, hint },
          React.createElement(TextInput, {
            type: type === "password" ? "password" : "text",
            value: String(getPath(leadCfg, path) ?? ""),
            onChange: (e: any) => setLeadCfg(setPath(leadCfg, path, e.target.value)),
          })))),
    React.createElement("div", { className: "twb-toolbar", style: { marginTop: 4 } },
      React.createElement("button", { className: "twb-btn", onClick: saveLeads, disabled: busy },
        busy ? "保存中…" : "保存获客配置"),
      React.createElement("button", {
        className: "twb-btn secondary",
        onClick: async () => {
          try {
            const r = await leads.deliverability(String(getPath(leadCfg, "smtp.from") ?? "").split("@")[1] ?? "");
            toasts.push("送达率体检：" + JSON.stringify(r).slice(0, 120), "ok");
          } catch (e: any) { toasts.push(e.message); }
        },
      }, "送达率体检")));

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "设置", sub: "公司抬头、银行信息与获客链路配置" }),
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(Segmented, {
        value: section,
        options: [["biz", "公司信息"], ["leads", "获客配置"]],
        onChange: (v) => setSection(v as any),
      })),

    section === "biz" ? bizPane : leadsPane,

    React.createElement(Section, { title: "运行状态" },
      health
        ? React.createElement(KeyValue, {
            rows: [
              ["存储", health.storage ?? "-"],
              ["数据库", React.createElement("span", { className: "twb-mono", style: { fontSize: 11.5 } }, health.dbPath ?? "-")],
              ["数据目录", React.createElement("span", { className: "twb-mono", style: { fontSize: 11.5 } }, health.dataDir ?? "-")],
              ["版本", health.version ?? "-"],
              ["旧数据迁移", health.leadsMigration && !health.leadsMigration.skipped
                ? React.createElement(Badge, { tone: "ok" }, `已导入 ${health.leadsMigration.imported} 项`)
                : React.createElement(Badge, { plain: true }, "无")],
            ],
          })
        : React.createElement("div", { className: "twb-muted" }, "host 未就绪（刷新或重启 DSH）")));
}
