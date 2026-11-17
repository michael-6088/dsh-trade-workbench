/**
 * 线索池：CRM 状态机看板 + 列表视图。
 * 看板列头用状态色竖条标注阶段，卡片紧凑显示评分与快捷流转。
 */
import * as React from "react";
import { toasts, PageHead, Section, Empty, TextInput, Badge, Segmented, KeyValue, SortableTable, useSortedRows, TableSkeleton, type Column } from "../ui.tsx";
import { leads } from "../api.ts";

const STATUSES = ["new", "qualified", "contacted", "replied", "quoted", "won", "lost"] as const;
const LABELS: Record<string, string> = {
  new: "新线索", qualified: "已评估", contacted: "已触达",
  replied: "已回复", quoted: "已报价", won: "已成交", lost: "已流失",
};
// 全部走主题令牌：硬编码色在浅色模式下对比度会掉到 3:1 以下
const COLORS: Record<string, string> = {
  new: "var(--twb-fg-3)", qualified: "var(--twb-info)", contacted: "var(--twb-violet)",
  replied: "var(--twb-cyan)", quoted: "var(--twb-accent)", won: "var(--twb-ok)", lost: "var(--twb-err)",
};

function scoreTone(score: number): "ok" | "warn" | "err" {
  if (score >= 8) return "ok";
  if (score >= 4) return "warn";
  return "err";
}

