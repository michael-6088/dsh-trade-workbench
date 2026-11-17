/**
 * 谷歌获客：三层搜索 → 结果表 → 批量加工入 CRM。
 *
 * 工业风做法：搜索条件收进一条紧凑的控制条（工具栏），结果用统一表格容器，
 * 评分用状态色徽章而非 emoji —— 一屏内能看到更多线索且对齐整齐。
 */
import * as React from "react";
import { toasts, PageHead, Section, Empty, Table, TextInput, Select, Badge, Field } from "../ui.tsx";
import { leads } from "../api.ts";

const MARKETS = [
  "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru",
  "USA", "Germany", "UK", "France", "Spain", "Italy", "Poland",
  "UAE", "Saudi Arabia", "Turkey", "Egypt", "Nigeria", "Kenya", "South Africa",
  "India", "Vietnam", "Thailand", "Indonesia", "Malaysia", "Philippines",
];

const LAYERS: [string, string][] = [
  ["基础搜索", "产品词 + 买家词（importer / distributor / wholesaler）"],
  ["LinkedIn 定向", "按采购/老板职位词搜决策人"],
  ["采购信号", "询盘、招标、新店开业等强意图信号"],
];

function tierTone(tier?: string): "ok" | "warn" | "err" | undefined {
  const t = String(tier ?? "");
  if (t.includes("极高") || t.includes("高")) return "ok";
  if (t.includes("中")) return "warn";
  if (t.includes("低")) return "err";
  return undefined;
}

