/**
 * 邮件模板库：开发信模板增删改查，支持 spintax 变体。
 */
import * as React from "react";
import { toasts, PageHead, Section, Empty, Table, TextInput, TextArea, Select, Badge, Field } from "../ui.tsx";
import { leads } from "../api.ts";

const LANGS = [["en", "英语"], ["es", "西语"], ["pt", "葡语"], ["zh", "中文"]] as const;
const langLabel = (k?: string) => (LANGS.find(([v]) => v === k) ?? [, k ?? "-"])[1];

export function Templates() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [editing, setEditing] = React.useState<any>(null);
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(() => {
    leads.templatesList().then((r) => setRows(Array.isArray(r) ? r : [])).catch(() => setRows([]));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);

  const blank = { name: "", language: "en", subject: "", body: "", tags: [] };

  const save = async () => {
    if (!editing?.name?.trim()) { toasts.push("模板要有个名字"); return; }
    setBusy(true);
    try {
      await leads.templatesSave(editing);
      toasts.push("已保存", "ok");
      setEditing(null);
      reload();
    } catch (e: any) {
      toasts.push("保存失败：" + e.message);
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    try {
      await leads.templatesDelete(id);
      toasts.push("已删除", "ok");
      reload();
    } catch (e: any) {
      toasts.push("删除失败：" + e.message);
    }
  };

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "邮件模板", sub: "开发信模板 · 支持变量与 spintax 变体" }),

    React.createElement("div", { className: "twb-toolbar" },
      React.createElement("button", { className: "twb-btn", onClick: () => setEditing({ ...blank }) }, "+ 新建模板"),
      React.createElement("span", { className: "spacer" }),
      React.createElement("span", { className: "twb-muted" }, `共 ${rows.length} 个模板`)),

    rows.length === 0
      ? React.createElement(Empty, {
          title: "还没有模板",
          desc: "新建一个模板作为开发信底稿。发送时可用 {Name} {Company} 变量，以及 {Hi|Hello|Hey} 这类随机变体。",
          action: React.createElement("button", { className: "twb-btn", onClick: () => setEditing({ ...blank }) }, "新建第一个模板"),
        })
      : React.createElement(Table, { head: ["名称", "语言", "主题", "使用次数", ""] },
          rows.map((t) => React.createElement("tr", { key: t.id },
            React.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, t.name ?? "-"),
            React.createElement("td", null, React.createElement(Badge, { plain: true }, langLabel(t.language))),
            React.createElement("td", { className: "twb-muted", style: { maxWidth: 320 } }, (t.subject ?? "").slice(0, 60) || "—"),
            React.createElement("td", { className: "num" }, String(t.usedCount ?? t.uses ?? 0)),
            React.createElement("td", { style: { width: 110, textAlign: "right" } },
              React.createElement("button", { className: "twb-btn secondary sm", style: { marginRight: 6 }, onClick: () => setEditing({ ...t }) }, "编辑"),
              React.createElement("button", { className: "twb-btn ghost sm", onClick: () => remove(t.id) }, "删除"))))),

    editing ? React.createElement(React.Fragment, null,
      React.createElement("div", { className: "twb-drawer-mask", onClick: () => setEditing(null) }),
      React.createElement("div", { className: "twb-drawer" },
        React.createElement("header", null,
          React.createElement("div", null,
            React.createElement("div", { className: "h" }, editing.id ? "编辑模板" : "新建模板"),
            React.createElement("div", { className: "s" }, "变量与 spintax 会在发送时展开")),
          React.createElement("button", { className: "twb-btn secondary sm", onClick: () => setEditing(null) }, "关闭")),
        React.createElement("div", { className: "content" },
          React.createElement("div", { className: "twb-grid2" },
            React.createElement(Field, { label: "名称" },
              React.createElement(TextInput, {
                value: editing.name ?? "",
                onChange: (e: any) => setEditing({ ...editing, name: e.target.value }),
              })),
            React.createElement(Field, { label: "语言" },
              React.createElement(Select, {
                value: editing.language ?? "en",
                onChange: (e: any) => setEditing({ ...editing, language: e.target.value }),
              }, LANGS.map(([k, v]) => React.createElement("option", { key: k, value: k }, v))))),
          React.createElement(Field, { label: "主题" },
            React.createElement(TextInput, {
              value: editing.subject ?? "",
              onChange: (e: any) => setEditing({ ...editing, subject: e.target.value }),
              placeholder: "如 {Company} - our stainless bottles",
            })),
          React.createElement(Field, { label: "正文" },
            React.createElement(TextArea, {
              rows: 14,
              value: editing.body ?? "",
              style: { minHeight: 280, fontFamily: "inherit" },
              onChange: (e: any) => setEditing({ ...editing, body: e.target.value }),
              placeholder: "支持 {Name} {Company} 变量与 {a|b|c} spintax 变体",
            }), "变量：{Name} {Company} {Country}　·　Spintax：{Hi|Hello|Hey} 发送时随机选一个"),
          React.createElement("button", { className: "twb-btn", onClick: save, disabled: busy },
            busy ? "保存中…" : "保存模板")))) : null);
}
