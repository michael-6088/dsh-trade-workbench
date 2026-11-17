import * as React from "react";
import { useState } from "react";
import { Drawer, Field, TextInput, TextArea, Select, saveRow, toasts, useList, PageHead, Empty, Table, Badge } from "../ui.tsx";
import { openDrawer } from "../store.ts";
import { AiDraft } from "../ai.tsx";

const STATUS = [["new", "新询盘"], ["following", "跟进中"], ["quoted", "已报价"], ["invalid", "无效"]] as const;
const CN: Record<string, string> = Object.fromEntries(STATUS);
function tone(s: string): "ok" | "warn" | "err" | undefined {
  if (s === "quoted") return "ok";
  if (s === "following") return "warn";
  if (s === "invalid") return "err";
  return undefined;
}

export function Inquiries() {
  const [q, setQ] = useState("");
  const { rows, reload } = useList("inquiries", q);
  const [adding, setAdding] = useState(false);
  const open = rows.filter((r: any) => r.status === "new" || r.status === "following").length;

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "询盘管理", sub: "来自各渠道的买家询价记录" }),
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(TextInput, {
        placeholder: "搜索产品 / 内容…", value: q,
        onChange: (e: any) => setQ(e.target.value), style: { minWidth: 240 },
      }),
      React.createElement("button", { className: "twb-btn", onClick: () => setAdding(!adding) },
        adding ? "收起" : "+ 新询盘"),
      React.createElement("span", { className: "spacer" }),
      React.createElement("span", { className: "twb-muted" }, `待处理 ${open} / 共 ${rows.length}`)),

    adding ? React.createElement(NewInquiry, { onDone: () => { setAdding(false); reload(); } }) : null,

    rows.length === 0
      ? React.createElement(Empty, { title: "还没有询盘记录", desc: "收到买家询价后在这里登记，后续可一键生成报价单。" })
      : React.createElement(Table, { head: ["产品", "数量", "渠道", "状态", "收到时间"] },
          rows.map((r: any) => React.createElement("tr", {
            key: r.id, className: "row",
            onClick: () => { openDrawer("inquiries", r.id); reload(); },
          },
            React.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, r.product || "-"),
            React.createElement("td", { className: "num" }, String(r.qty ?? 0)),
            React.createElement("td", null, r.channel || "—"),
            React.createElement("td", null, React.createElement(Badge, { tone: tone(r.status) }, CN[r.status] ?? r.status)),
            React.createElement("td", { className: "mono twb-muted" }, r.received_at || r.created_at || "—")))),

    React.createElement(Drawer, {
      domain: "inquiries",
      render: (row: any, _c: any, again: any) => React.createElement(InquiryForm, { row, saved: again }),
    }));
}

function NewInquiry(props: { onDone: () => void }) {
  const [f, setF] = useState({ product: "", qty: 0, channel: "阿里国际站", content: "", status: "new", received_at: "" });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value } as any);
  return React.createElement("div", {
    style: {
      padding: 14, marginBottom: 16,
      border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r)",
      background: "var(--twb-raised)",
    },
  },
    React.createElement("div", { className: "twb-grid3" },
      Fx("产品 *", f.product, set("product")), Fx("数量", f.qty, set("qty")),
      Fx("渠道", f.channel, set("channel")), Fx("收到时间", f.received_at, set("received_at"))),
    React.createElement(Field, { label: "询盘内容" },
      React.createElement(TextArea, { rows: 3, value: f.content, onChange: set("content") })),
    React.createElement("button", {
      className: "twb-btn", onClick: async () => {
        try { await saveRow("inquiries", { ...f, qty: Number(f.qty) }); props.onDone(); } catch (e: any) { toasts.push(e.message); }
      },
    }, "创建询盘"));
}

function InquiryForm(props: { row: any; saved: () => void }) {
  const [f, setF] = useState({ ...props.row });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return React.createElement("div", null,
    React.createElement("div", { className: "twb-grid2" },
      Fx("产品", f.product, set("product")), Fx("数量", f.qty, set("qty")),
      React.createElement(Field, { label: "状态" },
        React.createElement(Select, { value: f.status, onChange: set("status") },
          STATUS.map(([v, l]) => React.createElement("option", { key: v, value: v }, l)))),
      Fx("渠道", f.channel, set("channel"))),
    React.createElement(Field, { label: "内容" },
      React.createElement(TextArea, { rows: 5, value: f.content ?? "", onChange: set("content") })),
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement("button", {
        className: "twb-btn", onClick: async () => {
          try { await saveRow("inquiries", f, f.id); props.saved(); } catch (e: any) { toasts.push(e.message); }
        },
      }, "保存"),
      f.status === "new" ? React.createElement("button", {
        className: "twb-btn secondary", onClick: async () => {
          await saveRow("inquiries", { status: "following" }, f.id); props.saved();
        },
      }, "标记跟进") : null),
    React.createElement(AiDraft, {
      title: "询盘 #" + f.id,
      context: `产品 ${f.product}，数量 ${f.qty}，渠道 ${f.channel}。询盘内容：${f.content}`,
    }));
}
function Fx(label: string, value: any, onChange: any) {
  return React.createElement(Field, { label }, React.createElement(TextInput, { value: String(value ?? ""), onChange }));
}
