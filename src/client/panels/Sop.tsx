/**
 * SOP 阶段机：八阶段获客流程的任务看板。
 *
 * 上游把阶段顺序锁在服务端（不可跳步），草稿审批用哈希绑定（改动即失效）。
 * 这个面板的价值是让"强制流程"变得可见可操作 —— 用户能一眼看到
 * 当前卡在哪一步、下一阶段要做什么、哪些草稿等着审批。
 */
import * as React from "react";
import { useState } from "react";
import { toasts, PageHead, Section, Empty, Table, TextInput, Badge, Field, KeyValue } from "../ui.tsx";
import { leads } from "../api.ts";

const STAGES = ["parse", "discover", "enrich", "score", "draft", "approve", "outreach", "close"] as const;
const STAGE_CN: Record<string, string> = {
  parse: "解析需求", discover: "搜索线索", enrich: "加工线索", score: "评估打分",
  draft: "生成草稿", approve: "人工审批", outreach: "触达", close: "结案",
};

function stageIndex(s?: string): number {
  const i = STAGES.indexOf((s ?? "parse") as any);
  return i < 0 ? 0 : i;
}

export function Sop() {
  const [rows, setRows] = useState<any[]>([]);
  const [goal, setGoal] = useState("");
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("");
  const [detail, setDetail] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const reload = React.useCallback(() => {
    leads.sopList().then((r) => setRows(Array.isArray(r) ? r : [])).catch((e) => toasts.push("加载失败：" + e.message));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);

  const create = async () => {
    if (!goal.trim()) { toasts.push("先写清目标，如：开发 3 个墨西哥电吹风买家"); return; }
    setBusy(true);
    try {
      await leads.sopCreate({ goal: goal.trim(), product, market });
      toasts.push("SOP 任务已创建", "ok");
      setGoal(""); setProduct(""); setMarket("");
      reload();
    } catch (e: any) { toasts.push("创建失败：" + e.message); }
    finally { setBusy(false); }
  };

  const openDetail = async (task: any) => {
    try { setDetail(await leads.sopStatus(task.id)); }
    catch (e: any) { toasts.push("加载详情失败：" + e.message); }
  };

  const advance = async (id: string) => {
    try {
      await leads.sopNext(id);
      toasts.push("已推进到下一阶段", "ok");
      reload();
      if (detail?.id === id) setDetail(await leads.sopStatus(id));
    } catch (e: any) { toasts.push("推进失败：" + e.message); }
  };

  const approve = async (id: string, hash: string) => {
    try {
      await leads.sopApprove(id, hash);
      toasts.push("草稿已审批通过", "ok");
      reload();
      setDetail(await leads.sopStatus(id));
    } catch (e: any) { toasts.push("审批失败：" + e.message); }
  };

  return React.createElement("div", null,
    React.createElement(PageHead, {
      title: "SOP 阶段机",
      sub: "八阶段强制顺序 · 开发信发送前必须人工审批（草稿改动即失效）",
    }),

    React.createElement("div", {
      style: {
        padding: 13, marginBottom: 18,
        border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r)",
        background: "var(--twb-raised)",
      },
    },
      React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" } },
        React.createElement(Field, { label: "目标 *" },
          React.createElement(TextInput, {
            placeholder: "开发 3 个墨西哥电吹风买家",
            value: goal, onChange: (e: any) => setGoal(e.target.value),
            style: { minWidth: 300 }, onKeyDown: (e: any) => { if (e.key === "Enter") create(); },
          })),
        React.createElement(Field, { label: "产品" },
          React.createElement(TextInput, { placeholder: "hair dryer", value: product, onChange: (e: any) => setProduct(e.target.value), style: { minWidth: 160 } })),
        React.createElement(Field, { label: "市场" },
          React.createElement(TextInput, { placeholder: "Mexico", value: market, onChange: (e: any) => setMarket(e.target.value), style: { minWidth: 120 } })),
        React.createElement("div", { style: { marginBottom: 12 } },
          React.createElement("button", { className: "twb-btn", onClick: create, disabled: busy },
            busy ? "创建中…" : "新建 SOP 任务")))),

    React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 18 } },
      STAGES.map((s, i) => React.createElement("div", {
        key: s,
        style: {
          flex: "1 1 90px", padding: "8px 10px", textAlign: "center",
          border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r-sm)",
          background: "var(--twb-sunken)", fontSize: 11,
          color: s === "approve" ? "var(--twb-accent)" : "var(--twb-fg-3)",
          borderColor: s === "approve" ? "var(--twb-accent-line)" : undefined,
        },
      },
        React.createElement("div", { style: { fontFamily: "var(--twb-mono)", fontSize: 10, opacity: .5, marginBottom: 2 } }, String(i + 1)),
        STAGE_CN[s]))),

    rows.length === 0
      ? React.createElement(Empty, {
          title: "还没有 SOP 任务",
          desc: "SOP 把「搜线索 → 评分 → 写信 → 审批 → 触达 → 结案」串成强制流程，防止跳步漏审。",
        })
      : React.createElement(Table, { head: ["目标", "当前阶段", "进度", "状态", ""] },
          rows.map((t: any) => {
            const idx = stageIndex(t.stage);
            return React.createElement("tr", { key: t.id, className: "row", onClick: () => openDetail(t) },
              React.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, t.goal ?? "-"),
              React.createElement("td", null,
                React.createElement(Badge, { plain: true, tone: t.stage === "approve" ? "accent" : undefined },
                  STAGE_CN[t.stage] ?? t.stage ?? "-")),
              React.createElement("td", { style: { width: 130 } },
                React.createElement("div", { className: "twb-bar-track" },
                  React.createElement("div", { className: "twb-bar", style: { width: ((idx + 1) / STAGES.length * 100) + "%" } }))),
              React.createElement("td", null,
                React.createElement(Badge, { tone: t.closed ? "ok" : "warn" }, t.closed ? "已结案" : "进行中")),
              React.createElement("td", { style: { width: 70, textAlign: "right" } },
                React.createElement("button", {
                  className: "twb-btn secondary sm",
                  onClick: (e: any) => { e.stopPropagation(); advance(t.id); },
                }, "推进")));
          })),

    detail ? React.createElement(React.Fragment, null,
      React.createElement("div", { className: "twb-drawer-mask", onClick: () => setDetail(null) }),
      React.createElement("div", { className: "twb-drawer" },
        React.createElement("header", null,
          React.createElement("div", null,
            React.createElement("div", { className: "h" }, detail.goal ?? "SOP 任务"),
            React.createElement("div", { className: "s" }, `当前：${STAGE_CN[detail.stage] ?? detail.stage}`)),
          React.createElement("button", { className: "twb-btn secondary sm", onClick: () => setDetail(null) }, "关闭")),
        React.createElement("div", { className: "content" },
          React.createElement(Section, { title: "阶段进度" },
            React.createElement("div", { className: "twb-steps" },
              STAGES.map((s, i) => React.createElement("div", {
                key: s,
                className: "twb-step" + (i <= stageIndex(detail.stage) ? " done" : ""),
                style: { cursor: "default" },
              }, `${i + 1}. ${STAGE_CN[s]}`)))),

          detail.drafts?.length ? React.createElement(Section, { title: "待审批草稿" },
            detail.drafts.map((d: any, i: number) => React.createElement("div", {
              key: i,
              style: {
                border: "1px solid var(--twb-line)", borderRadius: "var(--twb-r-sm)",
                padding: 12, marginBottom: 10, background: "var(--twb-sunken)",
              },
            },
              React.createElement("div", { style: { fontWeight: 600, fontSize: 12.5, marginBottom: 6 } },
                d.subject || d.to || `草稿 #${i + 1}`),
              React.createElement("div", { className: "twb-pre", style: { maxHeight: 200, overflow: "auto", marginBottom: 8 } },
                d.body ?? d.text ?? ""),
              React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
                React.createElement(Badge, { tone: d.approved ? "ok" : "warn" }, d.approved ? "已审批" : "待审批"),
                React.createElement("button", {
                  className: "twb-btn sm",
                  disabled: d.approved,
                  onClick: () => approve(detail.id, d.hash),
                }, "审批通过"),
                React.createElement("span", { className: "twb-dim" },
                  "审批后如再改动正文，审批自动失效"))))) : null,

          React.createElement(Section, { title: "任务信息" },
            React.createElement(KeyValue, {
              rows: [
                ["任务 ID", React.createElement("span", { className: "twb-mono" }, detail.id ?? "-")],
                ["产品", detail.product || "—"],
                ["市场", detail.market || "—"],
                ["创建时间", String(detail.createdAt ?? "").slice(0, 19).replace("T", " ")],
              ],
            })),

          React.createElement("div", { className: "twb-toolbar" },
            React.createElement("button", {
              className: "twb-btn", onClick: () => advance(detail.id),
            }, `推进到「${STAGE_CN[STAGES[Math.min(stageIndex(detail.stage) + 1, STAGES.length - 1)]]}」`),
            React.createElement("button", {
              className: "twb-btn secondary", onClick: async () => {
                try { await leads.sopClose(detail.id); toasts.push("已结案", "ok"); reload(); setDetail(null); }
                catch (e: any) { toasts.push(e.message); }
              },
            }, "结案"))))) : null);
}
