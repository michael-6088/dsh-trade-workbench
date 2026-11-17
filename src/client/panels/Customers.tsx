import * as React from "react";
import { useState } from "react";
import { Drawer, Field, TextInput, TextArea, saveRow, toasts, useList, PageHead, Empty, Badge, SortableTable, useSortedRows, TableSkeleton, type Column } from "../ui.tsx";
import { openDrawer } from "../store.ts";

export function NewCustomerInline({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ name: "", country: "", source: "官网", contact: "", email: "", whatsapp: "", tags: "", note: "" });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value } as any);
  return React.createElement("div", {
    style: {
      padding: 14, marginBottom: 16,
      border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r)",
      background: "var(--twb-raised)",
    },
  },
    React.createElement("div", { className: "twb-grid3" },
      F("公司名称 *", f.name, set("name")), F("国家", f.country, set("country")),
      F("来源", f.source, set("source")), F("联系人", f.contact, set("contact")),
      F("邮箱", f.email, set("email")), F("WhatsApp", f.whatsapp, set("whatsapp"))),
    React.createElement("div", { className: "twb-toolbar", style: { marginBottom: 0, marginTop: 4 } },
      React.createElement("button", {
        className: "twb-btn", onClick: async () => {
          if (!f.name) return toasts.push("公司名称必填");
          try { await saveRow("customers", f); onDone(); } catch (e: any) { toasts.push(e.message); }
        },
      }, "创建客户"),
      React.createElement("button", { className: "twb-btn secondary", onClick: onDone }, "取消")));
}
function F(label: string, value: string, onChange: any) {
  return React.createElement(Field, { label }, React.createElement(TextInput, { value, onChange }));
}

export function Customers() {
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const { rows, reload, loading } = useList("customers", q);
  const columns: Column[] = [
    { label: "名称", get: (r) => r.name, width: 200, render: (r) => React.createElement("span", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, r.name || "-") },
    { label: "国家", get: (r) => r.country },
    { label: "来源", get: (r) => r.source, render: (r) => r.source ? React.createElement(Badge, { plain: true }, r.source) : "—" },
    { label: "邮箱", get: (r) => r.email, render: (r) => React.createElement("span", { className: "mono twb-muted" }, r.email || "—") },
    { label: "WhatsApp", get: (r) => r.whatsapp, render: (r) => React.createElement("span", { className: "mono twb-muted" }, r.whatsapp || "—") },
  ];
  const sort = useSortedRows(rows, columns);

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "客户档案", sub: "公司信息与联系方式，报价与订单的关联主体" }),
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(TextInput, {
        placeholder: "搜索客户…", value: q,
        onChange: (e: any) => setQ(e.target.value), style: { minWidth: 240 },
      }),
      React.createElement("button", { className: "twb-btn", onClick: () => setAdding(!adding) },
        adding ? "收起" : "+ 新客户"),
      React.createElement("span", { className: "spacer" }),
      React.createElement("span", { className: "twb-muted" }, `共 ${rows.length} 位客户`)),

    adding ? React.createElement(NewCustomerInline, { onDone: () => { setAdding(false); reload(); } }) : null,

    loading
      ? React.createElement(TableSkeleton, { rows: 6, cols: 5 })
      : React.createElement(SortableTable, {
          columns, rows: sort.sorted, sortKey: sort.key, asc: sort.asc, onSort: sort.toggle,
          onRowClick: (r: any) => { openDrawer("customers", r.id); reload(); },
          empty: React.createElement(Empty, { title: "还没有客户", desc: "手动新建，或从「线索池」把已评估的线索转为客户。" }),
        }),

    React.createElement(Drawer, {
      domain: "customers",
      render: (row: any, _c: any, again: any) => React.createElement(CustomerForm, { row, saved: again }),
    }));
}

function CustomerForm(props: { row: any; saved: () => void }) {
  const [f, setF] = useState({ ...props.row });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return React.createElement("div", null,
    React.createElement("div", { className: "twb-grid2" },
      F2("公司名称", f.name, set("name")), F2("国家", f.country, set("country")),
      F2("来源", f.source, set("source")), F2("联系人", f.contact, set("contact")),
      F2("邮箱", f.email, set("email")), F2("WhatsApp", f.whatsapp, set("whatsapp")),
      F2("标签", f.tags, set("tags"))),
    React.createElement(Field, { label: "备注" },
      React.createElement(TextArea, { rows: 4, value: f.note ?? "", onChange: set("note") })),
    React.createElement("button", {
      className: "twb-btn", onClick: async () => {
        try { await saveRow("customers", f, f.id); props.saved(); } catch (e: any) { toasts.push(e.message); }
      },
    }, "保存"));
}
function F2(label: string, value: any, onChange: any) {
  return React.createElement(Field, { label }, React.createElement(TextInput, { value: String(value ?? ""), onChange }));
}
