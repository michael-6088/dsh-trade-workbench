import * as React from "react";
import { useState } from "react";
import { api } from "../api.ts";
import { Drawer, Field, TextInput, TextArea, money, moneyShort, saveRow, toasts, useList, PageHead, Empty, Badge, SortableTable, useSortedRows, TableSkeleton, type Column } from "../ui.tsx";
import { openDrawer } from "../store.ts";
import { STAGES } from "../../shared/types.ts";
import { AiDraft } from "../ai.tsx";

const STAGE_CN: Record<string, string> = {
  inquiry: "询盘", quote: "报价", pi: "PI/合同", production: "生产",
  booking: "订舱", customs: "报关", shipped: "出运", receipt: "收款", closed: "结案",
};
const DONE_STAGES = ["shipped", "receipt", "closed"];

export function Orders() {
  const [q, setQ] = useState("");
  const { rows, reload, loading } = useList("orders", q);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = rows.filter((r: any) => r.delivery_date && r.delivery_date < today && !DONE_STAGES.includes(r.stage)).length;
  const total = rows.reduce((s: number, r: any) => s + (r.amount_cents ?? 0), 0);

  const columns: Column[] = [
    { label: "订单号", get: (r) => r.no, width: 150,
      render: (r) => React.createElement("span", { className: "mono", style: { color: "var(--twb-fg)", fontWeight: 550 } }, r.no) },
    { label: "客户", get: (r) => r.customer_id, width: 80,
      render: (r) => React.createElement("span", { className: "twb-muted" }, "#" + (r.customer_id ?? "-")) },
    { label: "金额", num: true, width: 140,
      get: (r) => r.amount_cents, render: (r) => money(r.amount_cents, r.currency) },
    { label: "签约", get: (r) => r.sign_date, width: 110,
      render: (r) => React.createElement("span", { className: "mono twb-muted" }, r.sign_date || "—") },
    { label: "交期", get: (r) => r.delivery_date, width: 150,
      render: (r) => {
        const isOverdue = r.delivery_date && r.delivery_date < today && !DONE_STAGES.includes(r.stage);
        const soon = r.delivery_date && !isOverdue
          && r.delivery_date <= today.slice(0, 8) + String(Number(today.slice(8, 10)) + 7).padStart(2, "0")
          && r.stage !== "closed";
        return React.createElement("span", { className: "mono" },
          r.delivery_date || "—",
          isOverdue ? React.createElement(Badge, { tone: "err" }, "逾期")
            : soon ? React.createElement(Badge, { tone: "warn" }, "临近") : null);
      } },
    { label: "阶段", get: (r) => r.stage, width: 100,
      render: (r) => React.createElement(Badge, {
        plain: true, tone: r.stage === "closed" ? "ok" : undefined,
      }, STAGE_CN[r.stage] ?? r.stage) },
  ];
  const sort = useSortedRows(rows, columns);

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "订单履约", sub: "PI/合同 → 生产 → 订舱 → 报关 → 出运 → 收款 → 结案" }),
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(TextInput, {
        placeholder: "搜索订单号…", value: q,
        onChange: (e: any) => setQ(e.target.value), style: { minWidth: 240 },
      }),
      React.createElement("span", { className: "spacer" }),
      overdue > 0 ? React.createElement(Badge, { tone: "err" }, `${overdue} 单逾期`) : null,
      React.createElement("span", { className: "twb-muted" }, `共 ${rows.length} 单 · ${moneyShort(total)}`)),

    loading
      ? React.createElement(TableSkeleton, { rows: 6, cols: 6 })
      : React.createElement(SortableTable, {
          columns, rows: sort.sorted, sortKey: sort.key, asc: sort.asc, onSort: sort.toggle,
          onRowClick: (r: any) => { openDrawer("orders", r.id); reload(); },
          empty: React.createElement(Empty, { title: "还没有订单", desc: "从「报价/PI」打开一份报价，点「转订单」即可生成。" }),
        }),

    React.createElement(Drawer, {
      domain: "orders",
      render: (row: any, _c: any, again: any) => React.createElement(OrderForm, { row, saved: again }),
    }));
}

