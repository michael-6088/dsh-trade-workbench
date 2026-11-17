/**
 * 系统运维：定时任务、抑制名单、官网监控、邮箱预热、审计日志。
 *
 * 这些是"后台在替你干活"的部分，放在一个面板里集中查看，
 * 避免用户不知道有哪些自动化在跑、跑成什么样。
 */
import * as React from "react";
import { useEffect, useState } from "react";
import { toasts, PageHead, Section, Empty, Table, TextInput, Badge, KeyValue, Field, Segmented } from "../ui.tsx";
import { leads } from "../api.ts";

export function Ops() {
  const [tab, setTab] = useState<"cron" | "suppress" | "monitor" | "audit">("cron");
  const [cron, setCron] = useState<any>(null);
  const [suppress, setSuppress] = useState<any>(null);
  const [monitor, setMonitor] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [warmup, setWarmup] = useState<any>(null);

  useEffect(() => {
    leads.cronStatus().then(setCron).catch(() => {});
    leads.suppressList().then(setSuppress).catch(() => {});
    leads.monitorList().then((r) => setMonitor(Array.isArray(r) ? r : [])).catch(() => {});
    leads.auditQuery({ limit: 60 }).then((r) => setAudit(Array.isArray(r) ? r : [])).catch(() => {});
    leads.warmupStatus().then(setWarmup).catch(() => {});
  }, []);

  const jobs: any[] = Array.isArray(cron) ? cron : cron?.jobs ?? Object.values(cron?.jobs ?? {});
  const sup: any[] = Array.isArray(suppress) ? suppress : suppress?.entries ?? [];

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "系统运维", sub: "自动化任务、抑制名单、监控与审计" }),

    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(Segmented, {
        value: tab,
        options: [["cron", "定时任务"], ["suppress", "抑制名单"], ["monitor", "官网监控"], ["audit", "审计日志"]],
        onChange: (v) => setTab(v as any),
      })),

    tab === "cron" ? React.createElement("div", null,
      jobs.length === 0
        ? React.createElement(Empty, { title: "没有运行中的定时任务", desc: "定时任务负责：WhatsApp 收件箱轮询、邮件序列执行、回复扫描、官网监控、每日日报。" })
        : React.createElement(Table, { head: ["任务", "用途", "上次运行", "结果"] },
            jobs.map((j: any, i: number) => React.createElement("tr", { key: i },
              React.createElement("td", { className: "mono", style: { color: "var(--twb-fg)", fontWeight: 550 } }, j.name ?? j.id ?? "-"),
              React.createElement("td", { className: "twb-muted" }, j.description ?? "—"),
              React.createElement("td", { className: "mono twb-muted" }, String(j.lastRun ?? "").slice(0, 19).replace("T", " ") || "未运行"),
              React.createElement("td", null,
                j.lastError
                  ? React.createElement(Badge, { tone: "err" }, String(j.lastError).slice(0, 40))
                  : React.createElement(Badge, { tone: j.lastRun ? "ok" : "warn" }, j.lastResult ? String(j.lastResult).slice(0, 40) : (j.lastRun ? "正常" : "待运行")))))),
      warmup ? React.createElement(Section, { title: "邮箱预热" },
        React.createElement(KeyValue, {
          rows: [
            ["预热状态", warmup.enabled ? "已开启" : "未开启"],
            ["今日额度", String(warmup.todayBudget ?? warmup.maxPerDay ?? "—")],
            ["参与邮箱", String(warmup.partners ?? 0)],
          ],
        })) : null)
      : tab === "suppress" ? React.createElement("div", null,
          React.createElement(SuppressView, { sup, onReload: () => leads.suppressList().then(setSuppress).catch(() => {}) }))
        : tab === "monitor" ? React.createElement("div", null,
            monitor.length === 0
              ? React.createElement(Empty, { title: "没有监控目标", desc: "盯住客户官网变化（新品、招聘、扩张），命中信号就是触达时机。可在对话里让 AI 用 monitor_watch 添加。" })
              : React.createElement(Table, { head: ["域名", "监控信号", "上次检查"] },
                  monitor.map((m: any, i: number) => React.createElement("tr", { key: i },
                    React.createElement("td", { className: "mono", style: { color: "var(--twb-fg)" } }, m.domain ?? m.url ?? "-"),
                    React.createElement("td", { className: "twb-muted" }, (m.keywords ?? m.signals ?? []).join(", ") || "默认信号词"),
                    React.createElement("td", { className: "mono twb-muted" }, String(m.lastCheck ?? "").slice(0, 19).replace("T", " ") || "—")))))
          : React.createElement("div", null,
              audit.length === 0
                ? React.createElement(Empty, { title: "暂无审计记录", desc: "所有发送、状态变更、配置改动都会记录在这里。" })
                : React.createElement(Table, { head: ["时间", "动作", "操作者", "详情"] },
                    audit.map((a: any, i: number) => React.createElement("tr", { key: i },
                      React.createElement("td", { className: "mono twb-muted", style: { whiteSpace: "nowrap" } },
                        String(a.ts ?? "").slice(0, 19).replace("T", " ")),
                      React.createElement("td", { className: "mono", style: { color: "var(--twb-fg)" } }, a.action ?? "-"),
                      React.createElement("td", null, React.createElement(Badge, { plain: true }, a.actor ?? "-")),
                      React.createElement("td", { className: "twb-muted", style: { maxWidth: 420 } },
                        typeof a.detail === "string" ? a.detail : JSON.stringify(a.detail ?? {}).slice(0, 110)))))));
}

