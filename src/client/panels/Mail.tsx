/**
 * 邮件中心：写开发信 → 预览 → 发送 → 启动跟进序列。
 *
 * 对应上游散在多个工具里的能力（email_compose / email_send / sequence_start），
 * 整合成一屏：左边选线索，中间看草稿，右边发或排进序列。
 * dry-run 状态始终可见，避免误以为在真发信。
 */
import * as React from "react";
import { useEffect, useState } from "react";
import { toasts, PageHead, Section, Empty, Table, TextInput, TextArea, Badge, Field, KeyValue, Segmented } from "../ui.tsx";
import { leads } from "../api.ts";

const LANGS: [string, string][] = [["en", "英语"], ["es", "西语"], ["pt", "葡语"]];

export function Mail() {
  const [pool, setPool] = useState<any[]>([]);
  const [picked, setPicked] = useState<any | null>(null);
  const [lang, setLang] = useState("en");
  const [kind, setKind] = useState("first");
  const [draft, setDraft] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [sm, setSm] = useState<any>(null);
  const [tab, setTab] = useState<"compose" | "seq">("compose");

  useEffect(() => {
    leads.crmList("").then((r) => {
      const list = Array.isArray(r) ? r : r?.leads ?? [];
      setPool(list);
      if (!picked && list.length) setPicked(list[0]);
    }).catch(() => {});
    leads.configSummary().then(setSm).catch(() => {});
  }, []);

  const dryRun = sm?.smtp?.dryRun !== false;
  const emails: string[] = picked?.contacts?.emails ?? [];
  const to = emails[0] ?? "";

  const compose = async () => {
    if (!picked) { toasts.push("先选一条线索"); return; }
    setBusy(true); setDraft(null);
    try {
      const r = await leads.emailCompose(picked.id, {
        language: lang, kind, contactName: picked.contacts?.contact,
      });
      setDraft(r);
    } catch (e: any) { toasts.push("生成失败：" + e.message); }
    finally { setBusy(false); }
  };

  const send = async () => {
    if (!to) { toasts.push("线索没有邮箱，先去「邮箱验证」找"); return; }
    if (!draft?.subject) { toasts.push("先生成或填写草稿"); return; }
    setBusy(true);
    try {
      const r = await leads.emailSend({
        to, subject: draft.subject, text: draft.body ?? draft.text ?? "",
      });
      toasts.push(dryRun ? "已写入预览（dry-run 模式，未真发）" : "邮件已发送", "ok");
    } catch (e: any) { toasts.push("发送失败：" + e.message); }
    finally { setBusy(false); }
  };

  const startSeq = async () => {
    if (!picked) return;
    setBusy(true);
    try {
      await leads.seqStart(picked.id, undefined, lang);
      toasts.push(dryRun ? "序列已创建（演练模式）" : "跟进序列已启动", "ok");
    } catch (e: any) { toasts.push("启动失败：" + e.message); }
    finally { setBusy(false); }
  };

  /** 写邮件区：左侧线索列表 + 右侧撰写面板。拆成函数是为了避免深层三元嵌套。 */
  const composePane = () => React.createElement("div", {
    style: { display: "grid", gridTemplateColumns: "minmax(200px, 280px) minmax(0, 1fr)", gap: 16, alignItems: "start" },
  },
    React.createElement("div", {
      style: {
        border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r)",
        background: "var(--twb-raised)", overflow: "hidden",
      },
    },
      React.createElement("div", {
        style: {
          padding: "9px 12px", borderBottom: "1px solid var(--twb-hairline)",
          background: "var(--twb-sunken)", fontSize: 11, fontWeight: 600,
          letterSpacing: ".06em", textTransform: "uppercase", color: "var(--twb-fg-4)",
        },
      }, `线索池 · ${pool.length}`),
      React.createElement("div", { style: { maxHeight: 460, overflow: "auto" } },
        pool.length === 0
          ? React.createElement("div", { className: "twb-muted", style: { padding: 16 } },
              "线索池为空，先去「线索搜索」加工几条。")
          : pool.map((l) => React.createElement("div", {
              key: l.id,
              onClick: () => { setPicked(l); setDraft(null); },
              style: {
                padding: "9px 12px", cursor: "pointer", fontSize: 12,
                borderBottom: "1px solid var(--twb-hairline)",
                background: picked?.id === l.id ? "var(--twb-accent-dim)" : undefined,
                borderLeft: picked?.id === l.id ? "2px solid var(--twb-accent)" : "2px solid transparent",
              },
            },
              React.createElement("div", { style: { fontWeight: 550, color: "var(--twb-fg)", marginBottom: 2 } },
                l.company || l.domain || l.id),
              React.createElement("div", { style: { fontSize: 10.5, color: "var(--twb-fg-4)" } },
                [(l.contacts?.emails ?? [])[0] ?? "无邮箱", l.market].filter(Boolean).join(" · ")))))),
    React.createElement("div", null, composeRight()));

  /** 右侧：撰写表单或空态。再拆一层，每层只保留一个条件分支。 */
  const composeRight = () => {
    if (!picked) {
      return React.createElement(Empty, { title: "从左侧选一条线索", desc: "选好线索后即可生成开发信。" });
    }
    const recipient = to
      ? React.createElement("div", { className: "twb-dim", style: { marginBottom: 10 } }, "收件人：" + to)
      : React.createElement("div", { style: { marginBottom: 10 } },
          React.createElement(Badge, { tone: "err" }, "该线索没有邮箱，需先到「邮箱验证」查找"));

    const editor = draft
      ? React.createElement("div", null,
          React.createElement(Field, { label: "主题" },
            React.createElement(TextInput, {
              value: draft.subject ?? "",
              onChange: (e: any) => setDraft({ ...draft, subject: e.target.value }),
            })),
          React.createElement(Field, { label: "正文" },
            React.createElement(TextArea, {
              rows: 14, value: draft.body ?? draft.text ?? "",
              style: { minHeight: 260, fontFamily: "inherit" },
              onChange: (e: any) => setDraft({ ...draft, body: e.target.value }),
            })),
          React.createElement("div", { className: "twb-toolbar" },
            React.createElement("button", { className: "twb-btn", onClick: send, disabled: busy || !to },
              busy ? "发送中…" : (dryRun ? "发送（演练）" : "发送邮件")),
            React.createElement("button", { className: "twb-btn secondary", onClick: startSeq, disabled: busy },
              "改为排进序列"),
            React.createElement("span", { className: "twb-muted" },
              dryRun ? "当前 dry-run，只落预览不发信" : "将真实发出，注意日上限")))
      : React.createElement(Empty, {
          title: "还没有草稿",
          desc: "点「AI 生成草稿」，系统会结合 ICP 画像与线索信息写出开发信；也可以直接手写。",
          action: React.createElement("button", {
            className: "twb-btn secondary",
            onClick: () => setDraft({ subject: "", body: "" }),
          }, "手写一封"),
        });

    return React.createElement(React.Fragment, null,
      React.createElement("div", { className: "twb-toolbar" },
        React.createElement(Field, { label: "语言" },
          React.createElement(Segmented, { value: lang, options: LANGS, onChange: setLang })),
        React.createElement(Field, { label: "类型" },
          React.createElement(Segmented, {
            value: kind,
            options: [["first", "首封"], ["followup", "跟进"]],
            onChange: setKind,
          })),
        React.createElement("span", { className: "spacer" }),
        React.createElement("button", { className: "twb-btn", onClick: compose, disabled: busy },
          busy ? "生成中…" : "AI 生成草稿")),
      recipient,
      editor);
  };

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "邮件中心", sub: "开发信生成 → 预览 → 发送 / 排进跟进序列" }),

    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(Segmented, {
        value: tab,
        options: [["compose", "写邮件"], ["seq", "跟进序列"]],
        onChange: (v) => setTab(v as any),
      }),
      React.createElement("span", { className: "spacer" }),
      sm ? React.createElement(Badge, { tone: dryRun ? "warn" : "ok" },
        dryRun ? "演练模式（不真发）" : "真实发送") : null),

    tab === "compose" ? composePane() : React.createElement(SequencePane, { pool, sm, dryRun }),

    React.createElement(Section, { title: "配置状态" },
      sm ? React.createElement(KeyValue, {
        rows: [
          ["SMTP", sm.smtp?.ready ? `已配置（${sm.smtp.from}）` : "未配置，无法发信"],
          ["日上限", sm.smtp?.dailyCap ? `${sm.smtp.dailyCap} 封/天` : "未设上限"],
          ["ICP 画像", sm.icp?.ready ? sm.icp.product : "未设置，AI 不知道你卖什么"],
          ["DeepSeek", sm.deepseek?.ready ? "已配置" : "未配置，只能用模板兜底"],
        ],
      }) : React.createElement("div", { className: "twb-muted" }, "加载中…")));
}

