/**
 * 公司背调与市场扫描。
 *
 * 背调：RDAP WHOIS（域名年龄）+ 技术栈指纹 + 业务信号（招聘=扩张）。
 * 新注册的域名往往是小贸易商或空壳，老域名更可信 —— 这是判断买家质量的硬指标。
 */
import * as React from "react";
import { useState } from "react";
import { toasts, PageHead, Section, Empty, Table, TextInput, Badge, StatCard, KeyValue, Field } from "../ui.tsx";
import { leads } from "../api.ts";

const MARKETS = ["Brazil", "Mexico", "USA", "Germany", "UK", "Spain", "UAE", "India", "Vietnam", "Nigeria"];

export function Research() {
  const [domain, setDomain] = useState("");
  const [dossier, setDossier] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const [product, setProduct] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [scan, setScan] = useState<any[] | null>(null);

  const lookup = async () => {
    const d = domain.trim().replace(/^https?:\/\//, "").split("/")[0];
    if (!d) { toasts.push("填写域名，如 acme.com"); return; }
    setBusy(true); setDossier(null);
    try { setDossier(await leads.dossier(d)); }
    catch (e: any) { toasts.push("背调失败：" + e.message); }
    finally { setBusy(false); }
  };

  const doScan = async () => {
    if (!product.trim()) { toasts.push("填写产品词"); return; }
    setBusy(true); setScan(null);
    try {
      const r = await leads.marketScan(product.trim(), picked.length ? picked : undefined);
      setScan(Array.isArray(r) ? r : r?.markets ?? r?.results ?? []);
    } catch (e: any) { toasts.push("扫描失败：" + e.message); }
    finally { setBusy(false); }
  };

  const toggle = (m: string) => {
    setPicked(picked.includes(m) ? picked.filter((x) => x !== m) : [...picked, m]);
  };

  const age = dossier?.ageDays ?? dossier?.domainAgeDays;
  const young = typeof age === "number" && age < 365;

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "公司背调", sub: "域名年龄 · 技术栈 · 业务信号，判断买家可信度" }),

    React.createElement("div", {
      style: {
        padding: 13, marginBottom: 16, display: "flex", gap: 10,
        alignItems: "flex-end", flexWrap: "wrap",
        border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r)",
        background: "var(--twb-raised)",
      },
    },
      React.createElement(Field, { label: "客户域名" },
        React.createElement(TextInput, {
          placeholder: "acme.com", value: domain,
          onChange: (e: any) => setDomain(e.target.value), style: { minWidth: 260 },
          onKeyDown: (e: any) => { if (e.key === "Enter") lookup(); },
        })),
      React.createElement("div", { style: { marginBottom: 12 } },
        React.createElement("button", { className: "twb-btn", onClick: lookup, disabled: busy },
          busy ? "查询中…" : "开始背调"))),

    dossier ? React.createElement(React.Fragment, null,
      React.createElement("div", { className: "twb-cards" },
        React.createElement(StatCard, {
          label: "域名年龄",
          value: typeof age === "number" ? (age / 365).toFixed(1) + " 年" : "—",
          tone: typeof age !== "number" ? undefined : young ? "err" : "ok",
          sub: young ? "新注册域名，谨慎对待" : "域名较老，相对可信",
        }),
        React.createElement(StatCard, { label: "注册商", value: dossier.registrar ?? "—", sub: String(dossier.registrar ?? "") }),
        React.createElement(StatCard, {
          label: "技术栈", value: (dossier.tech ?? []).length + " 项",
          sub: (dossier.tech ?? []).slice(0, 3).join(", ") || "未识别",
        }),
        React.createElement(StatCard, {
          label: "业务信号", value: (dossier.signals ?? []).length + " 条",
          tone: (dossier.signals ?? []).length ? "accent" : undefined,
          sub: (dossier.signals ?? [])[0] ?? "未命中",
        })),

      (dossier.signals ?? []).length > 0 ? React.createElement(Section, { title: "业务信号" },
        React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap" } },
          dossier.signals.map((s: string, i: number) =>
            React.createElement(Badge, { key: i, tone: "accent" }, s)))) : null,

      (dossier.tech ?? []).length > 0 ? React.createElement(Section, { title: "技术栈" },
        React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap" } },
          dossier.tech.map((t: string, i: number) =>
            React.createElement(Badge, { key: i, plain: true }, t)))) : null,

      React.createElement(Section, { title: "Whois 信息" },
        React.createElement(KeyValue, {
          rows: [
            ["域名", dossier.domain ?? domain],
            ["创建时间", String(dossier.createdAt ?? dossier.creationDate ?? "—").slice(0, 10)],
            ["到期时间", String(dossier.expiresAt ?? dossier.expiryDate ?? "—").slice(0, 10)],
            ["注册商", dossier.registrar ?? "—"],
          ],
        }))) : null,

    React.createElement(Section, { title: "市场扫描" },
      React.createElement("div", {
        style: {
          padding: 13, marginBottom: 14, border: "1px solid var(--twb-line)",
          borderRadius: "var(--twb-r)", background: "var(--twb-raised)",
        },
      },
        React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" } },
          React.createElement(Field, { label: "产品词" },
            React.createElement(TextInput, {
              value: product, onChange: (e: any) => setProduct(e.target.value),
              placeholder: "hair dryer", style: { minWidth: 200 },
            })),
          React.createElement("div", { style: { marginBottom: 12 } },
            React.createElement("button", { className: "twb-btn", onClick: doScan, disabled: busy }, "扫描市场"))),
        React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 } },
          MARKETS.map((m) => React.createElement("button", {
            key: m,
            onClick: () => toggle(m),
            style: {
              font: "inherit", fontSize: 11, padding: "3px 10px", borderRadius: 4, cursor: "pointer",
              border: "1px solid " + (picked.includes(m) ? "var(--twb-accent-line)" : "var(--twb-line)"),
              background: picked.includes(m) ? "var(--twb-accent-dim)" : "transparent",
              color: picked.includes(m) ? "var(--twb-accent)" : "var(--twb-fg-3)",
            },
          }, m)),
          React.createElement("span", { className: "twb-dim", style: { alignSelf: "center", marginLeft: 4 } },
            picked.length ? `已选 ${picked.length} 个` : "不选=扫描全部预设市场"))),

      scan ? (scan.length === 0
        ? React.createElement(Empty, { title: "没有扫描到数据", desc: "该产品在这些市场可能搜索量极低，或搜索引擎被限流。" })
        : React.createElement(Table, { head: ["市场", "线索量", "竞争度", "建议"] },
            scan.map((m: any, i: number) => React.createElement("tr", { key: i },
              React.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, m.market ?? m.marketLabel ?? "-"),
              React.createElement("td", { className: "num" }, String(m.total ?? m.found ?? 0)),
              React.createElement("td", null,
                React.createElement(Badge, { tone: (m.competition ?? 0) > 0.6 ? "err" : (m.competition ?? 0) > 0.3 ? "warn" : "ok" },
                  typeof m.competition === "number" ? (m.competition * 100).toFixed(0) + "%" : "—")),
              React.createElement("td", { className: "twb-muted" }, m.advice ?? "—"))))) : null));
}
