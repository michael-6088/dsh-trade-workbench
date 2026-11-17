/**
 * dsh-trade-workbench 浏览器半：注册左侧栏图标与主面板页面。
 * 传输走同源 /trade-workbench 路由（host 半），React 从宿主模块表解析。
 */
import * as React from "react";
import { App } from "./App.tsx";
import { setTab } from "./store.ts";

export const PANEL_ID = "trade-workbench";
export const inject = ["slots", "layout", "uiWorkspace"];

function PanelIcon(props: { size: number; active: boolean }) {
  const s = props.size ?? 20;
  return React.createElement("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: props.active ? "currentColor" : "currentColor", strokeWidth: 1.8, style: { opacity: props.active ? 1 : 0.75 } },
    React.createElement("path", { d: "M3 17h18M5 17V9l7-4 7 4v8" }),
    React.createElement("path", { d: "M9 17v-5h6v5" }));
}

export function apply(ctx: any): void {
  const uiWorkspace: any = ctx.get("uiWorkspace");
  const handoff = (prompt: string): void => {
    try {
      uiWorkspace?.startSession?.(undefined, { agentPreset: "cordis", prompt, whenDraftExists: "append" });
      ctx.layout?.toggleSidebar?.();
    } catch { /* 交接失败静默：按钮保留在面板内，用户可复制 */ }
  };
  ctx.slots.inject("main", function* () {
    yield ctx.slots.register({
      name: "main",
      key: PANEL_ID,
      inject: () => ({ handoff, setTab }),
    }, App);
    yield ctx.layout.panelInfo.subscribe(() => {
      if (ctx.layout.panelInfo.getSnapshot().activePanelId !== PANEL_ID) setTab("dashboard");
    });
  });
  ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
    name: "sidebar.panellist",
    id: PANEL_ID,
    order: 40,
    label: () => "外贸工作台",
  }, PanelIcon));
}
