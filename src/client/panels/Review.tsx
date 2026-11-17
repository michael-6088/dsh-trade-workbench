/**
 * 客服审核台：WhatsApp 待审队列 + 受控群发。
 *
 * 群发做成两段式：先预览（列出将发给谁、受什么限额约束），
 * 用户确认后才真正执行。一步到底的群发按钮太危险 ——
 * 一次误点可能把全库线索发一遍，账号直接封。
 */
import * as React from "react";
import { useEffect, useState } from "react";
import { toasts, PageHead, Section, Empty, Badge, Segmented, TextArea, TextInput, Table, StatCard, KeyValue, Field } from "../ui.tsx";
import { leads } from "../api.ts";

const STATUS_LABEL: Record<string, string> = {
  pending: "待审", sent: "已发送", skipped: "已跳过", failed: "失败",
};
function tone(s?: string): "ok" | "warn" | "err" | undefined {
  if (s === "sent") return "ok";
  if (s === "pending") return "warn";
  if (s === "failed") return "err";
  return undefined;
}

export function Review() {
  const [tab, setTab] = useState<"queue" | "broadcast">("queue");

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "客服审核", sub: "WhatsApp 消息人工确认后发送，AI 仅起草" }),
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(Segmented, {
        value: tab,
        options: [["queue", "审核队列"], ["broadcast", "受控群发"]],
        onChange: (v) => setTab(v as any),
      })),
    tab === "queue" ? React.createElement(QueuePane, null) : React.createElement(BroadcastPane, null));
}

/* ── 审核队列 ─────────────────────────────────────────── */

function QueuePane() {
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const reload = React.useCallback(() => {
    const p = filter === "pending" ? leads.waQueue() : leads.waMessages(100);
    p.then((r) => setRows(Array.isArray(r) ? r : [])).catch((e) => {
      toasts.push("加载审核队列失败：" + e.message);
    });
  }, [filter]);

  useEffect(() => { reload(); }, [reload]);

  const setDraft = (id: string, draft: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, draft } : r)));
  };

  const act = async () => {
    setBusy(true);
    try {
      toasts.push("发送动作由对话中的 AI 执行（wa_reply 工具，含频控与审计）", "ok");
    } finally { setBusy(false); }
  };

  const pending = rows.filter((r) => r.status === "pending");

  return React.createElement("div", null,
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(Segmented, {
        value: filter,
        options: [["pending", `待审 ${pending.length}`], ["all", "全部"]],
        onChange: (v) => setFilter(v as any),
      }),
      React.createElement("button", { className: "twb-btn secondary sm", onClick: reload }, "刷新")),

    rows.length === 0
      ? React.createElement(Empty, {
          title: filter === "pending" ? "暂无待审消息" : "暂无消息记录",
          desc: filter === "pending"
            ? "WhatsApp 收到新消息后会自动进队列；也可用「受控群发」主动发起。"
            : "配置 Evolution 网关后，聊天记录会出现在这里。",
        })
      : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
          rows.map((m) => React.createElement("div", {
            key: m.id,
            style: {
              border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r)",
              background: "var(--twb-raised)", overflow: "hidden", maxWidth: 760,
            },
          },
            React.createElement("div", {
              style: {
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                borderBottom: "1px solid var(--twb-hairline)", background: "var(--twb-sunken)",
              },
            },
              React.createElement("span", { style: { fontWeight: 600, fontSize: 12.5, color: "var(--twb-fg)" } },
                m.from ?? m.chatId ?? "未知发送方"),
              React.createElement(Badge, { tone: tone(m.status) }, STATUS_LABEL[m.status] ?? m.status ?? "-"),
              React.createElement("span", { className: "twb-mono twb-dim", style: { marginLeft: "auto" } },
                String(m.ts ?? "").slice(0, 19).replace("T", " "))),

            React.createElement("div", { style: { padding: 14 } },
              React.createElement("div", {
                style: {
                  background: "var(--twb-sunken)", border: "1px solid var(--twb-line)",
                  borderRadius: "12px 12px 12px 3px", padding: "10px 13px",
                  fontSize: 12.5, lineHeight: 1.7, marginBottom: 12,
                  whiteSpace: "pre-wrap", color: "var(--twb-fg-2)", maxWidth: 560,
                },
              }, m.text ?? m.body ?? ""),

              React.createElement("div", { className: "twb-field" },
                React.createElement("label", null, "AI 草稿 / 回复内容"),
                React.createElement(TextArea, {
                  rows: 3, value: m.draft ?? "",
                  onChange: (e: any) => setDraft(m.id, e.target.value),
                  placeholder: "在此编辑回复内容…",
                })),

              React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
                React.createElement("button", { className: "twb-btn sm", disabled: busy, onClick: act }, "确认发送"),
                React.createElement("button", { className: "twb-btn secondary sm", disabled: busy, onClick: act }, "跳过"),
                React.createElement("span", { className: "twb-dim", style: { marginLeft: 4 } },
                  "实际发送由 wa_reply 工具执行（含频控与审计）")))))));
}

/* ── 受控群发 ─────────────────────────────────────────── */

