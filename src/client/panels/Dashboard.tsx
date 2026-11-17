import * as React from "react";
import { useEffect, useState } from "react";
import { api } from "../api.ts";
import { money, moneyShort, pct, PageHead, Section, StatCard, Empty, Table, useVersion, CardsSkeleton, TableSkeleton, Skeleton } from "../ui.tsx";
import { STAGES } from "../../shared/types.ts";

const STAGE_CN: Record<string, string> = {
  inquiry: "询盘", quote: "报价", pi: "PI/合同", production: "生产",
  booking: "订舱", customs: "报关", shipped: "出运", receipt: "收款", closed: "结案",
};

export function Dashboard() {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useVersion();
  useEffect(() => { api.dashboard().then(setD).catch((e: any) => setErr(e.message)); }, []);

  if (err) return React.createElement(Empty, { title: "看板加载失败", desc: err });
  if (!d) {
    return React.createElement("div", null,
      React.createElement(PageHead, { title: "经营看板", sub: "加载中…" }),
      React.createElement(CardsSkeleton, { n: 6 }),
      React.createElement(TableSkeleton, { rows: 5, cols: 3 }),
      React.createElement("div", { style: { height: 16 } }),
      React.createElement(TableSkeleton, { rows: 4, cols: 4 }));
  }

  const stageData = (d.revenueByStage ?? []).filter((x: any) => x.cents > 0);
  const maxStage = Math.max(1, ...stageData.map((x: any) => x.cents));
  const months = (d.marginByMonth ?? []).slice(-6);
  const totalRevenue = months.reduce((s: number, m: any) => s + m.revenueCents, 0);
  const totalGross = months.reduce((s: number, m: any) => s + (m.revenueCents - m.costCents), 0);
  const avgMargin = totalRevenue ? totalGross / totalRevenue : 0;

  return React.createElement("div", null,
    React.createElement(PageHead, { title: "经营看板", sub: "近 6 个月经营健康度总览" }),

    React.createElement("div", { className: "twb-cards" },
      React.createElement(StatCard, { label: "本月询盘", value: d.inquiriesThisMonth, sub: "新增询盘数" }),
      React.createElement(StatCard, { label: "询盘转化率", value: pct(d.inquiryToOrderRate ?? 0), tone: "accent", sub: "询盘 → 订单" }),
      React.createElement(StatCard, { label: "在手订单", value: moneyShort(d.openOrderCents), sub: "未结案金额" }),
      React.createElement(StatCard, {
        label: "未收汇", value: moneyShort(d.unpaidCents),
        tone: d.unpaidCents > 0 ? "warn" : "ok",
        sub: d.unpaidCents > 0 ? "待催收" : "已全部收回",
      }),
      React.createElement(StatCard, {
        label: "逾期交期", value: d.overdueCount + " 单",
        tone: d.overdueCount > 0 ? "err" : "ok",
        sub: d.overdueCount > 0 ? "需立即处理" : "全部按期",
      }),
      React.createElement(StatCard, { label: "客户 / 订单", value: d.totalCustomers + " / " + d.totalOrders, sub: "累计建档" })),

    React.createElement(Section, { title: "各阶段在手金额" },
      stageData.length === 0
        ? React.createElement(Empty, { title: "还没有在手订单", desc: "从「报价/PI」创建报价并转为订单后，这里会显示各阶段金额分布。" })
        : React.createElement("div", { className: "twb-table-wrap" },
            React.createElement("table", { className: "twb-table" },
              React.createElement("tbody", null, stageData.map((x: any) =>
                React.createElement("tr", { key: x.stage },
                  React.createElement("td", { style: { width: 96, fontWeight: 550 } }, STAGE_CN[x.stage] ?? x.stage),
                  React.createElement("td", null,
                    React.createElement("div", { className: "twb-bar-track" },
                      React.createElement("div", {
                        className: "twb-bar",
                        style: { width: Math.max(3, (x.cents / maxStage) * 100) + "%" },
                      }))),
                  React.createElement("td", { className: "num", style: { width: 150 } }, money(x.cents)))))))),

    React.createElement(Section, { title: "月度营收 / 毛利" },
      months.length === 0
        ? React.createElement(Empty, { title: "暂无月度数据", desc: "订单产生收汇记录后，这里会按月汇总营收与毛利。" })
        : React.createElement("div", null,
            React.createElement("div", { className: "twb-cards", style: { marginBottom: 12 } },
              React.createElement(StatCard, { label: "近 6 月营收", value: moneyShort(totalRevenue), tone: "accent" }),
              React.createElement(StatCard, { label: "近 6 月毛利", value: moneyShort(totalGross), tone: "ok" }),
              React.createElement(StatCard, { label: "平均毛利率", value: pct(avgMargin) })),
            React.createElement(Table, {
              head: ["月份", "营收", "毛利", "毛利率"],
            }, months.map((m: any) => {
              const gross = m.revenueCents - m.costCents;
              const rate = m.revenueCents ? gross / m.revenueCents : NaN;
              return React.createElement("tr", { key: m.month },
                React.createElement("td", { className: "mono" }, m.month),
                React.createElement("td", { className: "num" }, money(m.revenueCents)),
                React.createElement("td", { className: "num" }, money(gross)),
                React.createElement("td", { className: "num" },
                  React.createElement("span", { className: "twb-badge plain " + (rate >= 0.2 ? "ok" : rate >= 0.1 ? "warn" : "err") }, pct(rate))));
            })))),

    React.createElement(Section, { title: "履约流程" },
      React.createElement("div", { className: "twb-steps" },
        STAGES.map((s: any, i: number) => React.createElement("div", {
          key: s, className: "twb-step done",
          style: { opacity: 1 - i * 0.045, pointerEvents: "none" },
        }, STAGE_CN[s] ?? s)))));
}