export function Leads() {
  const [product, setProduct] = React.useState("");
  const [market, setMarket] = React.useState("Brazil");
  const [perLayer, setPerLayer] = React.useState(10);
  const [busy, setBusy] = React.useState(false);
  const [run, setRun] = React.useState<any>(null);
  const [runs, setRuns] = React.useState<any[]>([]);
  const [sel, setSel] = React.useState<Set<number>>(new Set());

  const reloadRuns = React.useCallback(() => {
    leads.runs(20).then((r) => setRuns(Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  React.useEffect(() => { reloadRuns(); }, [reloadRuns]);

  const doSearch = async () => {
    if (!product.trim()) { toasts.push("先填产品词"); return; }
    setBusy(true);
    setSel(new Set());
    try {
      const r = await leads.search({ product: product.trim(), market, perLayer });
      setRun(r);
      reloadRuns();
      const n = r?.results?.length ?? r?.leads?.length ?? 0;
      toasts.push(`搜索完成，得到 ${n} 条线索`, "ok");
    } catch (e: any) {
      toasts.push("搜索失败：" + e.message);
    } finally {
      setBusy(false);
    }
  };

  const results: any[] = run?.results ?? run?.leads ?? [];

  const toggle = (i: number) => {
    const next = new Set(sel);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSel(next);
  };
  const toggleAll = () => {
    setSel(sel.size === results.length ? new Set() : new Set(results.map((_, i) => i)));
  };

  const enrichSelected = async () => {
    const urls = [...sel].map((i) => results[i]?.url).filter(Boolean);
    if (urls.length === 0) { toasts.push("先勾选要加工的线索"); return; }
    setBusy(true);
    try {
      const r = await leads.enrich(urls, market);
      const added = r?.imported ?? r?.leads?.length ?? 0;
      toasts.push(`加工完成，${added} 条入 CRM`, "ok");
      reloadRuns();
    } catch (e: any) {
      toasts.push("加工失败：" + e.message);
    } finally {
      setBusy(false);
    }
  };

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "谷歌获客", sub: "三层检索：基础词 → LinkedIn 决策人 → 采购信号" }),

    // 控制条：搜索条件集中一行
    React.createElement("div", {
      style: {
        display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap",
        padding: 13, marginBottom: 16,
        border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r)",
        background: "var(--twb-raised)",
      },
    },
      React.createElement(Field, { label: "产品词（英文）" },
        React.createElement(TextInput, {
          placeholder: "stainless steel bottle",
          value: product, onChange: (e: any) => setProduct(e.target.value),
          style: { minWidth: 260 },
          onKeyDown: (e: any) => { if (e.key === "Enter") doSearch(); },
        })),
      React.createElement(Field, { label: "目标市场" },
        React.createElement(Select, { value: market, onChange: (e: any) => setMarket(e.target.value) },
          MARKETS.map((m) => React.createElement("option", { key: m, value: m }, m)))),
      React.createElement(Field, { label: "每层条数" },
        React.createElement(TextInput, {
          type: "number", min: 1, max: 30, value: perLayer,
          onChange: (e: any) => setPerLayer(Number(e.target.value) || 10),
          style: { width: 78, minWidth: 78 },
        })),
      React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12 } },
        React.createElement("button", { className: "twb-btn", onClick: doSearch, disabled: busy },
          busy ? "搜索中…" : "开始搜索"),
        sel.size > 0 ? React.createElement("button", {
          className: "twb-btn secondary", onClick: enrichSelected, disabled: busy,
        }, `加工勾选 (${sel.size})`) : null)),

    // 三层说明：紧凑胶囊
    React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 } },
      LAYERS.map(([k, v], i) => React.createElement("div", {
        key: k,
        style: {
          flex: "1 1 200px", padding: "9px 12px",
          border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r-sm)",
          background: "var(--twb-sunken)",
        },
      },
        React.createElement("div", { style: { fontSize: 11, fontWeight: 620, color: "var(--twb-accent)", marginBottom: 3, letterSpacing: ".02em" } },
          `第 ${i + 1} 层 · ${k}`),
        React.createElement("div", { className: "twb-dim", style: { lineHeight: 1.55 } }, v)))),

    results.length > 0 ? React.createElement(Section, { title: `搜索结果 · ${results.length} 条` },
      React.createElement("div", { className: "twb-toolbar" },
        React.createElement(Badge, { plain: true }, "引擎 " + (run?.engine ?? "-")),
        run?.engineFallbacks?.length
          ? React.createElement(Badge, { tone: "warn" }, "引擎切换: " + run.engineFallbacks.join(", "))
          : null,
        React.createElement("span", { className: "spacer" }),
        React.createElement("label", { className: "twb-muted", style: { display: "flex", gap: 6, alignItems: "center", cursor: "pointer" } },
          React.createElement("input", {
            type: "checkbox",
            checked: sel.size === results.length && results.length > 0,
            onChange: toggleAll,
          }), "全选")),
      React.createElement(Table, { head: ["", "公司", "评分", "标题", ""] },
        results.map((r, i) => React.createElement("tr", { key: i, className: "row" },
          React.createElement("td", { style: { width: 32 } },
            React.createElement("input", { type: "checkbox", checked: sel.has(i), onChange: () => toggle(i) })),
          React.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } },
            r.company || r.title || "-"),
          React.createElement("td", { style: { width: 76 } },
            React.createElement(Badge, { tone: tierTone(r.tier) }, (r.score ?? 0) + (r.tier ? " " + r.tier : ""))),
          React.createElement("td", { className: "twb-muted", style: { maxWidth: 460 } },
            (r.snippet ?? r.title ?? "").slice(0, 90)),
          React.createElement("td", { style: { width: 56, textAlign: "right" } },
            r.url ? React.createElement("a", {
              href: r.url, target: "_blank", rel: "noreferrer",
              style: { color: "var(--twb-accent)", fontSize: 11.5, textDecoration: "none" },
            }, "打开 ↗") : null))))) : null,

    runs.length > 0 ? React.createElement(Section, { title: "历史搜索" },
      React.createElement(Table, { head: ["时间", "产品", "市场", "结果数"] },
        runs.map((r) => React.createElement("tr", {
          key: r.id, className: "row",
          onClick: () => leads.run(r.id).then(setRun).catch(() => {}),
        },
          React.createElement("td", { className: "mono twb-muted" },
            String(r.createdAt ?? r.ts ?? "").slice(0, 19).replace("T", " ")),
          React.createElement("td", null, r.product ?? "-"),
          React.createElement("td", null, r.market ?? "-"),
          React.createElement("td", { className: "num" }, String(r.results?.length ?? r.leads?.length ?? 0)))))) : null);
}
