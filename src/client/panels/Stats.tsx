/**
 * 效果统计：获客漏斗、回复率、打开率、市场分布。
 *
 * 数据来自 stats_report，聚合的是 audit 日志与 CRM 状态。
 * 这里不做花哨图表，用条形 + 数字，密度优先。
 */
import * as React from "react";
import { useEffect, useState } from "react";
import { toasts, PageHead, Section, Empty, Table, StatCard, Badge, KeyValue, CardsSkeleton, TableSkeleton } from "../ui.tsx";
import { leads } from "../api.ts";

function Bar(props: { label: string; value: number; max: number; hint?: string }) {
  const ratio = props.max > 0 ? props.value / props.max : 0;
  return React.createElement("div", { style: { marginBottom: 9 } },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 } },
      React.createElement("span", { style: { color: "var(--twb-fg-2)" } }, props.label),
      React.createElement("span", { className: "twb-mono", style: { color: "var(--twb-fg-3)" } },
        props.hint ?? String(props.value))),
    React.createElement("div", { className: "twb-bar-track" },
      React.createElement("div", { className: "twb-bar", style: { width: Math.max(2, ratio * 100) + "%" } })));
}

export function Stats() {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    leads.statsReport({}).then(setD).catch((e: any) => setErr(e.message));
  }, []);

  if (err) return React.createElement(Empty, { title: "统计加载失败", desc: err });
  if (!d) {
    return React.createElement("div", null,
      React.createElement(PageHead, { title: "效果统计", sub: "统计中…" }),
      React.createElement(CardsSkeleton, { n: 6 }),
      React.createElement(TableSkeleton, { rows: 5, cols: 4 }));
  }

  const funnel = d.funnel ?? {};
  const byMarket: any[] = d.byMarket ?? [];
  const byTier: any[] = d.byTier ?? [];
  const byReply: any[] = d.replyClasses ?? [];
  const maxFunnel = Math.max(1, ...Object.values(funnel).map((v: any) => Number(v) || 0));

  const totalLeads = Number(funnel.leads ?? d.totalLeads ?? 0);
  const contacted = Number(funnel.contacted ?? 0);
  const replied = Number(funnel.replied ?? 0);
  const won = Number(funnel.won ?? 0);

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "效果统计", sub: "获客漏斗、分层回复率与市场分布" }),

    React.createElement("div", { className: "twb-cards" },
      React.createElement(StatCard, { label: "线索总量", value: totalLeads }),
      React.createElement(StatCard, { label: "已触达", value: contacted, sub: totalLeads ? `占 ${((contacted / totalLeads) * 100).toFixed(1)}%` : undefined }),
      React.createElement(StatCard, {
        label: "回复率", value: contacted ? ((replied / contacted) * 100).toFixed(1) + "%" : "—",
        tone: replied > 0 ? "ok" : undefined, sub: `${replied} 条回复`,
      }),
      React.createElement(StatCard, {
        label: "成单数", value: won, tone: won > 0 ? "ok" : undefined,
        sub: totalLeads ? `转化 ${((won / totalLeads) * 100).toFixed(1)}%` : undefined,
      }),
      React.createElement(StatCard, { label: "打开率", value: d.openRate != null ? (d.openRate * 100).toFixed(1) + "%" : "—" }),
      React.createElement(StatCard, { label: "点击率", value: d.clickRate != null ? (d.clickRate * 100).toFixed(1) + "%" : "—" })),

    Object.keys(funnel).length > 0 ? React.createElement(Section, { title: "获客漏斗" },
      React.createElement("div", {
        style: {
          padding: 14, border: "1px solid var(--twb-line)",
          borderRadius: "var(--twb-r)", background: "var(--twb-raised)", maxWidth: 520,
        },
      },
        Object.entries(funnel).map(([k, v]: any) =>
          React.createElement(Bar, { key: k, label: k, value: Number(v) || 0, max: maxFunnel })))) : null,

    byTier.length > 0 ? React.createElement(Section, { title: "分层回复率" },
      React.createElement(Table, { head: ["分层", "数量", "回复", "回复率"] },
        byTier.map((t: any, i: number) => React.createElement("tr", { key: i },
          React.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, t.tier ?? "-"),
          React.createElement("td", { className: "num" }, String(t.total ?? 0)),
          React.createElement("td", { className: "num" }, String(t.replied ?? 0)),
          React.createElement("td", null,
            React.createElement(Badge, {
              tone: (t.replied ?? 0) / Math.max(1, t.total ?? 1) >= 0.1 ? "ok" : "warn",
            }, (((t.replied ?? 0) / Math.max(1, t.total ?? 1)) * 100).toFixed(1) + "%")))))) : null,

    byMarket.length > 0 ? React.createElement(Section, { title: "市场分布" },
      React.createElement(Table, { head: ["市场", "线索数", "回复数"] },
        byMarket.map((m: any, i: number) => React.createElement("tr", { key: i },
          React.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, m.market ?? "-"),
          React.createElement("td", { className: "num" }, String(m.total ?? 0)),
          React.createElement("td", { className: "num" }, String(m.replied ?? 0)))))) : null,

    byReply.length > 0 ? React.createElement(Section, { title: "回复分类" },
      React.createElement(Table, { head: ["分类", "数量"] },
        byReply.map((r: any, i: number) => React.createElement("tr", { key: i },
          React.createElement("td", null, React.createElement(Badge, { plain: true }, r.klass ?? r.label ?? "-")),
          React.createElement("td", { className: "num" }, String(r.count ?? 0)))))) : null,

    Object.keys(funnel).length === 0 && byMarket.length === 0
      ? React.createElement(Empty, {
          title: "还没有可统计的数据",
          desc: "跑几次搜索、加工线索并发几封开发信后，这里会显示漏斗转化与回复率。",
        })
      : null,

    React.createElement(Section, { title: "触达量" },
      React.createElement(KeyValue, {
        rows: [
          ["今日发送", String(d.todaySends ?? 0)],
          ["本周发送", String(d.weekSends ?? 0)],
          ["累计发送", String(d.totalSends ?? 0)],
          ["抑制名单", String(d.suppressed ?? 0)],
        ],
      })));
}
