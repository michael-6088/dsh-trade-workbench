import * as React from "react";
import { useEffect, useState } from "react";
import { api } from "./api.ts";
import { dataVersion, state, toasts, closeDrawer, setTheme, cycleTheme } from "./store.ts";
export { toasts };

export function useVersion(): number {
  const [, force] = useState(0);
  useEffect(() => dataVersion.subscribe(() => force((x) => x + 1)), []);
  return dataVersion.snapshotVersion;
}

export function money(cents: number, currency = "USD"): string {
  if (!Number.isFinite(cents)) return "-";
  return currency + " " + (cents / 100).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 紧凑金额：上万自动缩写，用于统计卡等空间有限处。 */
export function moneyShort(cents: number, currency = "USD"): string {
  if (!Number.isFinite(cents)) return "-";
  const v = cents / 100;
  const abs = Math.abs(v);
  if (abs >= 1e7) return currency + " " + (v / 1e6).toFixed(2) + "M";
  if (abs >= 1e4) return currency + " " + (v / 1e3).toFixed(1) + "K";
  return currency + " " + v.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

export function pct(v: number, digits = 1): string {
  if (!Number.isFinite(v)) return "-";
  return (v * 100).toFixed(digits) + "%";
}

/* ── 布局原语 ─────────────────────────────────────────── */

export function PageHead(props: { title: string; sub?: string; children?: React.ReactNode }) {
  return React.createElement("div", { className: "twb-page-head" },
    React.createElement("div", null,
      React.createElement("div", { className: "twb-page-title" }, props.title),
      props.sub ? React.createElement("div", { className: "twb-page-sub" }, props.sub) : null),
    props.children ? React.createElement("div", { className: "spacer", style: { flex: 1 } }) : null,
    props.children);
}

export function Section(props: { title?: string; children?: React.ReactNode }) {
  return React.createElement(React.Fragment, null,
    props.title ? React.createElement("div", { className: "twb-section" }, props.title) : null,
    props.children);
}

export function StatCard(props: { label: string; value: React.ReactNode; sub?: string; tone?: "ok" | "warn" | "err" | "accent" }) {
  return React.createElement("div", { className: "twb-card" + (props.tone ? " tone-" + props.tone : "") },
    React.createElement("div", { className: "k" }, props.label),
    React.createElement("div", { className: "v" }, props.value),
    props.sub ? React.createElement("div", { className: "sub" }, props.sub) : null);
}

export function Empty(props: { title: string; desc?: string; action?: React.ReactNode }) {
  return React.createElement("div", { className: "twb-empty" },
    React.createElement("div", { className: "ico" },
      React.createElement("svg", { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" },
        React.createElement("rect", { x: 4, y: 4, width: 16, height: 16, rx: 2 }),
        React.createElement("path", { d: "M4 10h16M10 10v10" }))),
    React.createElement("div", { className: "t" }, props.title),
    props.desc ? React.createElement("div", { className: "d" }, props.desc) : null,
    props.action);
}

/** 表格容器：统一边框、圆角、粘性表头。 */
export function Table(props: { head: React.ReactNode[]; children?: React.ReactNode }) {
  return React.createElement("div", { className: "twb-table-wrap" },
    React.createElement("table", { className: "twb-table" },
      React.createElement("thead", null,
        React.createElement("tr", null, props.head.map((h, i) => React.createElement("th", { key: i }, h)))),
      React.createElement("tbody", null, props.children)));
}

/* ── 表单原语 ─────────────────────────────────────────── */

export function Field(props: { label: string; children?: React.ReactNode; hint?: string }) {
  return React.createElement("div", { className: "twb-field" },
    React.createElement("label", null, props.label),
    props.children,
    props.hint ? React.createElement("div", { className: "twb-dim" }, props.hint) : null);
}

export function TextInput(props: any) {
  return React.createElement("input", { className: "twb-input", ...props });
}
export function TextArea(props: any) {
  return React.createElement("textarea", { className: "twb-input", ...props });
}
export function Select(props: any) {
  return React.createElement("select", { className: "twb-select", ...props });
}

/** 分段控件：比下拉更快的少量互斥选项。 */
export function Segmented(props: { value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return React.createElement("div", { className: "twb-seg" },
    props.options.map(([v, label]) => React.createElement("button", {
      key: v, type: "button",
      className: v === props.value ? "on" : "",
      onClick: () => props.onChange(v),
    }, label)));
}

export function Badge(props: { tone?: "ok" | "warn" | "err" | "info" | "accent"; plain?: boolean; children?: React.ReactNode }) {
  const cls = ["twb-badge", props.tone ?? "", props.plain ? "plain" : ""].filter(Boolean).join(" ");
  return React.createElement("span", { className: cls }, props.children);
}

/* ── Toast ────────────────────────────────────────────── */

export function Toasts() {
  useVersion();
  if (toasts.items.length === 0) return null;
  return React.createElement("div", { className: "twb-toast-stack" },
    toasts.items.map((t: any) =>
      React.createElement("div", { key: t.id, className: "twb-toast" + (t.kind === "ok" ? " ok" : "") }, t.text)));
}

/* ── 数据钩子 ─────────────────────────────────────────── */

export function useList(domain: string, q: string): { rows: any[]; reload: () => void; loading: boolean } {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = () => {
    setLoading(true);
    api.list(domain, q)
      .then((r: any) => setRows(Array.isArray(r) ? r : []))
      .catch((e: any) => { toasts.push("加载失败：" + e.message); setRows([]); })
      .finally(() => setLoading(false));
  };
  useEffect(reload, [domain, q]);
  return { rows, reload, loading };
}

export async function saveRow(domain: string, body: any, id?: number): Promise<any> {
  const row = id
    ? await api.update(domain, id, body)
    : await api.create(domain, body);
  toasts.push("已保存", "ok");
  return row;
}

/* ── 抽屉 ─────────────────────────────────────────────── */

export function Drawer(props: { domain: string; render: (row: any, close: () => void, reload: () => void) => React.ReactNode }) {
  useVersion();
  const [row, setRow] = useState<any>(null);
  const { drawer } = state;
  const reload = () => {
    if (drawer) api.get(props.domain, drawer.id).then(setRow).catch(() => setRow(null));
  };
  useEffect(reload, [drawer?.id, drawer?.domain]);
  if (!drawer) return null;
  const title = row?.no ?? row?.name ?? row?.id ?? props.domain;
  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "twb-drawer-mask", onClick: closeDrawer }),
    React.createElement("div", { className: "twb-drawer" },
      React.createElement("header", null,
        React.createElement("div", null,
          React.createElement("div", { className: "h" }, String(title)),
          React.createElement("div", { className: "s" }, props.domain)),
        React.createElement("button", { className: "twb-btn secondary sm", onClick: closeDrawer }, "关闭")),
      React.createElement("div", { className: "content" },
        row ? props.render(row, closeDrawer, reload)
          : React.createElement("div", null,
              React.createElement(Skeleton, { w: "40%", h: 11, style: { marginBottom: 16 } }),
              React.createElement(TableSkeleton, { rows: 4, cols: 3 })))));
}

export function SearchBar(props: { q: string; onQ: (v: string) => void; children?: React.ReactNode }) {
  return React.createElement("div", { className: "twb-toolbar" },
    React.createElement(TextInput, { placeholder: "搜索…", value: props.q, onChange: (e: any) => props.onQ(e.target.value) }),
    props.children);
}

/** KV 列表：只读信息的紧凑排版。 */
export function KeyValue(props: { rows: [string, React.ReactNode][] }) {
  return React.createElement("div", { className: "twb-kv" },
    props.rows.map(([k, v], i) =>
      React.createElement("div", { key: i, className: "r" },
        React.createElement("span", { className: "k" }, k),
        React.createElement("span", { className: "v" }, v))));
}


/* ── 骨架屏 ───────────────────────────────────────────── */

/** 骨架块：模拟最终内容形状，比「加载中…」更能降低等待焦虑。 */
export function Skeleton(props: { w?: number | string; h?: number; r?: number; style?: React.CSSProperties }) {
  return React.createElement("div", {
    className: "twb-skel",
    style: {
      width: typeof props.w === "number" ? props.w + "px" : (props.w ?? "100%"),
      height: (props.h ?? 12) + "px",
      borderRadius: (props.r ?? 4) + "px",
      ...(props.style ?? {}),
    },
  });
}

/** 表格骨架：N 行 M 列，用于列表页首屏。 */
export function TableSkeleton(props: { rows?: number; cols?: number }) {
  const rows = props.rows ?? 6;
  const cols = props.cols ?? 4;
  return React.createElement("div", { className: "twb-table-wrap", style: { padding: 12 } },
    React.createElement("div", { style: { display: "flex", gap: 14, marginBottom: 14 } },
      Array.from({ length: cols }).map((_, i) =>
        React.createElement(Skeleton, { key: i, w: i === 0 ? "28%" : "16%", h: 9 }))),
    Array.from({ length: rows }).map((_, r) =>
      React.createElement("div", { key: r, style: { display: "flex", gap: 14, marginBottom: 13 } },
        Array.from({ length: cols }).map((_, c) =>
          React.createElement(Skeleton, {
            key: c,
            w: c === 0 ? "28%" : "16%",
            h: 11,
            // 逐行递减不透明度，制造"内容正在填充"的错觉
            style: { opacity: Math.max(0.35, 1 - r * 0.11) },
          })))));
}

/** 统计卡骨架。 */
export function CardsSkeleton(props: { n?: number }) {
  return React.createElement("div", { className: "twb-cards" },
    Array.from({ length: props.n ?? 6 }).map((_, i) =>
      React.createElement("div", { key: i, className: "twb-card" },
        React.createElement(Skeleton, { w: "52%", h: 9, style: { marginBottom: 10 } }),
        React.createElement(Skeleton, { w: "68%", h: 20 }))));
}

/* ── 排序表格 ─────────────────────────────────────────── */

export interface Column {
  /** 列头文案 */
  label: string;
  /** 取值函数；给 undefined 则该列不参与排序 */
  get?: (row: any) => any;
  /** 列宽 */
  width?: number;
  /** 数字列右对齐 + 等宽 */
  num?: boolean;
  /** 自定义渲染 */
  render?: (row: any, index: number) => React.ReactNode;
}

/**
 * 可排序表格。
 *
 * 只做前端排序：数据量在千级以内，一次拉全再排比后端翻页简单得多，
 * 也避免了每次点击都发一次请求的延迟感。列头点击切换升/降序。
 */
export function useSortedRows<T = any>(rows: T[], columns: Column[]) {
  const [key, setKey] = React.useState<number>(-1);
  const [asc, setAsc] = React.useState(true);

  const toggle = (i: number) => {
    if (!columns[i]?.get) return;
    if (key === i) setAsc(!asc);
    else { setKey(i); setAsc(true); }
  };

  const sorted = React.useMemo(() => {
    if (key < 0 || !columns[key]?.get) return rows;
    const get = columns[key].get!;
    const out = [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return va - vb;
      return String(va).localeCompare(String(vb), "zh-CN", { numeric: true });
    });
    return asc ? out : out.reverse();
  }, [rows, key, asc, columns]);

  return { sorted, key, asc, toggle };
}

