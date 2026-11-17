/**
 * 知识库：产品资料、报价政策、案例、市场规则。
 *
 * AI 回复客户时先检索这里，命中则引用 citation；没命中会明说资料不足。
 * 所以这个面板的直接价值是 —— 往里录得越细，AI 写得越靠谱。
 */
import * as React from "react";
import { useState } from "react";
import { toasts, PageHead, Section, Empty, Table, TextInput, TextArea, Select, Badge, Field, KeyValue } from "../ui.tsx";
import { leads } from "../api.ts";

const TYPES: [string, string][] = [
  ["product", "产品资料"], ["pricing", "报价政策"], ["case", "案例"],
  ["market", "市场规则"], ["other", "其他"],
];
const typeLabel = (k?: string) => (TYPES.find(([v]) => v === k) ?? [, k ?? "其他"])[1];

export function Knowledge() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<any[] | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const reload = React.useCallback(() => {
    leads.kbList().then((r: any) => setRows(Array.isArray(r) ? r : (r?.entries ?? []))).catch(() => setRows([]));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);

  const search = async () => {
    if (!q.trim()) { setHits(null); return; }
    try {
      const r = await leads.kbSearch(q.trim());
      setHits(Array.isArray(r) ? r : r?.results ?? []);
    } catch (e: any) { toasts.push("检索失败：" + e.message); }
  };

  const blank = { title: "", body: "", type: "product", tags: [] };
  const save = async () => {
    if (!editing?.title?.trim()) { toasts.push("标题必填"); return; }
    setBusy(true);
    try {
      await leads.kbUpsert(editing);
      toasts.push("已保存", "ok");
      setEditing(null);
      reload();
    } catch (e: any) { toasts.push("保存失败：" + e.message); }
    finally { setBusy(false); }
  };

  const shown = hits ?? rows;

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "知识库", sub: "产品 · 报价政策 · 案例 · 市场规则，AI 回信时的依据" }),

    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(TextInput, {
        placeholder: "检索知识库…", value: q,
        onChange: (e: any) => setQ(e.target.value), style: { minWidth: 260 },
        onKeyDown: (e: any) => { if (e.key === "Enter") search(); },
      }),
      React.createElement("button", { className: "twb-btn secondary", onClick: search }, "检索"),
      hits ? React.createElement("button", { className: "twb-btn ghost", onClick: () => { setHits(null); setQ(""); } }, "清除") : null,
      React.createElement("button", { className: "twb-btn", onClick: () => setEditing({ ...blank }) }, "+ 录入条目"),
      React.createElement("span", { className: "spacer" }),
      React.createElement("span", { className: "twb-muted" },
        hits ? `命中 ${hits.length} 条` : `共 ${rows.length} 条`)),

    shown.length === 0
      ? React.createElement(Empty, {
          title: hits ? "没有匹配的条目" : "知识库还是空的",
          desc: hits
            ? "换个关键词试试。AI 回信时检索不到资料会直接说资料不足，而不是编造。"
            : "录入产品参数、MOQ、交期、付款方式、认证证书、成功案例 —— 这些是 AI 写开发信和回复客户的事实来源。",
          action: hits ? null : React.createElement("button", { className: "twb-btn", onClick: () => setEditing({ ...blank }) }, "录入第一条"),
        })
      : React.createElement(Table, { head: ["标题", "类型", "内容摘要", ""] },
          shown.map((r: any, i: number) => React.createElement("tr", {
            key: r.id ?? i, className: "row", onClick: () => setEditing({ ...r }),
          },
            React.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)", maxWidth: 220 } }, r.title ?? "-"),
            React.createElement("td", null, React.createElement(Badge, { plain: true }, typeLabel(r.type))),
            React.createElement("td", { className: "twb-muted", style: { maxWidth: 460 } },
              String(r.body ?? "").slice(0, 100)),
            React.createElement("td", { style: { width: 60, textAlign: "right" } },
              React.createElement("button", {
                className: "twb-btn ghost sm",
                onClick: (e: any) => { e.stopPropagation(); setEditing({ ...r }); },
              }, "编辑"))))),

    editing ? React.createElement(React.Fragment, null,
      React.createElement("div", { className: "twb-drawer-mask", onClick: () => setEditing(null) }),
      React.createElement("div", { className: "twb-drawer" },
        React.createElement("header", null,
          React.createElement("div", null,
            React.createElement("div", { className: "h" }, editing.id ? "编辑条目" : "录入条目"),
            React.createElement("div", { className: "s" }, "写得越具体，AI 回信越有据可依")),
          React.createElement("button", { className: "twb-btn secondary sm", onClick: () => setEditing(null) }, "关闭")),
        React.createElement("div", { className: "content" },
          React.createElement("div", { className: "twb-grid2" },
            React.createElement(Field, { label: "标题" },
              React.createElement(TextInput, {
                value: editing.title ?? "",
                onChange: (e: any) => setEditing({ ...editing, title: e.target.value }),
                placeholder: "如：不锈钢保温杯 500ml 规格与 MOQ",
              })),
            React.createElement(Field, { label: "类型" },
              React.createElement(Select, {
                value: editing.type ?? "product",
                onChange: (e: any) => setEditing({ ...editing, type: e.target.value }),
              }, TYPES.map(([v, l]) => React.createElement("option", { key: v, value: v }, l))))),
          React.createElement(Field, { label: "正文", hint: "建议写清参数、价格区间、交期、认证等硬信息" },
            React.createElement(TextArea, {
              rows: 16, value: editing.body ?? "",
              style: { minHeight: 320, fontFamily: "inherit" },
              onChange: (e: any) => setEditing({ ...editing, body: e.target.value }),
            })),
          React.createElement("div", { className: "twb-toolbar" },
            React.createElement("button", { className: "twb-btn", onClick: save, disabled: busy },
              busy ? "保存中…" : "保存"))))) : null);
}
