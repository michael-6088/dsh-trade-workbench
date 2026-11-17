import * as React from "react";
import { useEffect, useState } from "react";
import { api } from "../api.ts";
import { Drawer, Field, TextInput, TextArea, Select, money, saveRow, toasts, useList, PageHead, Empty, Badge, SortableTable, useSortedRows, TableSkeleton, type Column } from "../ui.tsx";
import { openDrawer } from "../store.ts";
import { quoteTotal } from "../../shared/types.ts";

export function Quotes() {
  const [q, setQ] = useState("");
  const { rows, reload, loading } = useList("quotes", q);
  const [adding, setAdding] = useState(false);

  const columns: Column[] = [
    { label: "单号", get: (r) => r.no, width: 150,
      render: (r) => React.createElement("span", { className: "mono", style: { color: "var(--twb-fg)", fontWeight: 550 } }, r.no) },
    { label: "客户", get: (r) => r.customer_id, width: 90,
      render: (r) => React.createElement("span", { className: "twb-muted" }, "#" + (r.customer_id ?? "-")) },
    { label: "金额", num: true, width: 140,
      get: (r) => quoteTotal({ items: r.items ?? [] }).totalCents,
      render: (r) => money(quoteTotal({ items: r.items ?? [] }).totalCents, r.currency) },
    { label: "毛利率", width: 96,
      get: (r) => quoteTotal({ items: r.items ?? [] }).marginRate,
      render: (r) => {
        const t = quoteTotal({ items: r.items ?? [] });
        return React.createElement(Badge, { tone: t.marginRate >= 0.2 ? "ok" : t.marginRate >= 0.1 ? "warn" : "err" },
          (t.marginRate * 100).toFixed(1) + "%");
      } },
    { label: "状态", get: (r) => r.status, width: 96,
      render: (r) => React.createElement(Badge, {
        plain: true,
        tone: r.status === "won" ? "ok" : r.status === "lost" ? "err" : undefined,
      }, r.status === "won" ? "已成单" : r.status === "lost" ? "已失单" : r.status === "sent" ? "已发送" : "草稿") },
    { label: "", width: 52,
      render: (r) => React.createElement("button", {
        className: "twb-btn ghost sm",
        onClick: (e: any) => { e.stopPropagation(); window.open(api.piUrl(r.id), "_blank"); },
      }, "PI") },
  ];
  const sort = useSortedRows(rows, columns);

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "报价 / PI", sub: "按明细报价，实时算毛利，可一键转订单" }),
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(TextInput, {
        placeholder: "搜索单号…", value: q,
        onChange: (e: any) => setQ(e.target.value), style: { minWidth: 240 },
      }),
      React.createElement("button", { className: "twb-btn", onClick: () => setAdding(!adding) },
        adding ? "收起" : "+ 新报价"),
      React.createElement("span", { className: "spacer" }),
      React.createElement("span", { className: "twb-muted" }, `共 ${rows.length} 份`)),

    adding ? React.createElement(NewQuote, { onDone: () => { setAdding(false); reload(); } }) : null,

    loading
      ? React.createElement(TableSkeleton, { rows: 6, cols: 6 })
      : React.createElement(SortableTable, {
          columns, rows: sort.sorted, sortKey: sort.key, asc: sort.asc, onSort: sort.toggle,
          onRowClick: (r: any) => { openDrawer("quotes", r.id); reload(); },
          empty: React.createElement(Empty, { title: "还没有报价单", desc: "新建报价后填写明细，系统自动算合计与毛利率，并可导出 PI 或转订单。" }),
        }),

    React.createElement(Drawer, {
      domain: "quotes",
      render: (row: any, _c: any, again: any) => React.createElement(QuoteForm, { row, saved: again }),
    }));
}

function NewQuote(props: { onDone: () => void }) {
  const [no, setNo] = useState("Q" + Date.now().toString().slice(-8));
  const [cid, setCid] = useState(0);
  // 客户下拉：手填 ID 极易输错且要来回切页，改成直接选档案
  const [customers, setCustomers] = useState<any[]>([]);
  useEffect(() => {
    api.list("customers", "").then((r: any) => {
      const list = Array.isArray(r) ? r : [];
      setCustomers(list);
      if (!cid && list.length) setCid(list[0].id);
    }).catch(() => {});
  }, []);

  return React.createElement("div", {
    style: {
      padding: 14, marginBottom: 16,
      border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r)",
      background: "var(--twb-raised)",
    },
  },
    React.createElement("div", { className: "twb-grid2" },
      React.createElement(Field, { label: "报价单号" },
        React.createElement(TextInput, { value: no, onChange: (e: any) => setNo(e.target.value) })),
      React.createElement(Field, {
        label: "客户",
        hint: customers.length ? undefined : "还没有客户档案，先去「客户」页新建",
      },
        React.createElement(Select, {
          value: String(cid || ""),
          onChange: (e: any) => setCid(Number(e.target.value) || 0),
        },
          customers.length === 0
            ? React.createElement("option", { value: "0" }, "（无客户）")
            : customers.map((c: any) =>
                React.createElement("option", { key: c.id, value: String(c.id) },
                  `${c.name || "未命名"} #${c.id}${c.country ? " · " + c.country : ""}`))))),
    React.createElement("button", {
      className: "twb-btn", onClick: async () => {
        try {
          await saveRow("quotes", {
            no, customer_id: cid, currency: "USD", fx_rate: 1,
            items: [{ name: "", qty: 0, price: 0, cost: 0 }], validity_days: 30, status: "draft",
          });
          props.onDone();
        } catch (e: any) { toasts.push(e.message); }
      },
    }, "创建报价"));
}

