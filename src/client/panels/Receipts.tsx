import * as React from "react";
import { useState } from "react";
import { api } from "../api.ts";
import { Field, TextInput, Select, money, moneyShort, saveRow, toasts, useList, PageHead, Empty, Table, Badge, Section } from "../ui.tsx";

export function Receipts() {
  const [q, setQ] = useState("");
  const { rows, reload } = useList("receipts", q);
  const [adding, setAdding] = useState(false);

  const income = rows.filter((r: any) => r.type !== "费用").reduce((s: number, r: any) => s + (r.amount_cents ?? 0), 0);
  const expense = rows.filter((r: any) => r.type === "费用").reduce((s: number, r: any) => s + (r.amount_cents ?? 0), 0);

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "收汇对账", sub: "定金与尾款登记，自动算每单应收与账龄" }),
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(TextInput, {
        placeholder: "搜索水单号…", value: q,
        onChange: (e: any) => setQ(e.target.value), style: { minWidth: 240 },
      }),
      React.createElement("button", { className: "twb-btn", onClick: () => setAdding(!adding) },
        adding ? "收起" : "+ 登记收款"),
      React.createElement("span", { className: "spacer" }),
      React.createElement("span", { className: "twb-muted" },
        `实收 ${moneyShort(income)}${expense ? " · 费用 " + moneyShort(expense) : ""}`)),

    adding ? React.createElement(NewReceipt, { onDone: () => { setAdding(false); reload(); } }) : null,

    rows.length === 0
      ? React.createElement(Empty, { title: "还没有收款记录", desc: "收到定金或尾款后在这里登记，系统会自动更新订单应收余额。" })
      : React.createElement(Table, { head: ["订单", "类型", "金额", "币种", "到账日", "水单号", ""] },
          rows.map((r: any) => React.createElement("tr", { key: r.id },
            React.createElement("td", { className: "twb-muted" }, "#" + r.order_id),
            React.createElement("td", null,
              React.createElement(Badge, { plain: true, tone: r.type === "尾款" ? "ok" : r.type === "费用" ? "err" : undefined }, r.type)),
            React.createElement("td", { className: "num", style: { color: "var(--twb-fg)" } }, money(r.amount_cents, r.currency)),
            React.createElement("td", { className: "mono twb-muted" }, r.currency),
            React.createElement("td", { className: "mono" }, r.date || "—"),
            React.createElement("td", { className: "mono twb-muted" }, r.bank_ref || "—"),
            React.createElement("td", { style: { width: 52, textAlign: "right" } },
              React.createElement("button", {
                className: "twb-btn ghost sm", onClick: async () => {
                  if (!confirm("删除该收款记录？")) return;
                  try { await api.remove("receipts", r.id); toasts.push("已删除", "ok"); reload(); } catch (e: any) { toasts.push(e.message); }
                },
              }, "删除"))))),

    React.createElement(Section, { title: "应收对账（未结案订单）" },
      React.createElement(OrderBalances, null)));
}

function OrderBalances() {
  const { rows } = useList("orders", "");
  const [map, setMap] = useState<Record<number, any>>({});
  useState(() => {
    for (const o of rows) {
      if (o.stage !== "closed") {
        api.balance(o.id).then((b: any) => setMap((m: any) => ({ ...m, [o.id]: b }))).catch(() => {});
      }
    }
  });

  const open = rows.filter((o: any) => o.stage !== "closed");
  if (open.length === 0) {
    return React.createElement("div", { className: "twb-muted", style: { padding: "10px 0" } }, "所有订单均已结案，无应收款项。");
  }
  return React.createElement(Table, { head: ["订单", "应收", "已收", "未收", "账龄"] },
    open.map((o: any) => {
      const b = map[o.id];
      const age = b && b.dueCents > 0 && o.delivery_date
        ? Math.max(0, Math.floor((Date.now() - new Date(o.delivery_date).getTime()) / 86400000))
        : null;
      return React.createElement("tr", { key: o.id },
        React.createElement("td", { className: "mono", style: { color: "var(--twb-fg)", fontWeight: 550 } }, o.no),
        React.createElement("td", { className: "num" }, money(o.amount_cents, o.currency)),
        React.createElement("td", { className: "num twb-muted" }, b ? money(b.paidCents, o.currency) : "…"),
        React.createElement("td", { className: "num" },
          b ? React.createElement(Badge, { tone: b.dueCents > 0 ? (age != null && age > 60 ? "err" : "warn") : "ok" },
            money(b.dueCents, o.currency)) : "…"),
        React.createElement("td", { className: "mono" }, age != null ? age + " 天" : "—"));
    }));
}

function NewReceipt(props: { onDone: () => void }) {
  const [f, setF] = useState({
    order_id: 0, type: "尾款", amount_cents_str: "",
    currency: "USD", date: new Date().toISOString().slice(0, 10), bank_ref: "", note: "",
  });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value } as any);

  return React.createElement("div", {
    style: {
      padding: 14, marginBottom: 16,
      border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r)",
      background: "var(--twb-raised)",
    },
  },
    React.createElement("div", { className: "twb-grid3" },
      React.createElement(Field, { label: "订单 ID *" },
        React.createElement(TextInput, { value: String(f.order_id || ""), onChange: set("order_id") })),
      React.createElement(Field, { label: "类型" },
        React.createElement(Select, { value: f.type, onChange: set("type") },
          ["定金", "尾款", "费用"].map((t) => React.createElement("option", { key: t, value: t }, t)))),
      React.createElement(Field, { label: "金额 *" },
        React.createElement(TextInput, { value: f.amount_cents_str, onChange: set("amount_cents_str"), placeholder: "如 12500.00" })),
      React.createElement(Field, { label: "币种" },
        React.createElement(TextInput, { value: f.currency, onChange: set("currency") })),
      React.createElement(Field, { label: "到账日" },
        React.createElement(TextInput, { value: f.date, onChange: set("date") })),
      React.createElement(Field, { label: "水单号" },
        React.createElement(TextInput, { value: f.bank_ref, onChange: set("bank_ref") }))),
    React.createElement("button", {
      className: "twb-btn", onClick: async () => {
        const cents = Math.round(Number(f.amount_cents_str || 0) * 100);
        if (!f.order_id || !Number.isFinite(cents) || cents <= 0) return toasts.push("订单与金额必填");
        try {
          await saveRow("receipts", {
            order_id: Number(f.order_id), type: f.type, amount_cents: cents,
            currency: f.currency, date: f.date, bank_ref: f.bank_ref, note: f.note,
          });
          props.onDone();
        } catch (e: any) { toasts.push(e.message); }
      },
    }, "登记"));
}
