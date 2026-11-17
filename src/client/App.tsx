import * as React from "react";
import { useEffect, useState } from "react";
import { closeDrawer, dataVersion, setTab, state, applyThemeAttr } from "./store.ts";
import { Toasts, useVersion, ThemeToggle } from "./ui.tsx";
import { injectStyles } from "./styles.ts";
import { attachBridge } from "./ai.tsx";
import { PanelBoundary } from "./ErrorBoundary.tsx";
import { CommandPalette } from "./CommandPalette.tsx";
import { Dashboard } from "./panels/Dashboard.tsx";
import { Customers } from "./panels/Customers.tsx";
import { Inquiries } from "./panels/Inquiries.tsx";
import { Quotes } from "./panels/Quotes.tsx";
import { Orders } from "./panels/Orders.tsx";
import { Logistics } from "./panels/Logistics.tsx";
import { Receipts } from "./panels/Receipts.tsx";
import { Settings } from "./panels/Settings.tsx";
import { Leads } from "./panels/Leads.tsx";
import { LeadsPool } from "./panels/LeadsPool.tsx";
import { EmailFinder } from "./panels/EmailFinder.tsx";
import { Review } from "./panels/Review.tsx";
import { Templates } from "./panels/Templates.tsx";
import { Sop } from "./panels/Sop.tsx";
import { Mail } from "./panels/Mail.tsx";
import { Knowledge } from "./panels/Knowledge.tsx";
import { Stats } from "./panels/Stats.tsx";
import { Ops } from "./panels/Ops.tsx";
import { Research } from "./panels/Research.tsx";

/**
 * 导航：五个分组，对应一条完整的外贸业务流。
 *
 * 获客 → 转化 → 交付 → 支撑 → 分析。
 * "转化"独立成组，是因为 SOP/邮件/审核是承上启下的关键环节 ——
 * 找到买家之后、成交之前的这段，恰恰是最容易漏掉审批和跟进的地方。
 */
const GROUPS: { label: string; tabs: [string, string][] }[] = [
  {
    label: "获客",
    tabs: [
      ["leads", "线索搜索"],
      ["pool", "线索池"],
      ["finder", "邮箱验证"],
      ["research", "公司背调"],
    ],
  },
  {
    label: "转化",
    tabs: [
      ["sop", "SOP 流程"],
      ["mail", "邮件中心"],
      ["templates", "模板"],
      ["review", "客服审核"],
    ],
  },
  {
    label: "交付",
    tabs: [
      ["inquiries", "询盘"],
      ["customers", "客户"],
      ["quotes", "报价/PI"],
      ["orders", "订单"],
      ["logistics", "物流单证"],
      ["receipts", "收汇对账"],
    ],
  },
  {
    label: "支撑",
    tabs: [
      ["kb", "知识库"],
      ["ops", "系统运维"],
    ],
  },
  {
    label: "分析",
    tabs: [
      ["dashboard", "看板"],
      ["stats", "效果统计"],
      ["settings", "设置"],
    ],
  },
];

const PANELS: Record<string, () => React.ReactNode> = {
  dashboard: () => React.createElement(Dashboard, null),
  inquiries: () => React.createElement(Inquiries, null),
  customers: () => React.createElement(Customers, null),
  quotes: () => React.createElement(Quotes, null),
  orders: () => React.createElement(Orders, null),
  logistics: () => React.createElement(Logistics, null),
  receipts: () => React.createElement(Receipts, null),
  settings: () => React.createElement(Settings, null),
  leads: () => React.createElement(Leads, null),
  pool: () => React.createElement(LeadsPool, null),
  finder: () => React.createElement(EmailFinder, null),
  review: () => React.createElement(Review, null),
  templates: () => React.createElement(Templates, null),
  sop: () => React.createElement(Sop, null),
  mail: () => React.createElement(Mail, null),
  kb: () => React.createElement(Knowledge, null),
  stats: () => React.createElement(Stats, null),
  ops: () => React.createElement(Ops, null),
  research: () => React.createElement(Research, null),
};

export function App(props: { handoff: (prompt: string) => void }) {
  injectStyles();
  attachBridge({ handoff: props.handoff });
  useVersion();
  const [tab, setLocal] = useState("leads");
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const active = state.tab && PANELS[state.tab] ? state.tab : tab;
  const pick = (t2: string) => { setTab(t2); setLocal(t2); };

  // 主题属性写到根节点；state.theme 变化（含命令面板切换）后重新应用
  useEffect(() => { applyThemeAttr(); });

  // 全局快捷键：Ctrl/Cmd+K 打开命令面板。
  // 用 window 级监听，因为面板内部的输入框也需要能触发。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const allTabs = GROUPS.flatMap((g) => g.tabs);

  return React.createElement("div", { className: "twb-root" },
    // 顶栏：品牌标记 + 标题 + 分组导航同一行。标题定宽不滚动，
    // 菜单占用剩余宽度并可横向滚动，Tab 再多也不会把标题挤走。
    React.createElement("div", { className: "twb-header" },
      React.createElement("div", { className: "twb-brand" },
        React.createElement("span", { className: "twb-brand-mark" },
          React.createElement("svg", { width: 11, height: 11, viewBox: "0 0 24 24", fill: "none", stroke: "#1a1206", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" },
            React.createElement("path", { d: "M4 18h16M6 18V9l6-4 6 4v9M10 18v-5h4v5" }))),
        React.createElement("span", { className: "twb-title" }, "外贸工作台")),
      React.createElement("button", {
        className: "twb-cmd-trigger",
        onClick: () => setCmdkOpen(true),
        title: "搜索页面与命令（Ctrl+K）",
      },
        React.createElement("svg", { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" },
          React.createElement("circle", { cx: 11, cy: 11, r: 7 }),
          React.createElement("path", { d: "m20 20-3.5-3.5" })),
        React.createElement("span", null, "搜索"),
        React.createElement("kbd", null, "⌘K")),
      React.createElement("div", { className: "twb-tabs" },
        GROUPS.map((g) => React.createElement(React.Fragment, { key: g.label },
          React.createElement("span", { className: "twb-group" }, g.label),
          g.tabs.map(([id, label]) => React.createElement("button", {
            key: id,
            className: "twb-tab" + (active === id ? " active" : ""),
            onClick: () => pick(id),
          }, label))))),
      React.createElement("div", { className: "twb-header-right" },
        React.createElement(ThemeToggle, null))),
    React.createElement("div", { className: "twb-body" },
      // 每个 Tab 套错误边界：某一页崩了不影响其他页
      React.createElement(PanelBoundary, { tab: active },
        (PANELS[active] ?? PANELS.leads)())),
    React.createElement(CommandPalette, {
      open: cmdkOpen,
      onClose: () => setCmdkOpen(false),
      tabs: allTabs,
    }),
    React.createElement(Toasts, null));
}