/** 抑制名单：可增删的地址/域名黑名单。 */
function SuppressView(props: { sup: any[]; onReload: () => void }) {
  const [val, setVal] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!val.trim()) { toasts.push("填写要拦截的邮箱或域名"); return; }
    setBusy(true);
    try {
      await leads.suppressAdd(val.trim(), reason);
      toasts.push("已加入抑制名单", "ok");
      setVal(""); setReason("");
      props.onReload();
    } catch (e: any) { toasts.push("添加失败：" + e.message); }
    finally { setBusy(false); }
  };

  const remove = async (v: string) => {
    try {
      await leads.suppressRemove(v);
      toasts.push("已移除", "ok");
      props.onReload();
    } catch (e: any) { toasts.push("移除失败：" + e.message); }
  };

  const entries = props.sup.map((s: any) =>
    typeof s === "string" ? { value: s, reason: "" } : s);

  return React.createElement("div", null,
    React.createElement("div", {
      style: {
        padding: 13, marginBottom: 16, border: "1px solid var(--twb-line)",
        borderRadius: "var(--twb-r)", background: "var(--twb-raised)",
      },
    },
      React.createElement("div", { className: "twb-muted", style: { marginBottom: 10, lineHeight: 1.7 } },
        "退订（STOP/ALTO/PARAR）与退信会进这里。地址级与域名级两级拦截，发送时强制执行 —— 这是法律与域名信誉的底线。"),
      React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" } },
        React.createElement(Field, { label: "邮箱或域名" },
          React.createElement(TextInput, {
            value: val, onChange: (e: any) => setVal(e.target.value),
            placeholder: "buyer@example.com 或 example.com", style: { minWidth: 240 },
          })),
        React.createElement(Field, { label: "原因（可选）" },
          React.createElement(TextInput, {
            value: reason, onChange: (e: any) => setReason(e.target.value),
            placeholder: "用户退订 / 硬退信", style: { minWidth: 180 },
          })),
        React.createElement("div", { style: { marginBottom: 12 } },
          React.createElement("button", { className: "twb-btn", onClick: add, disabled: busy }, "加入名单")))),

    entries.length === 0
      ? React.createElement(Empty, { title: "抑制名单为空", desc: "收到退订或退信后会自动加入。也可以手动添加不想触达的地址。" })
      : React.createElement(Table, { head: ["地址 / 域名", "原因", ""] },
          entries.map((s: any, i: number) => React.createElement("tr", { key: i },
            React.createElement("td", { className: "mono", style: { color: "var(--twb-fg)" } }, s.value ?? s.address ?? "-"),
            React.createElement("td", { className: "twb-muted" }, s.reason || "—"),
            React.createElement("td", { style: { width: 60, textAlign: "right" } },
              React.createElement("button", {
                className: "twb-btn ghost sm",
                onClick: () => remove(s.value ?? s.address),
              }, "移除"))))));
}