function BroadcastPane() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("qualified");
  const [limit, setLimit] = useState(30);
  const [preview, setPreview] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const doPreview = async () => {
    if (!text.trim()) { toasts.push("先写要发送的内容"); return; }
    setBusy(true); setResult(null);
    try {
      setPreview(await leads.waBroadcastPreview(text.trim(), { status, limit }));
    } catch (e: any) { toasts.push("预览失败：" + e.message); }
    finally { setBusy(false); }
  };

  const doSend = async () => {
    if (!preview?.targets?.length) return;
    setBusy(true);
    try {
      const r = await leads.waBroadcastExecute(text.trim(), preview.targets);
      setResult(r);
      setPreview(null);
      toasts.push("广播已执行", "ok");
    } catch (e: any) { toasts.push("发送失败：" + e.message); }
    finally { setBusy(false); }
  };

  const overCap = preview && (preview.sentToday + preview.targets.length) > preview.cap;
  const resultPane = result ? renderResult(result) : null;

  return React.createElement("div", null,
    React.createElement("div", {
      style: {
        padding: 13, marginBottom: 16, border: "1px solid var(--twb-line)",
        borderRadius: "var(--twb-r)", background: "var(--twb-raised)", maxWidth: 780,
      },
    },
      React.createElement("div", { className: "twb-muted", style: { marginBottom: 12, lineHeight: 1.7 } },
        "群发有随机间隔与每日上限保护，连续 3 次失败会熔断。仍属高风险操作 —— 务必先预览确认收件人名单。"),
      React.createElement(Field, { label: "消息内容" },
        React.createElement(TextArea, {
          rows: 4, value: text,
          onChange: (e: any) => { setText(e.target.value); setPreview(null); },
          placeholder: "Hi {name}, we noticed you're sourcing…（建议简短、带明确价值点）",
        })),
      React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" } },
        React.createElement(Field, { label: "只发给处于此状态的线索" },
          React.createElement("select", {
            className: "twb-select",
            value: status,
            onChange: (e: any) => { setStatus(e.target.value); setPreview(null); },
          },
            [["qualified", "已评估"], ["contacted", "已触达"], ["replied", "已回复"], ["", "不限"]]
              .map(([v, l]) => React.createElement("option", { key: v, value: v }, l)))),
        React.createElement(Field, { label: "本次最多发送" },
          React.createElement(TextInput, {
            type: "number", min: 1, max: 100, value: limit,
            onChange: (e: any) => { setLimit(Number(e.target.value) || 30); setPreview(null); },
            style: { width: 96, minWidth: 96 },
          })),
        React.createElement("div", { style: { marginBottom: 12 } },
          React.createElement("button", { className: "twb-btn secondary", onClick: doPreview, disabled: busy },
            busy ? "统计中…" : "预览收件人")))),

    preview ? React.createElement(React.Fragment, null,
      React.createElement("div", { className: "twb-cards", style: { maxWidth: 780 } },
        React.createElement(StatCard, { label: "将发送", value: preview.targets.length, tone: "accent" }),
        React.createElement(StatCard, { label: "有号码线索", value: preview.total }),
        React.createElement(StatCard, {
          label: "今日已发", value: preview.sentToday,
          tone: overCap ? "err" : "ok",
          sub: `上限 ${preview.cap}`,
        }),
        React.createElement(StatCard, {
          label: "预计耗时",
          value: Math.ceil(preview.targets.length * ((preview.minDelaySec + preview.maxDelaySec) / 2) / 60) + " 分钟",
          sub: `间隔 ${preview.minDelaySec}–${preview.maxDelaySec} 秒`,
        })),

      overCap ? React.createElement("div", {
        style: {
          padding: "10px 13px", marginBottom: 14, maxWidth: 780,
          border: "1px solid color-mix(in srgb, var(--twb-err) 34%, transparent)",
          borderRadius: "var(--twb-r-sm)", background: "var(--twb-err-dim)",
          color: "var(--twb-err)", fontSize: 12,
        },
      }, `今日额度不足：已发 ${preview.sentToday} + 本次 ${preview.targets.length} 超过上限 ${preview.cap}，超出部分会被自动跳过。`) : null,

      React.createElement(Section, { title: "收件人名单（确认后再发送）" },
        React.createElement(Table, { head: ["号码", "公司"] },
          preview.targets.map((t: any, i: number) => React.createElement("tr", { key: i },
            React.createElement("td", { className: "mono", style: { color: "var(--twb-fg)" } }, t.number),
            React.createElement("td", { className: "twb-muted" }, t.company || "—"))))),

      React.createElement("div", { className: "twb-toolbar", style: { marginTop: 14 } },
        React.createElement("button", {
          className: "twb-btn danger", onClick: doSend, disabled: busy,
        }, busy ? "发送中…" : `确认发送给 ${preview.targets.length} 个号码`),
        React.createElement("button", {
          className: "twb-btn secondary",
          onClick: () => setPreview(null),
        }, "取消"),
        React.createElement("span", { className: "twb-dim" }, "取消不会产生任何发送"))) : null,

    result ? resultPane : null);
}

/** 发送结果：单独提取，避免与上面的嵌套三元混在一起看不清括号。 */
function renderResult(result: any) {
  const ok = result.sent ?? (result.results ?? []).filter((r: any) => !r.skipped && !r.error).length;
  const skip = result.skipped ?? (result.results ?? []).filter((r: any) => r.skipped).length;
  const fail = result.failed ?? (result.results ?? []).filter((r: any) => r.error).length;
  return React.createElement(Section, { title: "发送结果" },
    React.createElement("div", { style: { maxWidth: 780 } },
      React.createElement(KeyValue, {
        rows: [["成功", String(ok)], ["跳过", String(skip)], ["失败", String(fail)]],
      }),
      React.createElement("pre", {
        className: "twb-pre",
        style: { marginTop: 12, maxHeight: 240, overflow: "auto" },
      }, JSON.stringify(result, null, 2))));
}