/** 带排序表头的表格；配合 useSortedRows 使用。 */
export function SortableTable(props: {
  columns: Column[];
  rows: any[];
  sortKey: number;
  asc: boolean;
  onSort: (i: number) => void;
  onRowClick?: (row: any, index: number) => void;
  empty?: React.ReactNode;
}) {
  const { columns, rows, sortKey, asc, onSort, onRowClick } = props;
  if (rows.length === 0 && props.empty) return React.createElement(React.Fragment, null, props.empty);
  return React.createElement("div", { className: "twb-table-wrap" },
    React.createElement("table", { className: "twb-table" },
      React.createElement("thead", null,
        React.createElement("tr", null, columns.map((c, i) =>
          React.createElement("th", {
            key: i,
            className: c.num ? "num" : undefined,
            style: {
              width: c.width,
              cursor: c.get ? "pointer" : undefined,
              userSelect: "none",
              // 排序中的列高亮，让用户知道当前按什么排
              color: sortKey === i ? "var(--twb-accent)" : undefined,
            },
            onClick: () => onSort(i),
          },
            c.label,
            c.get ? React.createElement("span", {
              style: { marginLeft: 5, opacity: sortKey === i ? 1 : 0.25, fontSize: 9 },
            }, sortKey === i ? (asc ? "▲" : "▼") : "⇅") : null)))),
      React.createElement("tbody", null, rows.map((row, ri) =>
        React.createElement("tr", {
          key: row.id ?? ri,
          className: onRowClick ? "row" : undefined,
          onClick: onRowClick ? () => onRowClick(row, ri) : undefined,
        },
          columns.map((c, ci) =>
            React.createElement("td", {
              key: ci,
              className: c.num ? "num" : undefined,
            }, c.render ? c.render(row, ri) : String(c.get?.(row) ?? ""))))))));
}

/* ── 主题切换 ─────────────────────────────────────────── */

const THEME_ICON: Record<string, string> = {
  auto: "◐",
  dark: "◑",
  light: "○",
};
const THEME_LABEL: Record<string, string> = {
  auto: "跟随系统",
  dark: "深色",
  light: "浅色",
};

export function ThemeToggle() {
  useVersion();
  const mode = state.theme ?? "auto";
  return React.createElement("button", {
    className: "twb-btn ghost icon",
    title: `主题：${THEME_LABEL[mode]}（点击切换）`,
    onClick: () => { cycleTheme(); },
  }, React.createElement("span", { style: { fontSize: 14, lineHeight: 1 } }, THEME_ICON[mode] ?? "◐"));
}
