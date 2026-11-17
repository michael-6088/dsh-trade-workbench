import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { setTab, setTheme, state } from "./store.ts";

/**
 * 全局命令面板（Ctrl/Cmd + K）。
 *
 * 19 个 Tab 平铺在顶栏，做到"能看见"但做不到"秒切换"。
 * 命令面板解决的是后者：模糊搜页名、跳 Tab、切主题、执行备份。
 *
 * 设计取舍：
 * - 只做纯前端动作（切页/切主题），业务操作仍留在各面板里，
 *   避免"命令面板能删数据"这种危险能力。
 * - 键盘优先：↑↓ 移动、Enter 执行、Esc 关闭；鼠标也可点。
 * - 不用第三方库，匹配用简单的子序列打分，中文按包含匹配。
 */

export interface Command {
  id: string;
  title: string;
  group: string;
  hint?: string;
  run: () => void;
}

/** 子序列打分：字符按顺序出现即命中，连续与开头命中给高分。 */
function score(text: string, query: string): number {
  if (!query) return 1;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q)) {
    // 开头命中 > 中间命中
    return 100 - t.indexOf(q) + (t.startsWith(q) ? 50 : 0);
  }
  // 退化为子序列匹配：q 的字符按序出现在 t 中
  let ti = 0;
  let matched = 0;
  let streak = 0;
  let bonus = 0;
  for (const ch of q) {
    const idx = t.indexOf(ch, ti);
    if (idx === -1) return -1;
    if (idx === ti) { streak += 1; bonus += streak * 2; } else { streak = 0; }
    ti = idx + 1;
    matched += 1;
  }
  return matched > 0 ? bonus + matched : -1;
}

export function CommandPalette(props: {
  open: boolean;
  onClose: () => void;
  tabs: [string, string][];
}) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<any>(null);

  const commands: Command[] = useMemo(() => {
    const list: Command[] = props.tabs.map(([id, label]) => ({
      id: "tab:" + id,
      title: label,
      group: "跳转页面",
      hint: id,
      run: () => { setTab(id); props.onClose(); },
    }));
    list.push(
      { id: "theme:auto", title: "主题：跟随系统", group: "设置", run: () => { setTheme("auto"); props.onClose(); } },
      { id: "theme:dark", title: "主题：深色", group: "设置", run: () => { setTheme("dark"); props.onClose(); } },
      { id: "theme:light", title: "主题：浅色", group: "设置", run: () => { setTheme("light"); props.onClose(); } },
    );
    return list;
  }, [props.tabs, props.onClose]);

  const results = useMemo(() => {
    const scored = commands
      .map((c) => ({ c, s: score(c.title + " " + (c.hint ?? ""), q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    return scored.map((x) => x.c);
  }, [commands, q]);

  useEffect(() => {
    if (props.open) {
      setQ("");
      setCursor(0);
      // 打开后立刻聚焦输入框，键盘可直接输入
      setTimeout(() => { try { inputRef.current?.focus(); } catch { /* 忽略 */ } }, 0);
    }
  }, [props.open]);

  useEffect(() => { setCursor(0); }, [q]);

  if (!props.open) return null;

  const onKeyDown = (e: any) => {
    if (e.key === "Escape") { e.preventDefault(); props.onClose(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      results[cursor]?.run();
    }
  };

  // 按 group 分组展示，保持命令面板的可扫读性
  const groups: { name: string; items: Command[] }[] = [];
  for (const c of results) {
    const g = groups.find((x) => x.name === c.group);
    if (g) g.items.push(c);
    else groups.push({ name: c.group, items: [c] });
  }

  let flatIndex = 0;

  return React.createElement("div", {
    className: "twb-cmdk-mask",
    onClick: (e: any) => { if (e.target === e.currentTarget) props.onClose(); },
  },
    React.createElement("div", { className: "twb-cmdk", onKeyDown },
      React.createElement("input", {
        ref: inputRef,
        className: "twb-cmdk-input",
        placeholder: "搜索页面、命令…",
        value: q,
        onChange: (e: any) => setQ(e.target.value),
        onKeyDown,
      }),
      results.length === 0
        ? React.createElement("div", { className: "twb-cmdk-empty" }, "没有匹配的命令")
        : React.createElement("div", { className: "twb-cmdk-list" },
            groups.map((g) => React.createElement(React.Fragment, { key: g.name },
              React.createElement("div", { className: "twb-cmdk-group" }, g.name),
              g.items.map((c) => {
                const idx = flatIndex++;
                return React.createElement("div", {
                  key: c.id,
                  className: "twb-cmdk-item" + (idx === cursor ? " on" : ""),
                  onMouseEnter: () => setCursor(idx),
                  onClick: () => c.run(),
                },
                  React.createElement("span", null, c.title),
                  c.hint ? React.createElement("span", { className: "hint" }, c.hint) : null);
              })))),
      React.createElement("div", { className: "twb-cmdk-foot" },
        React.createElement("span", null, React.createElement("kbd", null, "↑"), " ", React.createElement("kbd", null, "↓"), " 选择"),
        React.createElement("span", null, React.createElement("kbd", null, "Enter"), " 执行"),
        React.createElement("span", null, React.createElement("kbd", null, "Esc"), " 关闭"),
        React.createElement("span", { style: { marginLeft: "auto" } }, `当前：${state.tab}`))));
}
