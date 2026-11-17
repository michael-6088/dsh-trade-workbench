/**
 * 邮箱发现与验证：域名 → 常见模式猜测 → MX + SMTP 探测。
 */
import * as React from "react";
import { toasts, PageHead, Section, Empty, Table, TextInput, Badge, Field } from "../ui.tsx";
import { leads } from "../api.ts";

const STATUS_LABEL: Record<string, string> = {
  valid: "有效", guessed: "猜测未验", "catch-all": "整域接收",
  invalid: "无效", "no-mx": "无 MX", unverifiable: "无法验证",
};
function statusTone(s?: string): "ok" | "warn" | "err" | undefined {
  if (s === "valid") return "ok";
  if (s === "invalid" || s === "no-mx") return "err";
  if (s) return "warn";
  return undefined;
}

export function EmailFinder() {
  const [domain, setDomain] = React.useState("");
  const [first, setFirst] = React.useState("");
  const [last, setLast] = React.useState("");
  const [single, setSingle] = React.useState("");
  const [found, setFound] = React.useState<any>(null);
  const [verified, setVerified] = React.useState<any>(null);
  const [busy, setBusy] = React.useState(false);

  const doFind = async () => {
    if (!domain.trim()) { toasts.push("先填域名，如 acme.com"); return; }
    setBusy(true); setFound(null); setVerified(null);
    try {
      setFound(await leads.emailFind({ domain: domain.trim(), first, last }));
    } catch (e: any) {
      toasts.push("查找失败：" + e.message);
    } finally { setBusy(false); }
  };

  const doVerify = async (email?: string) => {
    const target = (email ?? single).trim();
    if (!target) { toasts.push("先填要验证的邮箱"); return; }
    setBusy(true); setVerified(null);
    try {
      const r = await leads.emailVerify(target);
      setVerified({ email: target, ...r });
    } catch (e: any) {
      toasts.push("验证失败：" + e.message);
    } finally { setBusy(false); }
  };

  const candidates: string[] = found?.candidates ?? found?.emails ?? [];
  const badges: any[] = found?.results ?? [];
  const list = badges.length ? badges : candidates.map((c) => ({ email: c }));

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "邮箱验证", sub: "模式猜测 + MX 解析 + SMTP RCPT 探测" }),

    React.createElement("div", {
      style: {
        padding: 13, marginBottom: 16, display: "flex", gap: 10,
        alignItems: "flex-end", flexWrap: "wrap",
        border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r)",
        background: "var(--twb-raised)",
      },
    },
      React.createElement(Field, { label: "域名" },
        React.createElement(TextInput, {
          placeholder: "acme.com", value: domain,
          onChange: (e: any) => setDomain(e.target.value), style: { minWidth: 180 },
          onKeyDown: (e: any) => { if (e.key === "Enter") doFind(); },
        })),
      React.createElement(Field, { label: "名（可选）" },
        React.createElement(TextInput, {
          placeholder: "John", value: first,
          onChange: (e: any) => setFirst(e.target.value), style: { minWidth: 100 },
        })),
      React.createElement(Field, { label: "姓（可选）" },
        React.createElement(TextInput, {
          placeholder: "Smith", value: last,
          onChange: (e: any) => setLast(e.target.value), style: { minWidth: 100 },
        })),
      React.createElement("div", { style: { marginBottom: 12 } },
        React.createElement("button", { className: "twb-btn", onClick: doFind, disabled: busy },
          busy ? "处理中…" : "查找邮箱"))),

    found ? React.createElement(Section, { title: `命中 ${list.length} 个候选` },
      found.mx ? React.createElement("div", { style: { marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" } },
        React.createElement("span", { className: "twb-dim" }, "MX 记录"),
        (Array.isArray(found.mx) ? found.mx : [found.mx]).map((m: string, i: number) =>
          React.createElement(Badge, { key: i, plain: true }, String(m)))) : null,
      list.length === 0
        ? React.createElement(Empty, { title: "没有找到候选邮箱", desc: "该域名可能没有可猜测的公开邮箱格式，或网站无法访问。" })
        : React.createElement(Table, { head: ["邮箱", "状态", ""] },
            list.map((c: any, i: number) => React.createElement("tr", { key: i },
              React.createElement("td", { className: "mono", style: { color: "var(--twb-fg)" } }, c.email ?? c.address ?? String(c)),
              React.createElement("td", { style: { width: 110 } },
                c.status ? React.createElement(Badge, { tone: statusTone(c.status) }, STATUS_LABEL[c.status] ?? c.status) : React.createElement("span", { className: "twb-dim" }, "未验证")),
              React.createElement("td", { style: { width: 70, textAlign: "right" } },
                React.createElement("button", {
                  className: "twb-btn secondary sm",
                  onClick: () => doVerify(c.email ?? c.address),
                }, "验证")))))) : null,

    React.createElement(Section, { title: "直接验证单个邮箱" },
      React.createElement("div", { className: "twb-toolbar" },
        React.createElement(TextInput, {
          placeholder: "buyer@acme.com", value: single,
          onChange: (e: any) => setSingle(e.target.value), style: { minWidth: 260 },
          onKeyDown: (e: any) => { if (e.key === "Enter") doVerify(); },
        }),
        React.createElement("button", { className: "twb-btn", onClick: () => doVerify(), disabled: busy }, "验证")),
      verified ? React.createElement("div", {
        style: {
          marginTop: 12, maxWidth: 460, padding: 14,
          border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r)",
          background: "var(--twb-raised)",
        },
      },
        React.createElement("div", { className: "twb-mono", style: { fontSize: 12.5, marginBottom: 8, color: "var(--twb-fg)" } }, verified.email),
        React.createElement(Badge, { tone: statusTone(verified.status) },
          STATUS_LABEL[verified.status] ?? verified.status ?? "未知"),
        verified.reason ? React.createElement("div", { className: "twb-muted", style: { marginTop: 8, lineHeight: 1.6 } }, verified.reason) : null,
        verified.catchAll ? React.createElement("div", { className: "twb-dim", style: { marginTop: 6 } }, "该域为 catch-all，结果仅供参考") : null) : null));
}