/** 跟进序列：按线索查看进度并启停。 */
function SequencePane(props: { pool: any[]; sm: any; dryRun: boolean }) {
  return React.createElement("div", null,
    React.createElement("div", {
      style: {
        padding: 13, marginBottom: 16, border: "1px solid var(--twb-line)",
        borderRadius: "var(--twb-r)", background: "var(--twb-raised)",
      },
    },
      React.createElement("div", { className: "twb-muted", style: { lineHeight: 1.8 } },
        React.createElement("div", null, "跟进序列按 Day 0 / 3 / 7 / 14 四步自动跟进，回复即停。"),
        React.createElement("div", null, "发送只在收件人当地时间工作日 9–19 点进行，窗外自动顺延。"),
        React.createElement("div", null, props.dryRun ? "当前演练模式：序列只标记不真发。" : "当前真实发送：受日上限与邮箱总上限保护。"))),

    props.pool.length === 0
      ? React.createElement(Empty, { title: "线索池为空", desc: "先加工几条线索，再回来启动序列。" })
      : React.createElement(SeqRows, { pool: props.pool }));
}

function SeqRows(props: { pool: any[] }) {
  const [status, setStatus] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const check = async (id: string) => {
    try {
      const r = await leads.seqStatus(id);
      setStatus((m) => ({ ...m, [id]: r }));
    } catch { /* 无序列时忽略 */ }
  };

  useEffect(() => { for (const l of props.pool) check(l.id); }, [props.pool]);

  const start = async (id: string) => {
    setBusy(id);
    try {
      await leads.seqStart(id);
      toasts.push("序列已启动", "ok");
      await check(id);
    } catch (e: any) { toasts.push("启动失败：" + e.message); }
    finally { setBusy(null); }
  };

  const stop = async (id: string) => {
    setBusy(id);
    try {
      await leads.seqStop(id);
      toasts.push("序列已停止", "ok");
      await check(id);
    } catch (e: any) { toasts.push("停止失败：" + e.message); }
    finally { setBusy(null); }
  };

  return React.createElement(Table, { head: ["线索", "序列状态", "已发", "下一步", ""] },
    props.pool.map((l) => {
      const s = status[l.id];
      const active = s?.active;
      return React.createElement("tr", { key: l.id },
        React.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, l.company || l.domain || l.id),
        React.createElement("td", null,
          React.createElement(Badge, { tone: active ? "ok" : "plain" as any },
            s ? (active ? "进行中" : "已结束") : "未启动")),
        React.createElement("td", { className: "num" }, String(s?.sentCount ?? 0)),
        React.createElement("td", { className: "mono twb-muted" }, s?.nextDue ?? "—"),
        React.createElement("td", { style: { width: 120, textAlign: "right" } },
          active
            ? React.createElement("button", { className: "twb-btn secondary sm", disabled: busy === l.id, onClick: () => stop(l.id) }, "停止")
            : React.createElement("button", { className: "twb-btn sm", disabled: busy === l.id, onClick: () => start(l.id) }, "启动")));
    }));
}
