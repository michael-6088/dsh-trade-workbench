import { api } from "./api.ts";

export interface Toast { id: number; text: string; kind: "error" | "ok" }

type Listener = () => void;
class Simple {
  private listeners = new Set<Listener>();
  subscribe(l: Listener) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }
  emit() { for (const l of [...this.listeners]) l(); }
  snapshotVersion = 0;
}
export const dataVersion = new Simple();
export const toasts: { items: Toast[]; push(text: string, kind?: Toast["kind"]): void } = {
  items: [],
  push(text, kind = "error") {
    const id = Date.now() + Math.random();
    toasts.items = [...toasts.items, { id, text, kind }];
    dataVersion.emit();
    setTimeout(() => { toasts.items = toasts.items.filter((t2) => t2.id !== id); dataVersion.emit(); }, 6000);
  },
};
/** 主题偏好：auto 跟随系统，light/dark 为显式覆盖。 */
export type ThemeMode = "auto" | "light" | "dark";
const THEME_KEY = "twb.theme";

function readTheme(): ThemeMode {
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark" || v === "auto") return v;
  } catch {
    // 隐私模式或无 localStorage：跟随系统
  }
  return "auto";
}

export const state: {
  tab: string;
  drawer: { domain: string; id: number } | null;
  loading: boolean;
  dashboard: any;
  theme: ThemeMode;
} = { tab: "dashboard", drawer: null, loading: false, dashboard: null, theme: readTheme() };

export function setTheme(mode: ThemeMode): void {
  state.theme = mode;
  try { window.localStorage.setItem(THEME_KEY, mode); } catch { /* 忽略 */ }
  dataVersion.emit();
}

/** 把主题写到根节点属性上；auto 时移除属性，交给媒体查询。 */
export function applyThemeAttr(): void {
  if (typeof document === "undefined") return;
  const root = document.querySelector(".twb-root");
  if (!root) return;
  if (state.theme === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", state.theme);
}

export function cycleTheme(): ThemeMode {
  const next: ThemeMode = state.theme === "auto" ? "dark" : state.theme === "dark" ? "light" : "auto";
  setTheme(next);
  return next;
}

export function setTab(tab: string): void { state.tab = tab; dataVersion.emit(); }
export function openDrawer(domain: string, id: number): void { state.drawer = { domain, id }; dataVersion.emit(); }
export function closeDrawer(): void { state.drawer = null; dataVersion.emit(); }

export async function loadDashboard(): Promise<void> {
  try { state.dashboard = await api.dashboard(); }
  catch (e: any) { toasts.push("看板加载失败：" + e.message); state.dashboard = null; }
  dataVersion.emit();
}
export async function listDomain(domain: string, q = ""): Promise<any[]> { return api.list(domain, q); }