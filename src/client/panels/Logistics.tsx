import * as React from "react";
import { useState } from "react";
import { api } from "../api.ts";
import { Drawer, Field, TextInput, TextArea, saveRow, toasts, useList, PageHead, Empty, Table, Badge, Section } from "../ui.tsx";
import { openDrawer } from "../store.ts";

const SHIP_FIELDS: [string, string][] = [
  ["booking_no", "订舱号"], ["vessel", "船名/航次"], ["etd", "ETD"],
  ["ata", "ATA"], ["container", "柜号"], ["bl_no", "提单号"], ["customs_status", "报关状态"],
];

export function Logistics() {
  const [q, setQ] = useState("");
  const { rows, reload } = useList("shipments", q);
  const [adding, setAdding] = useState(false);

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "物流单证", sub: "订舱、船期、柜号、提单与报关状态" }),
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(TextInput, {
        placeholder: "搜索订舱号 / 提单号…", value: q,
        onChange: (e: any) => setQ(e.target.value), style: { minWidth: 240 },
      }),
      React.createElement("button", { className: "twb-btn", onClick: () => setAdding(!adding) },
        adding ? "收起" : "+ 新订舱"),
      React.createElement("span", { className: "spacer" }),
      React.createElement("span", { className: "twb-muted" }, `共 ${rows.length} 票`)),

    adding ? React.createElement(NewShipment, { onDone: () => { setAdding(false); reload(); } }) : null,

    rows.length === 0
      ? React.createElement(Empty, { title: "还没有出运记录", desc: "订单进入订舱阶段后，在这里登记订舱号、船期与柜号。" })
      : React.createElement(Table, { head: ["订单", "订舱号", "船名/航次", "ETD", "柜号", "提单号", "报关"] },
          rows.map((r: any) => React.createElement("tr", {
            key: r.id, className: "row",
            onClick: () => { openDrawer("shipments", r.id); reload(); },
          },
            React.createElement("td", { className: "twb-muted" }, "#" + r.order_id),
            React.createElement("td", { className: "mono" }, r.booking_no || "—"),
            React.createElement("td", null, r.vessel || "—"),
            React.createElement("td", { className: "mono" }, r.etd || "—"),
            React.createElement("td", { className: "mono" }, r.container || "—"),
            React.createElement("td", { className: "mono" }, r.bl_no || "—"),
            React.createElement("td", null,
              r.customs_status
                ? React.createElement(Badge, { plain: true, tone: r.customs_status.includes("已") ? "ok" : undefined }, r.customs_status)
                : "—")))),

    React.createElement(Section, { title: "已上传单证" },
      React.createElement(Docs, null)),

    React.createElement(Drawer, {
      domain: "shipments",
      render: (row: any, _c: any, again: any) => React.createElement(ShipmentForm, { row, saved: again }),
    }));
}

function NewShipment(props: { onDone: () => void }) {
  const [f, setF] = useState({
    order_id: 0, booking_no: "", vessel: "", etd: "", ata: "",
    container: "", bl_no: "", customs_status: "未申报", note: "",
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
      SHIP_FIELDS.slice(0, 5).map(([k, label]) =>
        React.createElement(Field, { key: k, label },
          React.createElement(TextInput, { value: String((f as any)[k] ?? ""), onChange: set(k) })))),
    React.createElement("button", {
      className: "twb-btn", onClick: async () => {
        try { await saveRow("shipments", { ...f, order_id: Number(f.order_id) }); props.onDone(); } catch (e: any) { toasts.push(e.message); }
      },
    }, "创建"));
}

function ShipmentForm(props: { row: any; saved: () => void }) {
  const [f, setF] = useState({ ...props.row });
  const [file, setFile] = useState<File | null>(null);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  return React.createElement("div", null,
    React.createElement("div", { className: "twb-grid2" },
      SHIP_FIELDS.map(([k, label]) =>
        React.createElement(Field, { key: k, label },
          React.createElement(TextInput, { value: String(f[k] ?? ""), onChange: set(k) })))),

    React.createElement("button", {
      className: "twb-btn", onClick: async () => {
        try { await saveRow("shipments", f, f.id); props.saved(); } catch (e: any) { toasts.push(e.message); }
      },
    }, "保存"),

    React.createElement(Section, { title: "上传单证" },
      React.createElement(Field, { label: "文件" },
        React.createElement("input", {
          type: "file",
          style: { fontSize: 12, color: "var(--twb-fg-2)" },
          onChange: (e: any) => setFile(e.target.files?.[0] ?? null),
        })),
      React.createElement(Field, { label: "类型" },
        React.createElement(TextInput, {
          value: f.doc_kind ?? "packing_list",
          onChange: (e: any) => setF({ ...f, doc_kind: e.target.value }),
        }), "如 packing_list / invoice / bill_of_lading"),
      React.createElement("button", {
        className: "twb-btn secondary", disabled: !file, onClick: async () => {
          if (!file) return;
          const form = new FormData();
          form.append("order_id", String(f.order_id));
          form.append("kind", f.doc_kind ?? "other");
          form.append("note", f.doc_note ?? "");
          form.append("file", file, file.name);
          try { await api.upload(form); toasts.push("单证已上传", "ok"); } catch (e: any) { toasts.push(e.message); }
        },
      }, "上传")));
}

function Docs() {
  const { rows } = useList("documents", "");
  if (rows.length === 0) {
    return React.createElement("div", { className: "twb-muted", style: { padding: "10px 0" } },
      "还没有上传单证。打开某条出运记录的抽屉即可上传。");
  }
  return React.createElement(Table, { head: ["订单", "类型", "文件", "时间"] },
    rows.map((r: any) => React.createElement("tr", { key: r.id },
      React.createElement("td", { className: "twb-muted" }, "#" + r.order_id),
      React.createElement("td", null, React.createElement(Badge, { plain: true }, r.kind)),
      React.createElement("td", null,
        React.createElement("a", {
          href: api.fileUrl(r.file), target: "_blank", rel: "noreferrer",
          style: { color: "var(--twb-accent)" },
        }, r.file)),
      React.createElement("td", { className: "mono twb-muted" }, r.created_at))));
}