function QuoteForm(props: { row: any; saved: () => void }) {
  const [f, setF] = useState({ ...props.row });
  const items: any[] = Array.isArray(f.items) ? f.items : [];
  const t = quoteTotal({ items });

  const setItem = (i: number, k: string, v: any) => {
    const next = items.map((it, j) => (j === i ? { ...it, [k]: k === "name" ? v : Number(v) || 0 } : it));
    setF({ ...f, items: next });
  };

  const cellInput = (i: number, k: string, value: any, width: number) =>
    React.createElement(TextInput, {
      style: { width, minWidth: width, fontFamily: k === "name" ? "inherit" : "var(--twb-mono)" },
      value: String(value ?? ""),
      onChange: (e: any) => setItem(i, k, e.target.value),
    });

  return React.createElement("div", null,
    React.createElement("div", { className: "twb-cards", style: { marginBottom: 18 } },
      React.createElement("div", { className: "twb-card" },
        React.createElement("div", { className: "k" }, "合计"),
        React.createElement("div", { className: "v" }, money(t.totalCents, f.currency))),
      React.createElement("div", { className: "twb-card tone-ok" },
        React.createElement("div", { className: "k" }, "毛利"),
        React.createElement("div", { className: "v" }, money(t.marginCents, f.currency))),
      React.createElement("div", { className: "twb-card" + (t.marginRate >= 0.2 ? " tone-ok" : t.marginRate >= 0.1 ? " tone-warn" : " tone-err") },
        React.createElement("div", { className: "k" }, "毛利率"),
        React.createElement("div", { className: "v" }, (t.marginRate * 100).toFixed(1) + "%"))),

    React.createElement("div", { className: "twb-section" }, "报价参数"),
    React.createElement("div", { className: "twb-grid3" },
      React.createElement(Field, { label: "币种" },
        React.createElement(TextInput, { value: f.currency ?? "USD", onChange: (e: any) => setF({ ...f, currency: e.target.value }) })),
      React.createElement(Field, { label: "汇率（对人民币）" },
        React.createElement(TextInput, { value: String(f.fx_rate ?? 1), onChange: (e: any) => setF({ ...f, fx_rate: Number(e.target.value) || 1 }) })),
      React.createElement(Field, { label: "有效期（天）" },
        React.createElement(TextInput, { value: String(f.validity_days ?? 30), onChange: (e: any) => setF({ ...f, validity_days: Number(e.target.value) || 30 }) })),
      React.createElement(Field, { label: "状态" },
        React.createElement(Select, { value: f.status ?? "draft", onChange: (e: any) => setF({ ...f, status: e.target.value }) },
          [["draft", "草稿"], ["sent", "已发送"], ["won", "已成单"], ["lost", "已失单"]].map(([v, l]) =>
            React.createElement("option", { key: v, value: v }, l))))),

    React.createElement("div", { className: "twb-section" }, "明细"),
    React.createElement("div", { className: "twb-table-wrap" },
      React.createElement("table", { className: "twb-table" },
        React.createElement("thead", null, React.createElement("tr", null,
          ["品名", "数量", "单价", "成本", "金额", ""].map((h, i) => React.createElement("th", { key: i }, h)))),
        React.createElement("tbody", null,
          items.map((it: any, i: number) => React.createElement("tr", { key: i },
            React.createElement("td", null, cellInput(i, "name", it.name, 200)),
            React.createElement("td", null, cellInput(i, "qty", it.qty, 76)),
            React.createElement("td", null, cellInput(i, "price", it.price, 88)),
            React.createElement("td", null, cellInput(i, "cost", it.cost, 88)),
            React.createElement("td", { className: "num", style: { color: "var(--twb-fg)" } }, money(it.qty * it.price * 100, f.currency)),
            React.createElement("td", { style: { width: 44, textAlign: "right" } },
              React.createElement("button", {
                className: "twb-btn ghost sm",
                onClick: () => setF({ ...f, items: items.filter((_, j) => j !== i) }),
              }, "×"))))))),

    React.createElement("div", { className: "twb-toolbar", style: { marginTop: 12 } },
      React.createElement("button", {
        className: "twb-btn secondary sm",
        onClick: () => setF({ ...f, items: [...items, { name: "", qty: 0, price: 0, cost: 0 }] }),
      }, "+ 明细行")),

    React.createElement(Field, { label: "备注 / 条款" },
      React.createElement(TextArea, { rows: 3, value: f.note ?? "", onChange: (e: any) => setF({ ...f, note: e.target.value }) })),

    React.createElement("div", { className: "twb-toolbar" },
      React.createElement("button", {
        className: "twb-btn", onClick: async () => {
          try { await saveRow("quotes", f, f.id); props.saved(); } catch (e: any) { toasts.push(e.message); }
        },
      }, "保存"),
      React.createElement("button", {
        className: "twb-btn secondary",
        onClick: () => window.open(api.piUrl(f.id), "_blank"),
      }, "导出 PI / 打印"),
      f.status !== "won" ? React.createElement("button", {
        className: "twb-btn secondary", onClick: async () => {
          try {
            const o: any = await api.toOrder(f.id);
            toasts.push("已转订单 " + o.no, "ok");
            props.saved();
          } catch (e: any) { toasts.push(e.message); }
        },
      }, "转订单") : null));
}