export function LeadsPool() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [q, setQ] = React.useState("");
  const [view, setView] = React.useState<"board" | "list">("board");
  const [detail, setDetail] = React.useState<any>(null);
  const [acts, setActs] = React.useState<any[]>([]);
  const [converting, setConverting] = React.useState(false);

  const reload = React.useCallback(() => {
    leads.crmList(q).then((r) => setRows(Array.isArray(r) ? r : r?.leads ?? [])).catch((e) => {
      toasts.push("加载线索失败：" + e.message);
    });
  }, [q]);

  React.useEffect(() => { reload(); }, [reload]);

  const openDetail = async (lead: any) => {
    setDetail(lead);
    try { setActs(await leads.crmActivities(lead.id)); } catch { setActs([]); }
  };

  const move = async (lead: any, status: string) => {
    if (lead.status === status) return;
    try {
      await leads.crmUpdate(lead.id, { status });
      toasts.push(`${lead.company || lead.id} → ${LABELS[status]}`, "ok");
      reload();
      if (detail?.id === lead.id) setDetail({ ...detail, status });
    } catch (e: any) {
      toasts.push("改状态失败：" + e.message);
    }
  };

  const grouped = React.useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const s of STATUSES) map[s] = [];
    for (const r of rows) (map[r.status] ?? map.new).push(r);
    return map;
  }, [rows]);

  const listColumns: Column[] = [
    { label: "公司", get: (r) => r.company, width: 200,
      render: (r) => React.createElement("span", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, r.company || "-") },
    { label: "域名", get: (r) => r.domain,
      render: (r) => React.createElement("span", { className: "mono twb-muted" }, r.domain || "-") },
    { label: "市场", get: (r) => r.market },
    { label: "状态", get: (r) => r.status, width: 96,
      render: (r) => React.createElement(Badge, { plain: true }, LABELS[r.status] ?? r.status) },
    { label: "评分", get: (r) => Number(r.score ?? 0), width: 76,
      render: (r) => React.createElement(Badge, { tone: scoreTone(r.score ?? 0) }, String(r.score ?? 0)) },
    { label: "邮箱", get: (r) => (r.contacts?.emails ?? [])[0],
      render: (r) => React.createElement("span", { className: "twb-muted" }, (r.contacts?.emails ?? []).slice(0, 1).join(", ") || "-") },
  ];
  const listSort = useSortedRows(rows, listColumns);

  const renderTile = (lead: any) => React.createElement("div", {
    key: lead.id, className: "twb-tile", onClick: () => openDetail(lead),
  },
    React.createElement("div", { className: "t" }, lead.company || lead.domain || lead.id),
    React.createElement("div", { className: "m" }, [lead.market, lead.domain].filter(Boolean).join(" · ") || "—"),
    React.createElement(Badge, { tone: scoreTone(lead.score ?? 0) }, `${lead.score ?? 0}${lead.tier ? " " + lead.tier : ""}`),
    React.createElement("div", { className: "acts" },
      STATUSES.filter((x) => x !== lead.status).slice(0, 3).map((x) =>
        React.createElement("button", {
          key: x,
          onClick: (e: any) => { e.stopPropagation(); move(lead, x); },
        }, LABELS[x]))));

  const renderColumn = (s: string) => React.createElement("div", { key: s, style: { minWidth: 0 } },
    React.createElement("div", { className: "twb-col-head", style: { borderTopColor: COLORS[s] } },
      React.createElement("span", null, LABELS[s]),
      React.createElement("span", { className: "n" }, String(grouped[s].length))),
    grouped[s].map(renderTile));

  const body = React.createElement("div", null,
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement(TextInput, {
        placeholder: "搜索公司 / 域名 / 邮箱…", value: q,
        onChange: (e: any) => setQ(e.target.value), style: { minWidth: 240 },
      }),
      React.createElement(Segmented, {
        value: view,
        options: [["board", "看板"], ["list", "列表"]],
        onChange: (v) => setView(v as any),
      }),
      React.createElement("span", { className: "spacer" }),
      React.createElement("span", { className: "twb-muted" }, `共 ${rows.length} 条线索`)),

    view === "board"
      ? (rows.length === 0
          ? React.createElement(Empty, { title: "线索池是空的", desc: "去「线索搜索」跑一次搜索，勾选结果后点「加工」，线索会自动入池。" })
          : React.createElement("div", {
              className: "twb-board",
              style: { gridTemplateColumns: `repeat(${STATUSES.length}, minmax(150px, 1fr))` },
            }, STATUSES.map(renderColumn)))
      : React.createElement(SortableTable, {
          columns: listColumns, rows: listSort.sorted, sortKey: listSort.key, asc: listSort.asc, onSort: listSort.toggle,
          onRowClick: (r: any) => openDetail(r),
          empty: React.createElement(Empty, { title: "线索池是空的", desc: "去「线索搜索」跑一次搜索，勾选结果后点「加工」。" }),
        }));

  const drawer = detail ? React.createElement(React.Fragment, null,
    React.createElement("div", { className: "twb-drawer-mask", onClick: () => setDetail(null) }),
    React.createElement("div", { className: "twb-drawer" },
      React.createElement("header", null,
        React.createElement("div", null,
          React.createElement("div", { className: "h" }, detail.company || detail.domain || detail.id),
          React.createElement("div", { className: "s" }, [detail.market, detail.domain].filter(Boolean).join(" · ") || "线索详情")),
        React.createElement("button", { className: "twb-btn secondary sm", onClick: () => setDetail(null) }, "关闭")),
      React.createElement("div", { className: "content" },
        React.createElement("div", { className: "twb-cards", style: { marginBottom: 18 } },
          React.createElement("div", { className: "twb-card" },
            React.createElement("div", { className: "k" }, "评分"),
            React.createElement("div", { className: "v" }, String(detail.score ?? 0)),
            React.createElement("div", { className: "sub" }, detail.tier || "未分级")),
          React.createElement("div", { className: "twb-card" },
            React.createElement("div", { className: "k" }, "状态"),
            React.createElement("div", { className: "v", style: { fontSize: 15, fontFamily: "inherit" } },
              LABELS[detail.status] ?? detail.status))),

        React.createElement(Section, { title: "联系信息" },
          React.createElement(KeyValue, {
            rows: [
              ["邮箱", (detail.contacts?.emails ?? []).join(", ") || "—"],
              ["WhatsApp", (detail.contacts?.whatsapps ?? []).join(", ") || "—"],
              ["电话", (detail.contacts?.phones ?? []).join(", ") || "—"],
              ["网站", detail.url
                ? React.createElement("a", { href: detail.url, target: "_blank", rel: "noreferrer", style: { color: "var(--twb-accent)" } }, detail.url)
                : "—"],
            ],
          })),

        detail.advice ? React.createElement(Section, { title: "开发建议" },
          React.createElement("div", { className: "twb-pre" }, detail.advice)) : null,

        React.createElement(Section, { title: "流转状态" },
          React.createElement("div", { className: "twb-steps" },
            STATUSES.map((s) => React.createElement("button", {
              key: s,
              className: "twb-step" + (detail.status === s ? " done" : ""),
              onClick: () => move(detail, s),
            }, LABELS[s])))),

        React.createElement(Section, { title: "转为客户档案" },
          React.createElement("div", { className: "twb-muted", style: { marginBottom: 10, lineHeight: 1.7 } },
            "线索只是搜索结果的加工品；转成客户后才会挂上报价单与订单，进入正式的交付流程。"),
          React.createElement("button", {
            className: "twb-btn",
            disabled: converting,
            onClick: async () => {
              setConverting(true);
              try {
                const r = await leads.toCustomer(detail.id);
                toasts.push(`已创建客户 #${r.customer?.id ?? ""}`, "ok");
                setDetail(null);
                reload();
              } catch (e: any) { toasts.push("转客户失败：" + e.message); }
              finally { setConverting(false); }
            },
          }, converting ? "创建中…" : "转为客户")),

        React.createElement(Section, { title: "活动记录" },
          acts.length === 0
            ? React.createElement("div", { className: "twb-muted" }, "暂无活动记录")
            : React.createElement("div", null, acts.map((a, i) => React.createElement("div", {
                key: i,
                style: {
                  display: "flex", gap: 12, padding: "7px 0",
                  borderBottom: "1px solid var(--twb-hairline)", fontSize: 12,
                },
              },
                React.createElement("span", { className: "twb-mono twb-dim", style: { flex: "0 0 96px" } },
                  String(a.ts ?? "").slice(5, 16).replace("T", " ")),
                React.createElement("span", { style: { color: "var(--twb-fg-2)" } }, a.note ?? a.type ?? "")))))))) : null;

  return React.createElement("div", null, body, detail ? drawer : null);
}