function OrderForm(props: { row: any; saved: () => void }) {
  const [f, setF] = useState({ ...props.row });
  const [balance, setBalance] = useState<any>(null);
  useState(() => { api.balance(f.id).then(setBalance).catch(() => {}); });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const progress: any[] = Array.isArray(f.progress) && f.progress.length
    ? f.progress
    : STAGES.map((s: any) => ({ stage: s, done: false, at: "" }));

  const mark = (i: number) => async () => {
    const next = progress.map((p, j) => (j === i ? { ...p, done: !p.done, at: p.done ? "" : new Date().toISOString().slice(0, 10) } : p));
    const lastDone = next.map((p, j) => (p.done ? j : -1)).filter((j) => j >= 0).pop() ?? 0;
    const stage = STAGES[lastDone] as any;
    setF({ ...f, progress: next, stage });
    try { await saveRow("orders", { progress: next, stage }, f.id); props.saved(); } catch (e: any) { toasts.push(e.message); }
  };

  const doneCount = progress.filter((p: any) => p.done).length;
  const ratio = progress.length ? doneCount / progress.length : 0;

  return React.createElement("div", null,
    React.createElement("div", { className: "twb-cards", style: { marginBottom: 18 } },
      React.createElement("div", { className: "twb-card" },
        React.createElement("div", { className: "k" }, "订单金额"),
        React.createElement("div", { className: "v" }, money(f.amount_cents ?? 0, f.currency))),
      React.createElement("div", { className: "twb-card" },
        React.createElement("div", { className: "k" }, "当前阶段"),
        React.createElement("div", { className: "v", style: { fontSize: 15, fontFamily: "inherit" } }, STAGE_CN[f.stage] ?? f.stage)),
      React.createElement("div", { className: "twb-card" + (balance && balance.dueCents > 0 ? " tone-warn" : " tone-ok") },
        React.createElement("div", { className: "k" }, "未收汇"),
        React.createElement("div", { className: "v", style: { fontSize: 15 } },
          balance ? money(balance.dueCents, f.currency) : "…"))),

    React.createElement("div", { className: "twb-section" }, "履约进度"),
    React.createElement("div", { className: "twb-bar-track", style: { marginBottom: 12 } },
      React.createElement("div", { className: "twb-bar", style: { width: Math.max(2, ratio * 100) + "%" } })),
    React.createElement("div", { className: "twb-steps" },
      progress.map((p: any, i: number) => React.createElement("button", {
        key: p.stage,
        className: "twb-step" + (p.done ? " done" : ""),
        onClick: mark(i),
        title: p.at || "未完成",
      }, STAGE_CN[p.stage] ?? p.stage))),

    React.createElement("div", { className: "twb-section" }, "关键日期"),
    React.createElement("div", { className: "twb-grid2" },
      React.createElement(Field, { label: "签约日期" },
        React.createElement(TextInput, { value: f.sign_date ?? "", onChange: set("sign_date") })),
      React.createElement(Field, { label: "交货日期" },
        React.createElement(TextInput, { value: f.delivery_date ?? "", onChange: set("delivery_date") }))),

    balance ? React.createElement("div", { className: "twb-muted", style: { marginBottom: 12 } },
      "已收 " + money(balance.paidCents, f.currency) + "　·　应收 " + money(balance.dueCents, f.currency)) : null,

    React.createElement(Field, { label: "备注" },
      React.createElement(TextArea, { rows: 3, value: f.note ?? "", onChange: set("note") })),

    React.createElement("div", { className: "twb-toolbar" },
      React.createElement("button", {
        className: "twb-btn", onClick: async () => {
          try {
            await saveRow("orders", { sign_date: f.sign_date, delivery_date: f.delivery_date, note: f.note }, f.id);
            props.saved();
          } catch (e: any) { toasts.push(e.message); }
        },
      }, "保存"),
      React.createElement("button", {
        className: "twb-btn secondary",
        onClick: () => openDrawer("shipments", f.id),
      }, "查看物流")),

    React.createElement(AiDraft, {
      title: "订单 " + f.no,
      context: `订单 ${f.no}，金额 ${f.amount_cents / 100} ${f.currency}，签约 ${f.sign_date}，交期 ${f.delivery_date}，当前阶段 ${STAGE_CN[f.stage] ?? f.stage}。进度节点：${JSON.stringify(progress)}`,
    }));
}
