window.__ModuleLoader__.load({
  id: "dsh-trade-workbench",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  PANEL_ID: () => PANEL_ID,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var React25 = __toESM(require("react"), 1);

// src/client/App.tsx
var React24 = __toESM(require("react"), 1);
var import_react19 = require("react");

// src/client/api.ts
var RPC = "/api/trade-workbench/rpc";
async function leadsCall(op, args = {}) {
  return call({ op, args });
}
async function call(payload) {
  const res = await fetch(RPC, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(data?.error?.message ?? "HTTP " + res.status);
  return data;
}
var api = {
  dashboard: () => call({ op: "dashboard" }),
  getSettings: () => call({ op: "settings" }),
  putSettings: (body) => call({ op: "settings", body }),
  aiChat: (messages) => call({ op: "ai", messages }),
  list: (domain, q = "") => call({ op: "list", domain, q }),
  get: (domain, id) => call({ op: "get", domain, id }),
  create: (domain, body) => call({ op: "create", domain, body }),
  update: (domain, id, body) => call({ op: "update", domain, id, body }),
  remove: (domain, id) => call({ op: "delete", domain, id }),
  toOrder: (quoteId) => call({ op: "to-order", id: quoteId }),
  balance: (orderId) => call({ op: "balance", id: orderId }),
  /** 单证上传（multipart，独立 exact 路由）。 */
  async upload(form) {
    const res = await fetch("/api/trade-workbench/upload", { method: "POST", body: form, credentials: "same-origin" });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error?.message ?? "HTTP " + res.status);
    return data;
  },
  piUrl: (quoteId) => "/api/trade-workbench/export/pi/" + quoteId,
  fileUrl: (name) => "/api/trade-workbench/files/" + encodeURIComponent(name)
};
var leads = {
  search: (args) => leadsCall("leads/search", args),
  runs: (limit = 20) => leadsCall("leads/runs", { limit }),
  run: (id) => leadsCall("leads/run", { id }),
  enrich: (urls, market = "") => leadsCall("leads/enrich", { urls, market }),
  score: (lead) => leadsCall("leads/score", { lead }),
  emailFind: (args) => leadsCall("email/find", args),
  emailVerify: (email) => leadsCall("email/verify", { email }),
  crmList: (q = "") => leadsCall("crm/list", { q }),
  crmGet: (id) => leadsCall("crm/get", { id }),
  crmUpdate: (id, patch, activityNote) => leadsCall("crm/update", { id, ...patch, activityNote }),
  crmStats: () => leadsCall("crm/stats"),
  crmDupes: () => leadsCall("crm/dupes"),
  crmActivities: (id) => leadsCall("crm/activities", { id }),
  crmMerge: (keep, drop) => leadsCall("crm/merge", { keep, drop }),
  sopList: () => leadsCall("sop/list"),
  sopCreate: (args) => leadsCall("sop/create", args),
  sopNext: (id) => leadsCall("sop/next", { id }),
  sopReview: (id) => leadsCall("sop/review", { id }),
  sopApprove: (id, hash) => leadsCall("sop/approve", { id, hash }),
  sopStatus: (id) => leadsCall("sop/status", { id }),
  kbList: () => leadsCall("kb/list"),
  kbSearch: (q) => leadsCall("kb/search", { q }),
  kbUpsert: (entry) => leadsCall("kb/upsert", entry),
  suppressList: () => leadsCall("suppress/list"),
  suppressAdd: (value, reason = "") => leadsCall("suppress/add", { value, reason }),
  suppressRemove: (value) => leadsCall("suppress/remove", { value }),
  templatesList: () => leadsCall("templates/list"),
  templatesSave: (tpl) => leadsCall("templates/save", tpl),
  templatesDelete: (id) => leadsCall("templates/delete", { id }),
  waQueue: () => leadsCall("wa/queue"),
  waMessages: (limit = 100) => leadsCall("wa/messages", { limit }),
  statsReport: (args = {}) => leadsCall("stats/report", args),
  auditQuery: (args = {}) => leadsCall("audit/query", args),
  cronStatus: () => leadsCall("cron/status"),
  monitorList: () => leadsCall("monitor/list"),
  warmupStatus: () => leadsCall("warmup/status"),
  deliverability: (domain) => leadsCall("deliverability/check", { domain }),
  dossier: (domain) => leadsCall("dossier/company", { domain }),
  marketScan: (product, markets) => leadsCall("market/scan", { product, markets }),
  configSummary: () => leadsCall("config/summary"),
  configWrite: (patch) => leadsCall("config/write", { patch }),
  configRaw: () => leadsCall("config/raw"),
  // ---- SOP 阶段机 ----
  sopClose: (id) => leadsCall("sop/close", { id }),
  sopRemoveDraft: (id, index) => leadsCall("sop/removeDraft", { id, index }),
  // ---- 跟进序列 ----
  seqStart: (leadId, template, language) => leadsCall("sequence/start", { leadId, template, language }),
  seqStatus: (leadId) => leadsCall("sequence/status", { leadId }),
  seqStop: (leadId) => leadsCall("sequence/stop", { leadId }),
  // ---- 邮件 ----
  emailCompose: (leadId, opts = {}) => leadsCall("email/compose", { leadId, ...opts }),
  emailSend: (args) => leadsCall("email/send", args),
  // ---- WhatsApp ----
  waSync: (limit = 50) => leadsCall("wa/sync", { limit }),
  // ---- WhatsApp 广播 ----
  waBroadcastPreview: (text, opts = {}) => leadsCall("wa/broadcast/preview", { text, ...opts }),
  waBroadcastExecute: (text, targets) => leadsCall("wa/broadcast/execute", { text, targets }),
  // ---- 线索转客户 ----
  toCustomer: (id, opts = {}) => leadsCall("crm/to-customer", { id, ...opts })
};

// src/client/store.ts
var Simple = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(l) {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  }
  emit() {
    for (const l of [...this.listeners]) l();
  }
  snapshotVersion = 0;
};
var dataVersion = new Simple();
var toasts = {
  items: [],
  push(text, kind = "error") {
    const id = Date.now() + Math.random();
    toasts.items = [...toasts.items, { id, text, kind }];
    dataVersion.emit();
    setTimeout(() => {
      toasts.items = toasts.items.filter((t2) => t2.id !== id);
      dataVersion.emit();
    }, 6e3);
  }
};
var THEME_KEY = "twb.theme";
function readTheme() {
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark" || v === "auto") return v;
  } catch {
  }
  return "auto";
}
var state = { tab: "dashboard", drawer: null, loading: false, dashboard: null, theme: readTheme() };
function setTheme(mode) {
  state.theme = mode;
  try {
    window.localStorage.setItem(THEME_KEY, mode);
  } catch {
  }
  dataVersion.emit();
}
function applyThemeAttr() {
  if (typeof document === "undefined") return;
  const root = document.querySelector(".twb-root");
  if (!root) return;
  if (state.theme === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", state.theme);
}
function cycleTheme() {
  const next = state.theme === "auto" ? "dark" : state.theme === "dark" ? "light" : "auto";
  setTheme(next);
  return next;
}
function setTab(tab) {
  state.tab = tab;
  dataVersion.emit();
}
function openDrawer(domain, id) {
  state.drawer = { domain, id };
  dataVersion.emit();
}
function closeDrawer() {
  state.drawer = null;
  dataVersion.emit();
}

// src/client/ui.tsx
var React = __toESM(require("react"), 1);
var import_react = require("react");
function useVersion() {
  const [, force] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => dataVersion.subscribe(() => force((x) => x + 1)), []);
  return dataVersion.snapshotVersion;
}
function money(cents, currency = "USD") {
  if (!Number.isFinite(cents)) return "-";
  return currency + " " + (cents / 100).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function moneyShort(cents, currency = "USD") {
  if (!Number.isFinite(cents)) return "-";
  const v = cents / 100;
  const abs = Math.abs(v);
  if (abs >= 1e7) return currency + " " + (v / 1e6).toFixed(2) + "M";
  if (abs >= 1e4) return currency + " " + (v / 1e3).toFixed(1) + "K";
  return currency + " " + v.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}
function pct(v, digits = 1) {
  if (!Number.isFinite(v)) return "-";
  return (v * 100).toFixed(digits) + "%";
}
function PageHead(props) {
  return React.createElement(
    "div",
    { className: "twb-page-head" },
    React.createElement(
      "div",
      null,
      React.createElement("div", { className: "twb-page-title" }, props.title),
      props.sub ? React.createElement("div", { className: "twb-page-sub" }, props.sub) : null
    ),
    props.children ? React.createElement("div", { className: "spacer", style: { flex: 1 } }) : null,
    props.children
  );
}
function Section(props) {
  return React.createElement(
    React.Fragment,
    null,
    props.title ? React.createElement("div", { className: "twb-section" }, props.title) : null,
    props.children
  );
}
function StatCard(props) {
  return React.createElement(
    "div",
    { className: "twb-card" + (props.tone ? " tone-" + props.tone : "") },
    React.createElement("div", { className: "k" }, props.label),
    React.createElement("div", { className: "v" }, props.value),
    props.sub ? React.createElement("div", { className: "sub" }, props.sub) : null
  );
}
function Empty(props) {
  return React.createElement(
    "div",
    { className: "twb-empty" },
    React.createElement(
      "div",
      { className: "ico" },
      React.createElement(
        "svg",
        { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" },
        React.createElement("rect", { x: 4, y: 4, width: 16, height: 16, rx: 2 }),
        React.createElement("path", { d: "M4 10h16M10 10v10" })
      )
    ),
    React.createElement("div", { className: "t" }, props.title),
    props.desc ? React.createElement("div", { className: "d" }, props.desc) : null,
    props.action
  );
}
function Table(props) {
  return React.createElement(
    "div",
    { className: "twb-table-wrap" },
    React.createElement(
      "table",
      { className: "twb-table" },
      React.createElement(
        "thead",
        null,
        React.createElement("tr", null, props.head.map((h, i) => React.createElement("th", { key: i }, h)))
      ),
      React.createElement("tbody", null, props.children)
    )
  );
}
function Field(props) {
  return React.createElement(
    "div",
    { className: "twb-field" },
    React.createElement("label", null, props.label),
    props.children,
    props.hint ? React.createElement("div", { className: "twb-dim" }, props.hint) : null
  );
}
function TextInput(props) {
  return React.createElement("input", { className: "twb-input", ...props });
}
function TextArea(props) {
  return React.createElement("textarea", { className: "twb-input", ...props });
}
function Select(props) {
  return React.createElement("select", { className: "twb-select", ...props });
}
function Segmented(props) {
  return React.createElement(
    "div",
    { className: "twb-seg" },
    props.options.map(([v, label]) => React.createElement("button", {
      key: v,
      type: "button",
      className: v === props.value ? "on" : "",
      onClick: () => props.onChange(v)
    }, label))
  );
}
function Badge(props) {
  const cls = ["twb-badge", props.tone ?? "", props.plain ? "plain" : ""].filter(Boolean).join(" ");
  return React.createElement("span", { className: cls }, props.children);
}
function Toasts() {
  useVersion();
  if (toasts.items.length === 0) return null;
  return React.createElement(
    "div",
    { className: "twb-toast-stack" },
    toasts.items.map((t) => React.createElement("div", { key: t.id, className: "twb-toast" + (t.kind === "ok" ? " ok" : "") }, t.text))
  );
}
function useList(domain, q) {
  const [rows, setRows] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const reload = () => {
    setLoading(true);
    api.list(domain, q).then((r) => setRows(Array.isArray(r) ? r : [])).catch((e) => {
      toasts.push("\u52A0\u8F7D\u5931\u8D25\uFF1A" + e.message);
      setRows([]);
    }).finally(() => setLoading(false));
  };
  (0, import_react.useEffect)(reload, [domain, q]);
  return { rows, reload, loading };
}
async function saveRow(domain, body, id) {
  const row = id ? await api.update(domain, id, body) : await api.create(domain, body);
  toasts.push("\u5DF2\u4FDD\u5B58", "ok");
  return row;
}
function Drawer(props) {
  useVersion();
  const [row, setRow] = (0, import_react.useState)(null);
  const { drawer } = state;
  const reload = () => {
    if (drawer) api.get(props.domain, drawer.id).then(setRow).catch(() => setRow(null));
  };
  (0, import_react.useEffect)(reload, [drawer?.id, drawer?.domain]);
  if (!drawer) return null;
  const title = row?.no ?? row?.name ?? row?.id ?? props.domain;
  return React.createElement(
    React.Fragment,
    null,
    React.createElement("div", { className: "twb-drawer-mask", onClick: closeDrawer }),
    React.createElement(
      "div",
      { className: "twb-drawer" },
      React.createElement(
        "header",
        null,
        React.createElement(
          "div",
          null,
          React.createElement("div", { className: "h" }, String(title)),
          React.createElement("div", { className: "s" }, props.domain)
        ),
        React.createElement("button", { className: "twb-btn secondary sm", onClick: closeDrawer }, "\u5173\u95ED")
      ),
      React.createElement(
        "div",
        { className: "content" },
        row ? props.render(row, closeDrawer, reload) : React.createElement(
          "div",
          null,
          React.createElement(Skeleton, { w: "40%", h: 11, style: { marginBottom: 16 } }),
          React.createElement(TableSkeleton, { rows: 4, cols: 3 })
        )
      )
    )
  );
}
function KeyValue(props) {
  return React.createElement(
    "div",
    { className: "twb-kv" },
    props.rows.map(([k, v], i) => React.createElement(
      "div",
      { key: i, className: "r" },
      React.createElement("span", { className: "k" }, k),
      React.createElement("span", { className: "v" }, v)
    ))
  );
}
function Skeleton(props) {
  return React.createElement("div", {
    className: "twb-skel",
    style: {
      width: typeof props.w === "number" ? props.w + "px" : props.w ?? "100%",
      height: (props.h ?? 12) + "px",
      borderRadius: (props.r ?? 4) + "px",
      ...props.style ?? {}
    }
  });
}
function TableSkeleton(props) {
  const rows = props.rows ?? 6;
  const cols = props.cols ?? 4;
  return React.createElement(
    "div",
    { className: "twb-table-wrap", style: { padding: 12 } },
    React.createElement(
      "div",
      { style: { display: "flex", gap: 14, marginBottom: 14 } },
      Array.from({ length: cols }).map((_, i) => React.createElement(Skeleton, { key: i, w: i === 0 ? "28%" : "16%", h: 9 }))
    ),
    Array.from({ length: rows }).map((_, r) => React.createElement(
      "div",
      { key: r, style: { display: "flex", gap: 14, marginBottom: 13 } },
      Array.from({ length: cols }).map((_2, c) => React.createElement(Skeleton, {
        key: c,
        w: c === 0 ? "28%" : "16%",
        h: 11,
        // 逐行递减不透明度，制造"内容正在填充"的错觉
        style: { opacity: Math.max(0.35, 1 - r * 0.11) }
      }))
    ))
  );
}
function CardsSkeleton(props) {
  return React.createElement(
    "div",
    { className: "twb-cards" },
    Array.from({ length: props.n ?? 6 }).map((_, i) => React.createElement(
      "div",
      { key: i, className: "twb-card" },
      React.createElement(Skeleton, { w: "52%", h: 9, style: { marginBottom: 10 } }),
      React.createElement(Skeleton, { w: "68%", h: 20 })
    ))
  );
}
function useSortedRows(rows, columns) {
  const [key, setKey] = React.useState(-1);
  const [asc, setAsc] = React.useState(true);
  const toggle = (i) => {
    if (!columns[i]?.get) return;
    if (key === i) setAsc(!asc);
    else {
      setKey(i);
      setAsc(true);
    }
  };
  const sorted = React.useMemo(() => {
    if (key < 0 || !columns[key]?.get) return rows;
    const get = columns[key].get;
    const out = [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return va - vb;
      return String(va).localeCompare(String(vb), "zh-CN", { numeric: true });
    });
    return asc ? out : out.reverse();
  }, [rows, key, asc, columns]);
  return { sorted, key, asc, toggle };
}
function SortableTable(props) {
  const { columns, rows, sortKey, asc, onSort, onRowClick } = props;
  if (rows.length === 0 && props.empty) return React.createElement(React.Fragment, null, props.empty);
  return React.createElement(
    "div",
    { className: "twb-table-wrap" },
    React.createElement(
      "table",
      { className: "twb-table" },
      React.createElement(
        "thead",
        null,
        React.createElement("tr", null, columns.map((c, i) => React.createElement(
          "th",
          {
            key: i,
            className: c.num ? "num" : void 0,
            style: {
              width: c.width,
              cursor: c.get ? "pointer" : void 0,
              userSelect: "none",
              // 排序中的列高亮，让用户知道当前按什么排
              color: sortKey === i ? "var(--twb-accent)" : void 0
            },
            onClick: () => onSort(i)
          },
          c.label,
          c.get ? React.createElement("span", {
            style: { marginLeft: 5, opacity: sortKey === i ? 1 : 0.25, fontSize: 9 }
          }, sortKey === i ? asc ? "\u25B2" : "\u25BC" : "\u21C5") : null
        )))
      ),
      React.createElement("tbody", null, rows.map((row, ri) => React.createElement(
        "tr",
        {
          key: row.id ?? ri,
          className: onRowClick ? "row" : void 0,
          onClick: onRowClick ? () => onRowClick(row, ri) : void 0
        },
        columns.map((c, ci) => React.createElement("td", {
          key: ci,
          className: c.num ? "num" : void 0
        }, c.render ? c.render(row, ri) : String(c.get?.(row) ?? "")))
      )))
    )
  );
}
var THEME_ICON = {
  auto: "\u25D0",
  dark: "\u25D1",
  light: "\u25CB"
};
var THEME_LABEL = {
  auto: "\u8DDF\u968F\u7CFB\u7EDF",
  dark: "\u6DF1\u8272",
  light: "\u6D45\u8272"
};
function ThemeToggle() {
  useVersion();
  const mode = state.theme ?? "auto";
  return React.createElement("button", {
    className: "twb-btn ghost icon",
    title: `\u4E3B\u9898\uFF1A${THEME_LABEL[mode]}\uFF08\u70B9\u51FB\u5207\u6362\uFF09`,
    onClick: () => {
      cycleTheme();
    }
  }, React.createElement("span", { style: { fontSize: 14, lineHeight: 1 } }, THEME_ICON[mode] ?? "\u25D0"));
}

// src/client/styles.ts
var CSS = `
/* \u2500\u2500 \u8BBE\u8BA1\u4EE4\u724C \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-root {
  /* \u8868\u9762\u5C42\u7EA7 */
  --twb-base: var(--dshe-background, #0b0c0e);
  --twb-raised: var(--dshe-surface, #131519);
  --twb-overlay: var(--dshe-surface-raised, #1a1d22);
  --twb-sunken: rgba(0, 0, 0, .22);
  --twb-hover: rgba(255, 255, 255, .035);
  --twb-active: rgba(255, 255, 255, .06);

  /* \u7EBF\u6761 */
  --twb-line: var(--dshe-border, rgba(255, 255, 255, .07));
  --twb-line-strong: rgba(255, 255, 255, .13);
  --twb-hairline: rgba(255, 255, 255, .045);

  /* \u6587\u5B57 */
  --twb-fg: var(--dshe-foreground, #e8eaed);
  --twb-fg-2: rgba(232, 234, 237, .78);
  --twb-fg-3: rgba(232, 234, 237, .56);
  --twb-fg-4: rgba(232, 234, 237, .40);

  /* \u5DE5\u4E1A\u5F3A\u8C03\u8272\uFF1A\u7425\u73C0\uFF08\u4EEA\u8868/\u8B66\u793A\uFF09+ \u9752\u7EFF\uFF08\u901A\u8FC7\uFF09+ \u6731\u7EA2\uFF08\u5F02\u5E38\uFF09 */
  --twb-accent: var(--dshe-accent, #f0a13a);
  --twb-accent-dim: rgba(240, 161, 58, .13);
  --twb-accent-line: rgba(240, 161, 58, .34);
  --twb-ok: #3ddc97;
  --twb-ok-dim: rgba(61, 220, 151, .12);
  --twb-warn: #f5b544;
  --twb-warn-dim: rgba(245, 181, 68, .12);
  --twb-err: #ff5f57;
  --twb-err-dim: rgba(255, 95, 87, .12);
  --twb-info: #5b9dff;
  --twb-info-dim: rgba(91, 157, 255, .12);
  /* \u770B\u677F\u72B6\u6001\u8F85\u52A9\u8272\uFF1A\u6DF1\u8272\u7528\u4EAE\u8C03 */
  --twb-violet: #a78bfa;
  --twb-cyan: #38bdf8;

  /* \u51E0\u4F55 */
  --twb-r-sm: 5px;
  --twb-r: 8px;
  --twb-r-lg: 12px;
  --twb-gap: 4px;

  /* \u9634\u5F71\uFF1A\u6781\u77ED\u6269\u6563\uFF0C\u6A21\u62DF\u5B9E\u4F53\u9762\u677F\u800C\u975E\u53D1\u5149 */
  --twb-shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 4px 12px rgba(0, 0, 0, .18);
  --twb-shadow-lg: 0 2px 8px rgba(0, 0, 0, .45), 0 16px 48px rgba(0, 0, 0, .32);

  /* \u5B57\u4F53 */
  --twb-font: inherit;
  --twb-mono: ui-monospace, "SF Mono", "Cascadia Mono", "Consolas", monospace;

  /* \u52A8\u6548 */
  --twb-ease: cubic-bezier(.32, .72, 0, 1);
  --twb-dur: 140ms;
}

/* \u6D45\u8272\u4EE4\u724C\u3002\u62BD\u6210\u4E00\u7EC4\u53D8\u91CF\uFF0C\u4F9B\u300C\u663E\u5F0F data-theme=light\u300D\u4E0E\u300C\u8DDF\u968F\u7CFB\u7EDF\u300D\u4E24\u5904\u590D\u7528\uFF0C
   \u907F\u514D\u540C\u4E00\u4EFD\u8272\u503C\u7EF4\u62A4\u4E24\u904D\u3002 */
.twb-root[data-theme="light"] {
  --twb-base: var(--dshe-background, #f7f7f5);
  --twb-raised: var(--dshe-surface, #ffffff);
  --twb-overlay: var(--dshe-surface-raised, #ffffff);
  --twb-sunken: rgba(0, 0, 0, .025);
  --twb-hover: rgba(0, 0, 0, .032);
  --twb-active: rgba(0, 0, 0, .055);
  --twb-line: var(--dshe-border, rgba(0, 0, 0, .10));
  --twb-line-strong: rgba(0, 0, 0, .18);
  --twb-hairline: rgba(0, 0, 0, .06);
  --twb-fg: var(--dshe-foreground, #14161a);
  --twb-fg-2: rgba(20, 22, 26, .82);
  --twb-fg-3: rgba(20, 22, 26, .64);
  --twb-fg-4: rgba(20, 22, 26, .46);
  --twb-accent: var(--dshe-accent, #b8730e);
  --twb-accent-dim: rgba(184, 115, 14, .09);
  --twb-accent-line: rgba(184, 115, 14, .30);
  --twb-ok: #0f7550;
  --twb-ok-dim: rgba(15, 117, 80, .10);
  --twb-warn: #8f5c00;
  --twb-warn-dim: rgba(143, 92, 0, .10);
  --twb-err: #c2382f;
  --twb-err-dim: rgba(194, 56, 47, .09);
  --twb-info: #2563c9;
  --twb-info-dim: rgba(37, 99, 201, .09);
  /* \u6D45\u8272\u4E0B\u7D2B/\u9752\u9700\u538B\u6DF1\u624D\u8FBE 4.5:1 */
  --twb-violet: #6d3fc4;
  --twb-cyan: #0e7490;
  --twb-smoothing: auto;
  --twb-shadow: 0 1px 2px rgba(0, 0, 0, .06), 0 4px 12px rgba(0, 0, 0, .05);
  --twb-shadow-lg: 0 2px 8px rgba(0, 0, 0, .08), 0 16px 48px rgba(0, 0, 0, .12);
}
/* \u663E\u5F0F\u6DF1\u8272\uFF1A\u8986\u76D6\u7CFB\u7EDF\u504F\u597D\uFF0C\u4FDD\u8BC1\u7528\u6237\u624B\u9009\u4F18\u5148 */
.twb-root[data-theme="dark"] {
  color-scheme: dark;
}
/* \u8DDF\u968F\u7CFB\u7EDF\uFF1A\u4EC5\u5728\u672A\u663E\u5F0F\u6307\u5B9A\u65F6\u751F\u6548 */
@media (prefers-color-scheme: light) {
  .twb-root:not([data-theme="dark"]) {
    --twb-base: var(--dshe-background, #f7f7f5);
    --twb-raised: var(--dshe-surface, #ffffff);
    --twb-overlay: var(--dshe-surface-raised, #ffffff);
    --twb-sunken: rgba(0, 0, 0, .025);
    --twb-hover: rgba(0, 0, 0, .032);
    --twb-active: rgba(0, 0, 0, .055);
    --twb-line: var(--dshe-border, rgba(0, 0, 0, .10));
    --twb-line-strong: rgba(0, 0, 0, .18);
    --twb-hairline: rgba(0, 0, 0, .06);
    --twb-fg: var(--dshe-foreground, #14161a);
    --twb-fg-2: rgba(20, 22, 26, .82);
    --twb-fg-3: rgba(20, 22, 26, .64);
    --twb-fg-4: rgba(20, 22, 26, .46);
    --twb-accent: var(--dshe-accent, #b8730e);
    --twb-accent-dim: rgba(184, 115, 14, .09);
    --twb-accent-line: rgba(184, 115, 14, .30);
    --twb-ok: #0f7550;
    --twb-ok-dim: rgba(15, 117, 80, .10);
    --twb-warn: #8f5c00;
    --twb-warn-dim: rgba(143, 92, 0, .10);
    --twb-err: #c2382f;
    --twb-err-dim: rgba(194, 56, 47, .09);
    --twb-info: #2563c9;
    --twb-info-dim: rgba(37, 99, 201, .09);
    /* \u6D45\u8272\u4E0B\u7D2B/\u9752\u9700\u538B\u6DF1\u624D\u8FBE 4.5:1 */
    --twb-violet: #6d3fc4;
    --twb-cyan: #0e7490;
    --twb-smoothing: auto;
  --twb-shadow: 0 1px 2px rgba(0, 0, 0, .06), 0 4px 12px rgba(0, 0, 0, .05);
    --twb-shadow-lg: 0 2px 8px rgba(0, 0, 0, .08), 0 16px 48px rgba(0, 0, 0, .12);
  }
}

/* \u2500\u2500 \u9AA8\u67B6 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-root {
  display: flex; flex-direction: column; height: 100%; overflow: hidden;
  color: var(--twb-fg); font-family: var(--twb-font); font-size: 14px;
  background: var(--twb-base);
  /* \u6DF1\u8272\u80CC\u666F\u4E0B antialiased \u8BA9\u7EC6\u5B57\u66F4\u9510\u5229\uFF1B\u6D45\u8272\u80CC\u666F\u5219\u76F8\u53CD \u2014\u2014 \u4E9A\u50CF\u7D20\u6297\u952F\u9F7F
     \u88AB\u5173\u6389\u540E\u7B14\u753B\u53D8\u7EC6\u53D1\u7070\u3002\u7528\u53D8\u91CF\u6309\u4E3B\u9898\u5207\u6362\uFF0C\u9ED8\u8BA4\uFF08\u6DF1\u8272\uFF09\u4FDD\u6301 antialiased\u3002 */
  -webkit-font-smoothing: var(--twb-smoothing, antialiased);
  -moz-osx-font-smoothing: grayscale;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
}

/* \u9876\u680F\uFF1A\u6807\u9898 + \u5206\u7EC4\u5BFC\u822A\u540C\u4E00\u884C\uFF1B\u6807\u9898\u5B9A\u5BBD\uFF0C\u83DC\u5355\u5360\u7528\u4F59\u91CF\u5E76\u6A2A\u5411\u6EDA\u52A8 */
.twb-header {
  display: flex; align-items: stretch; gap: 0;
  padding: 0 18px; flex: 0 0 auto;
  background: var(--twb-raised);
  border-bottom: 1px solid var(--twb-line);
  position: relative; z-index: 10;
}
/* \u9876\u680F\u5E95\u90E8\u7684\u5FAE\u5149\u5206\u9694\u7EBF\uFF0C\u66FF\u4EE3\u539A\u91CD\u8FB9\u6846 */
.twb-header::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--twb-accent-line) 18%, transparent 62%);
  opacity: .5; pointer-events: none;
}

.twb-brand { display: flex; align-items: center; gap: 9px; padding-right: 16px; flex: 0 0 auto; }
.twb-brand-mark {
  width: 20px; height: 20px; border-radius: 5px; flex: 0 0 auto;
  background: linear-gradient(140deg, var(--twb-accent), color-mix(in srgb, var(--twb-accent) 55%, #000));
  display: grid; place-items: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .28), 0 1px 3px rgba(0, 0, 0, .35);
}
.twb-brand-mark svg { display: block; }
.twb-title { font-size: 13.5px; font-weight: 600; white-space: nowrap; letter-spacing: -.01em; }

.twb-tabs {
  display: flex; align-items: stretch; gap: 1px;
  overflow-x: auto; flex: 1 1 auto; min-width: 0;
  scrollbar-width: none; -ms-overflow-style: none;
}
.twb-tabs::-webkit-scrollbar { height: 0; }

.twb-group {
  display: flex; align-items: center; flex: 0 0 auto;
  font-size: 9.5px; font-weight: 600; letter-spacing: .10em; text-transform: uppercase;
  color: var(--twb-fg-4);
  padding: 0 7px 0 15px;
  border-left: 1px solid var(--twb-hairline);
  margin-left: 3px;
}
.twb-group:first-child { border-left: none; margin-left: 0; padding-left: 6px; }

.twb-tab {
  position: relative; flex: 0 0 auto;
  border: none; background: none; cursor: pointer;
  padding: 13px 10px; font: inherit; font-size: 12.5px; font-weight: 500;
  color: var(--twb-fg-3); white-space: nowrap;
  transition: color var(--twb-dur) var(--twb-ease), background var(--twb-dur) var(--twb-ease);
}
.twb-tab:hover { color: var(--twb-fg); background: var(--twb-hover); }
.twb-tab.active { color: var(--twb-fg); font-weight: 600; }
/* \u6FC0\u6D3B\u6307\u793A\uFF1A2px \u7425\u73C0\u77ED\u6A2A\uFF0C\u4E24\u7AEF\u6536\u7A84 */
.twb-tab.active::after {
  content: ""; position: absolute; left: 8px; right: 8px; bottom: 0; height: 2px;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(90deg, transparent, var(--twb-accent) 22%, var(--twb-accent) 78%, transparent);
}

/* \u2500\u2500 \u4E3B\u4F53 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-body {
  flex: 1 1 auto; overflow: auto; padding: 20px 22px 32px;
  scrollbar-width: thin;
}
.twb-body::-webkit-scrollbar { width: 9px; height: 9px; }
.twb-body::-webkit-scrollbar-thumb {
  background: var(--twb-line-strong); border-radius: 6px;
  border: 2px solid transparent; background-clip: content-box;
}
.twb-body::-webkit-scrollbar-thumb:hover { background: var(--twb-fg-4); background-clip: content-box; }
.twb-body::-webkit-scrollbar-track { background: transparent; }

/* \u9875\u9762\u6807\u9898\u533A */
.twb-page-head { display: flex; align-items: flex-end; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
.twb-page-title { font-size: 17px; font-weight: 600; letter-spacing: -.018em; }
.twb-page-sub { color: var(--twb-fg-3); font-size: 12px; padding-bottom: 2px; }

/* \u2500\u2500 \u5DE5\u5177\u680F \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-toolbar {
  display: flex; gap: 8px; align-items: center;
  margin-bottom: 14px; flex-wrap: wrap;
}
.twb-toolbar .spacer { flex: 1 1 auto; }

/* \u2500\u2500 \u63A7\u4EF6 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-input, .twb-select {
  font: inherit; font-size: 12.5px;
  background: var(--twb-sunken); color: var(--twb-fg);
  border: 1px solid var(--twb-line); border-radius: var(--twb-r-sm);
  padding: 7px 10px; min-width: 0;
  transition: border-color var(--twb-dur) var(--twb-ease), background var(--twb-dur) var(--twb-ease);
  outline: none;
}
.twb-input { min-width: 170px; }
.twb-input::placeholder { color: var(--twb-fg-4); }
.twb-input:hover, .twb-select:hover { border-color: var(--twb-line-strong); }
.twb-input:focus, .twb-select:focus {
  border-color: var(--twb-accent-line);
  background: var(--twb-raised);
  box-shadow: 0 0 0 3px var(--twb-accent-dim);
}
.twb-select { cursor: pointer; padding-right: 26px; appearance: none;
  background-image: linear-gradient(45deg, transparent 49%, var(--twb-fg-3) 50%), linear-gradient(-45deg, transparent 49%, var(--twb-fg-3) 50%);
  background-position: calc(100% - 13px) 52%, calc(100% - 9px) 52%;
  background-size: 4px 4px, 4px 4px; background-repeat: no-repeat;
}
textarea.twb-input { resize: vertical; line-height: 1.65; min-height: 64px; }
.twb-input[type="number"] { font-family: var(--twb-mono); }

/* \u2500\u2500 \u6309\u94AE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-btn {
  font: inherit; font-size: 12.5px; font-weight: 500;
  cursor: pointer; white-space: nowrap;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 7px 13px; border-radius: var(--twb-r-sm);
  border: 1px solid transparent;
  background: linear-gradient(180deg, color-mix(in srgb, var(--twb-accent) 92%, #fff), var(--twb-accent));
  color: #1a1206;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .28), inset 0 1px 0 rgba(255, 255, 255, .22);
  transition: filter var(--twb-dur) var(--twb-ease), transform var(--twb-dur) var(--twb-ease);
}
.twb-btn:hover:not(:disabled) { filter: brightness(1.07); }
.twb-btn:active:not(:disabled) { transform: translateY(.5px); }

.twb-btn.secondary {
  background: var(--twb-raised); color: var(--twb-fg-2);
  border-color: var(--twb-line); box-shadow: none;
}
.twb-btn.secondary:hover:not(:disabled) { color: var(--twb-fg); border-color: var(--twb-line-strong); background: var(--twb-overlay); }

.twb-btn.ghost {
  background: transparent; color: var(--twb-fg-3);
  border-color: transparent; box-shadow: none;
}
.twb-btn.ghost:hover:not(:disabled) { color: var(--twb-fg); background: var(--twb-hover); }

.twb-btn.danger { background: var(--twb-err); color: #fff; box-shadow: none; }
.twb-btn.danger:hover:not(:disabled) { filter: brightness(1.08); }

.twb-btn:disabled { opacity: .42; cursor: not-allowed; }
.twb-btn.sm { padding: 4px 9px; font-size: 11.5px; }
.twb-btn.icon { padding: 6px; width: 29px; height: 29px; }

/* \u2500\u2500 \u8868\u683C\uFF1A\u5DE5\u4E1A\u98CE\u6838\u5FC3\u8D44\u4EA7 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-table-wrap {
  border: 1px solid var(--twb-line); border-radius: var(--twb-r);
  overflow: hidden; background: var(--twb-raised);
}
.twb-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.twb-table th {
  text-align: left; font-size: 10.5px; font-weight: 600;
  letter-spacing: .07em; text-transform: uppercase;
  color: var(--twb-fg-4);
  padding: 9px 12px; white-space: nowrap;
  background: var(--twb-sunken);
  border-bottom: 1px solid var(--twb-line);
  position: sticky; top: 0; z-index: 2;
}
.twb-table td {
  /* \u8868\u683C\u662F\u4E3B\u8981\u6570\u636E\u9762\uFF0C\u6B63\u6587\u7528\u4E3B\u6587\u5B57\u8272\u800C\u975E\u4E8C\u7EA7\u8272 \u2014\u2014
     \u4E8C\u7EA7\u8272\u5728\u6D45\u8272\u4E0B\u53EA\u6709 10:1\uFF0C\u4F46\u504F\u7070\u4ECD\u4E0D\u591F"\u5B9E" */
  padding: 10px 12px; font-size: 13px; color: var(--twb-fg);
  border-bottom: 1px solid var(--twb-hairline);
  vertical-align: middle;
}
/* \u6B21\u8981\u5217\u4ECD\u53EF\u5F31\u5316\uFF0C\u4F46\u4E0D\u4F4E\u4E8E fg-2 */
.twb-table td .twb-muted, .twb-table td.muted { color: var(--twb-fg-3); font-size: 12px; }
.twb-table tbody tr:last-child td { border-bottom: none; }
.twb-table tr.row { cursor: pointer; transition: background var(--twb-dur) var(--twb-ease); }
.twb-table tr.row:hover { background: var(--twb-hover); }
.twb-table tr.row:hover td:first-child { box-shadow: inset 2px 0 0 var(--twb-accent); }
/* \u6570\u5B57\u5217\u7B49\u5BBD\u5BF9\u9F50 */
.twb-table td.num, .twb-table th.num { text-align: right; font-family: var(--twb-mono); font-size: 12px; }
.twb-table td.mono { font-family: var(--twb-mono); font-size: 12px; }

/* \u2500\u2500 \u5FBD\u7AE0 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 8px; border-radius: 4px;
  font-size: 11px; font-weight: 500; line-height: 1.55;
  background: var(--twb-sunken); color: var(--twb-fg-2);
  border: 1px solid var(--twb-line);
  white-space: nowrap;
}
.twb-badge::before {
  content: ""; width: 5px; height: 5px; border-radius: 50%;
  background: currentColor; opacity: .75; flex: 0 0 auto;
}
.twb-badge.plain::before { display: none; }
.twb-badge.ok { color: var(--twb-ok); background: var(--twb-ok-dim); border-color: color-mix(in srgb, var(--twb-ok) 30%, transparent); }
.twb-badge.warn { color: var(--twb-warn); background: var(--twb-warn-dim); border-color: color-mix(in srgb, var(--twb-warn) 30%, transparent); }
.twb-badge.err { color: var(--twb-err); background: var(--twb-err-dim); border-color: color-mix(in srgb, var(--twb-err) 30%, transparent); }
.twb-badge.info { color: var(--twb-info); background: var(--twb-info-dim); border-color: color-mix(in srgb, var(--twb-info) 30%, transparent); }
.twb-badge.accent { color: var(--twb-accent); background: var(--twb-accent-dim); border-color: var(--twb-accent-line); }

/* \u2500\u2500 \u7EDF\u8BA1\u5361 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-cards {
  display: grid; gap: 10px; margin-bottom: 20px;
  grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
}
.twb-card {
  position: relative; overflow: hidden;
  border: 1px solid var(--twb-line); border-radius: var(--twb-r);
  padding: 13px 14px; background: var(--twb-raised);
  transition: border-color var(--twb-dur) var(--twb-ease);
}
.twb-card:hover { border-color: var(--twb-line-strong); }
/* \u9876\u90E8 1px \u9AD8\u5149\uFF1A\u6A21\u62DF\u91D1\u5C5E\u8FB9\u7F18 */
.twb-card::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .10), transparent);
}
.twb-card .k {
  font-size: 10.5px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase;
  color: var(--twb-fg-4); margin-bottom: 7px;
}
.twb-card .v {
  font-size: 21px; font-weight: 600; line-height: 1.15;
  font-family: var(--twb-mono); letter-spacing: -.02em;
  color: var(--twb-fg);
}
.twb-card .sub { font-size: 11px; color: var(--twb-fg-3); margin-top: 5px; }
.twb-card.tone-ok .v { color: var(--twb-ok); }
.twb-card.tone-warn .v { color: var(--twb-warn); }
.twb-card.tone-err .v { color: var(--twb-err); }
.twb-card.tone-accent .v { color: var(--twb-accent); }

/* \u2500\u2500 \u5206\u8282\u6807\u9898 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-section {
  display: flex; align-items: center; gap: 9px;
  margin: 22px 0 11px; font-size: 12px; font-weight: 600;
  color: var(--twb-fg-2); letter-spacing: .01em;
}
.twb-section::before {
  content: ""; width: 2px; height: 11px; border-radius: 1px;
  background: var(--twb-accent); opacity: .8; flex: 0 0 auto;
}
.twb-section::after {
  content: ""; flex: 1 1 auto; height: 1px;
  background: linear-gradient(90deg, var(--twb-line), transparent);
}
.twb-section:first-child { margin-top: 0; }

/* \u2500\u2500 \u62BD\u5C49 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-drawer-mask {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0, 0, 0, .5);
  backdrop-filter: blur(2px);
  animation: twbFade var(--twb-dur) var(--twb-ease);
}
.twb-drawer {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: min(720px, 94vw);
  display: flex; flex-direction: column; z-index: 1001;
  background: var(--twb-raised); color: var(--twb-fg);
  border-left: 1px solid var(--twb-line-strong);
  box-shadow: var(--twb-shadow-lg);
  animation: twbSlide 200ms var(--twb-ease);
}
.twb-drawer header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 18px; flex: 0 0 auto;
  border-bottom: 1px solid var(--twb-line);
  background: linear-gradient(180deg, var(--twb-overlay), var(--twb-raised));
}
.twb-drawer header .h { font-size: 13.5px; font-weight: 600; letter-spacing: -.01em; }
.twb-drawer header .s { font-size: 11px; color: var(--twb-fg-3); margin-top: 2px; }
.twb-drawer .content { flex: 1 1 auto; overflow: auto; padding: 18px; }

@keyframes twbFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes twbSlide { from { transform: translateX(24px); opacity: .6 } to { transform: none; opacity: 1 } }

/* \u2500\u2500 \u8868\u5355 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
.twb-field > label {
  font-size: 10.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
  color: var(--twb-fg-4);
}
.twb-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.twb-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
@media (max-width: 720px) { .twb-grid2, .twb-grid3 { grid-template-columns: 1fr; } }

/* \u2500\u2500 \u7A7A\u6001 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 9px; padding: 52px 24px; text-align: center;
  border: 1px dashed var(--twb-line); border-radius: var(--twb-r);
  background: var(--twb-sunken);
}
.twb-empty .t { font-size: 13px; font-weight: 600; color: var(--twb-fg-2); }
.twb-empty .d { font-size: 12px; color: var(--twb-fg-3); max-width: 380px; line-height: 1.6; }
.twb-empty .ico { color: var(--twb-fg-4); margin-bottom: 2px; }

/* \u2500\u2500 Toast \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-toast-stack {
  position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; gap: 8px; z-index: 1100;
  pointer-events: none; align-items: center;
}
.twb-toast {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 15px; border-radius: var(--twb-r);
  font-size: 12.5px; font-weight: 500;
  background: var(--twb-overlay); color: var(--twb-fg);
  border: 1px solid var(--twb-line-strong);
  box-shadow: var(--twb-shadow-lg);
  animation: twbToastIn 180ms var(--twb-ease);
}
.twb-toast::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%;
  background: var(--twb-err); flex: 0 0 auto;
}
.twb-toast.ok::before { background: var(--twb-ok); }
@keyframes twbToastIn { from { transform: translateY(8px); opacity: 0 } to { transform: none; opacity: 1 } }

/* \u2500\u2500 \u9636\u6BB5\u6B65\u9AA4\u6761 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-steps { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px; }
.twb-step {
  padding: 5px 11px; border-radius: var(--twb-r-sm);
  font-size: 11.5px; font-weight: 500;
  border: 1px solid var(--twb-line); background: var(--twb-sunken);
  color: var(--twb-fg-3); cursor: pointer;
  transition: all var(--twb-dur) var(--twb-ease);
}
.twb-step:hover { border-color: var(--twb-line-strong); color: var(--twb-fg); }
.twb-step.done {
  background: var(--twb-accent-dim); color: var(--twb-accent);
  border-color: var(--twb-accent-line); font-weight: 600;
}

/* \u2500\u2500 \u8FDB\u5EA6\u6761 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-bar-track { height: 6px; border-radius: 3px; background: var(--twb-sunken); overflow: hidden; }
.twb-bar {
  height: 6px; border-radius: 3px; min-width: 3px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--twb-accent) 70%, transparent), var(--twb-accent));
  transition: width 320ms var(--twb-ease);
}

/* \u2500\u2500 \u6587\u672C\u5DE5\u5177 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-muted { color: var(--twb-fg-3); font-size: 12px; }
.twb-dim { color: var(--twb-fg-4); font-size: 11.5px; }
.twb-mono { font-family: var(--twb-mono); font-variant-numeric: tabular-nums; }
.twb-kv { display: flex; flex-direction: column; gap: 7px; }
.twb-kv .r { display: flex; gap: 12px; font-size: 12.5px; }
.twb-kv .r .k { color: var(--twb-fg-4); min-width: 84px; flex: 0 0 auto; font-size: 11.5px; }
.twb-kv .r .v { color: var(--twb-fg-2); word-break: break-all; }

/* \u2500\u2500 \u5206\u6BB5\u63A7\u4EF6 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-seg {
  display: inline-flex; gap: 2px; padding: 2px;
  background: var(--twb-sunken); border: 1px solid var(--twb-line);
  border-radius: var(--twb-r-sm);
}
.twb-seg button {
  font: inherit; font-size: 11.5px; font-weight: 500;
  padding: 5px 12px; border-radius: 4px; cursor: pointer;
  border: none; background: transparent; color: var(--twb-fg-3);
  transition: all var(--twb-dur) var(--twb-ease);
}
.twb-seg button:hover { color: var(--twb-fg); }
.twb-seg button.on {
  background: var(--twb-overlay); color: var(--twb-fg);
  box-shadow: 0 1px 2px rgba(0, 0, 0, .3);
  font-weight: 600;
}

/* \u2500\u2500 \u770B\u677F \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-board {
  display: grid; gap: 10px; overflow-x: auto; padding-bottom: 6px;
  grid-auto-flow: column; grid-auto-columns: minmax(178px, 1fr);
}
.twb-col-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 9px; margin-bottom: 9px;
  border-radius: var(--twb-r-sm);
  background: var(--twb-sunken);
  border-top: 2px solid var(--twb-fg-4);
  font-size: 11px; font-weight: 600; letter-spacing: .03em;
}
.twb-col-head .n {
  font-family: var(--twb-mono); font-size: 11px;
  color: var(--twb-fg-3); background: var(--twb-overlay);
  padding: 0 6px; border-radius: 3px; min-width: 20px; text-align: center;
}
.twb-tile {
  border: 1px solid var(--twb-line); border-radius: var(--twb-r-sm);
  padding: 9px 10px; margin-bottom: 7px; cursor: pointer;
  background: var(--twb-raised);
  transition: border-color var(--twb-dur) var(--twb-ease), transform var(--twb-dur) var(--twb-ease);
}
.twb-tile:hover { border-color: var(--twb-line-strong); transform: translateY(-1px); }
.twb-tile .t { font-size: 12px; font-weight: 600; color: var(--twb-fg); margin-bottom: 3px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.twb-tile .m { font-size: 10.5px; color: var(--twb-fg-4); margin-bottom: 7px; }
.twb-tile .acts { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 7px; }
.twb-tile .acts button {
  font: inherit; font-size: 9.5px; padding: 1px 6px; border-radius: 3px;
  border: 1px solid var(--twb-line); background: transparent;
  color: var(--twb-fg-4); cursor: pointer;
  transition: all var(--twb-dur) var(--twb-ease);
}
.twb-tile .acts button:hover { color: var(--twb-accent); border-color: var(--twb-accent-line); }

/* \u2500\u2500 \u4EE3\u7801/\u65E5\u5FD7\u5757 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-pre {
  font-family: var(--twb-mono); font-size: 11.5px; line-height: 1.7;
  padding: 11px 13px; border-radius: var(--twb-r-sm);
  background: var(--twb-sunken); border: 1px solid var(--twb-line);
  color: var(--twb-fg-2); overflow: auto; white-space: pre-wrap; word-break: break-all;
}
/* \u2500\u2500 \u9AA8\u67B6\u5C4F \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-skel {
  background: linear-gradient(
    90deg,
    var(--twb-sunken) 0%,
    var(--twb-line) 50%,
    var(--twb-sunken) 100%
  );
  background-size: 200% 100%;
  animation: twbShimmer 1.4s ease-in-out infinite;
}
@keyframes twbShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
/* \u5C0A\u91CD\u7CFB\u7EDF\u7684"\u51CF\u5C11\u52A8\u6001\u6548\u679C"\u504F\u597D */
@media (prefers-reduced-motion: reduce) {
  .twb-skel { animation: none; }
  .twb-tab, .twb-btn, .twb-card, .twb-tile, .twb-step { transition: none; }
}

/* \u2500\u2500 \u547D\u4EE4\u9762\u677F \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-cmdk-mask {
  position: fixed; inset: 0; z-index: 1200;
  background: rgba(0, 0, 0, .5);
  backdrop-filter: blur(3px);
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: min(14vh, 120px);
  animation: twbFade 120ms var(--twb-ease);
}
.twb-cmdk {
  width: min(560px, 92vw);
  background: var(--twb-overlay);
  border: 1px solid var(--twb-line-strong);
  border-radius: var(--twb-r-lg);
  box-shadow: var(--twb-shadow-lg);
  overflow: hidden;
  animation: twbCmdkIn 160ms var(--twb-ease);
}
@keyframes twbCmdkIn {
  from { transform: translateY(-8px) scale(.98); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.twb-cmdk-input {
  width: 100%; box-sizing: border-box;
  padding: 14px 18px; border: none; outline: none;
  background: transparent; color: var(--twb-fg);
  font: inherit; font-size: 14.5px;
  border-bottom: 1px solid var(--twb-line);
}
.twb-cmdk-input::placeholder { color: var(--twb-fg-4); }
.twb-cmdk-list { max-height: 340px; overflow-y: auto; padding: 6px; }
.twb-cmdk-group {
  font-size: 9.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: var(--twb-fg-4); padding: 8px 10px 4px;
}
.twb-cmdk-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 11px; border-radius: var(--twb-r-sm);
  cursor: pointer; font-size: 13px; color: var(--twb-fg-2);
}
.twb-cmdk-item.on { background: var(--twb-accent-dim); color: var(--twb-fg); }
.twb-cmdk-item .hint { margin-left: auto; font-size: 10.5px; color: var(--twb-fg-4); }
.twb-cmdk-foot {
  display: flex; gap: 14px; padding: 8px 14px;
  border-top: 1px solid var(--twb-line);
  background: var(--twb-sunken);
  font-size: 10.5px; color: var(--twb-fg-4);
}
.twb-cmdk-foot kbd {
  font-family: var(--twb-mono); font-size: 10px;
  padding: 1px 5px; border-radius: 3px;
  border: 1px solid var(--twb-line); background: var(--twb-raised);
}
.twb-cmdk-empty { padding: 28px; text-align: center; color: var(--twb-fg-4); font-size: 12.5px; }

/* \u2500\u2500 \u9876\u680F\u641C\u7D22\u89E6\u53D1\u4E0E\u53F3\u4FA7\u5DE5\u5177 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.twb-cmd-trigger {
  display: inline-flex; align-items: center; gap: 7px;
  margin: 0 0 0 14px; padding: 5px 9px;
  border: 1px solid var(--twb-line); border-radius: var(--twb-r-sm);
  background: var(--twb-sunken); color: var(--twb-fg-4);
  font: inherit; font-size: 11.5px; cursor: pointer;
  transition: color var(--twb-dur) var(--twb-ease), border-color var(--twb-dur) var(--twb-ease);
  flex: 0 0 auto;
}
.twb-cmd-trigger:hover {
  color: var(--twb-fg-2); border-color: var(--twb-line-strong);
}
.twb-cmd-trigger kbd {
  font-family: var(--twb-mono); font-size: 9.5px;
  padding: 1px 4px; border-radius: 3px;
  border: 1px solid var(--twb-line); background: var(--twb-raised);
  color: var(--twb-fg-4);
}
.twb-header-right {
  display: flex; align-items: center; gap: 4px;
  padding-left: 8px; margin-left: auto;
  border-left: 1px solid var(--twb-hairline);
  flex: 0 0 auto;
}
/* \u7A84\u5C4F\u65F6\u6536\u8D77\u641C\u7D22\u6309\u94AE\u7684\u6587\u5B57\uFF0C\u53EA\u7559\u56FE\u6807 */
@media (max-width: 900px) {
  .twb-cmd-trigger span, .twb-cmd-trigger kbd { display: none; }
  .twb-cmd-trigger { margin-left: 8px; }
}
`;
function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("twb-styles")) return;
  const el = document.createElement("style");
  el.id = "twb-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

// src/client/ai.tsx
var React2 = __toESM(require("react"), 1);
var import_react2 = require("react");
function attachBridge(bridge) {
  _bridge = bridge;
}
var _bridge = null;
var AI_KINDS = [
  { id: "dev-mail", label: "\u5F00\u53D1\u4FE1", build: (c) => "\u6211\u662F\u4E2D\u56FD\u7684\u5916\u8D38\u4E1A\u52A1\u5458\uFF0C\u8BF7\u6839\u636E\u4EE5\u4E0B\u5BA2\u6237\u4E0E\u4EA7\u54C1\u80CC\u666F\uFF0C\u7528\u82F1\u6587\u5199\u4E00\u5C01\u4E13\u4E1A\u3001\u7B80\u77ED\uFF08150 \u8BCD\u5185\uFF09\u7684\u5F00\u53D1\u4FE1\uFF0C\u7A81\u51FA\u53EF\u9760\u4EA4\u4ED8\u4E0E\u5DEE\u5F02\u5316\uFF0C\u5305\u542B\u90AE\u4EF6\u4E3B\u9898\u884C\u3002\u80CC\u666F\uFF1A\n" + c },
  { id: "follow-mail", label: "\u8DDF\u8FDB\u4FE1", build: (c) => "\u4EE5\u4E0B\u662F\u4E00\u4E2A\u5916\u8D38\u8BE2\u76D8\u7684\u8DDF\u8FDB\u8BB0\u5F55\uFF0C\u8BF7\u5199\u4E00\u5C01\u82F1\u6587\u8DDF\u8FDB\u90AE\u4EF6\uFF1A\u793C\u8C8C\u50AC\u4FC3\u3001\u7ED9\u51FA\u4E00\u4E2A\u56DE\u590D\u94A9\u5B50\uFF08\u5982\u6837\u54C1/\u65B0\u4EF7\u683C/\u4EA4\u671F\u63D0\u524D\uFF09\uFF0C120 \u8BCD\u5185\u3002\u8BB0\u5F55\uFF1A\n" + c },
  { id: "translate", label: "\u7FFB\u8BD1\u6DA6\u8272", build: (c) => "\u628A\u4E0B\u9762\u7684\u4E2D\u6587\u7FFB\u8BD1\u6210\u5730\u9053\u7684\u5546\u52A1\u82F1\u8BED\uFF08\u6216\u628A\u82F1\u6587\u6DA6\u8272\u4E3A\u89C4\u8303\u5546\u52A1\u8868\u8FBE\uFF09\uFF0C\u4FDD\u6301\u6570\u636E\u4E0E\u672F\u8BED\u4E0D\u53D8\uFF1A\n" + c },
  { id: "doc-check", label: "\u5355\u8BC1\u8981\u7D20\u6838\u5BF9", build: (c) => "\u8FD9\u662F\u5916\u8D38\u5355\u8BC1\u8981\u7D20\u6E05\u5355\uFF0C\u8BF7\u68C0\u67E5\u7F3A\u9879\u4E0E\u903B\u8F91\u51B2\u7A81\uFF08\u551B\u5934\u3001\u4EF6\u91CD\u5C3A\u3001HS \u7F16\u7801\u3001\u6536\u53D1\u8D27\u4EBA\u4E00\u81F4\u6027\uFF09\uFF0C\u8F93\u51FA\u95EE\u9898\u5217\u8868\uFF1A\n" + c }
];
function AiDraft(props) {
  const [kind, setKind] = (0, import_react2.useState)("dev-mail");
  const [out, setOut] = (0, import_react2.useState)("");
  const [busy, setBusy] = (0, import_react2.useState)(false);
  const def = AI_KINDS.find((k) => k.id === kind);
  const prompt = def.build(props.context);
  const handoff = () => _bridge?.handoff(prompt);
  const direct = async () => {
    setBusy(true);
    setOut("");
    try {
      const r = await api.aiChat([{ role: "user", content: prompt }]);
      setOut(r.content);
    } catch (e) {
      setOut("\u76F4\u8FDE\u5931\u8D25\uFF1A" + e.message + "\n\uFF08\u53EF\u6539\u7528\u300C\u4EA4\u7ED9 AI \u4F1A\u8BDD\u300D\uFF09");
    } finally {
      setBusy(false);
    }
  };
  return React2.createElement(
    "div",
    { className: "twb-section" },
    React2.createElement(
      "div",
      { className: "twb-toolbar" },
      React2.createElement("strong", null, "AI \u8D77\u8349 \xB7 " + props.title),
      React2.createElement(
        Select,
        { value: kind, onChange: (e) => setKind(e.target.value) },
        AI_KINDS.map((k) => React2.createElement("option", { key: k.id, value: k.id }, k.label))
      ),
      React2.createElement("button", { className: "twb-btn", onClick: handoff, title: "\u628A\u63D0\u793A\u8BCD\u6CE8\u5165\u65B0\u4F1A\u8BDD\u8349\u7A3F\uFF0C\u7531\u4F60\u53D1\u9001" }, "\u4EA4\u7ED9 AI \u4F1A\u8BDD"),
      React2.createElement("button", { className: "twb-btn secondary", onClick: direct, disabled: busy }, busy ? "\u751F\u6210\u4E2D\u2026" : "\u9762\u677F\u76F4\u8FDE\u751F\u6210")
    ),
    out ? React2.createElement("pre", { style: { whiteSpace: "pre-wrap", fontSize: 13 } }, out) : null
  );
}

// src/client/ErrorBoundary.tsx
var React3 = __toESM(require("react"), 1);
var PanelBoundary = class extends React3.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[trade-workbench] panel crashed:", this.props.tab, error, info);
  }
  componentDidUpdate(prev) {
    if (prev.tab !== this.props.tab && this.state.error) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) {
      return React3.createElement(
        "div",
        { className: "twb-empty", style: { borderStyle: "solid" } },
        React3.createElement("div", { className: "t" }, "\u8FD9\u4E2A\u9875\u9762\u51FA\u9519\u4E86"),
        React3.createElement(
          "div",
          { className: "d", style: { fontFamily: "var(--twb-mono)", fontSize: 11.5 } },
          String(this.state.error.message ?? this.state.error)
        ),
        React3.createElement(
          "div",
          { style: { display: "flex", gap: 8, marginTop: 6 } },
          React3.createElement("button", {
            className: "twb-btn secondary sm",
            onClick: () => this.setState({ error: null })
          }, "\u91CD\u8BD5"),
          React3.createElement(
            "span",
            { className: "twb-dim", style: { alignSelf: "center" } },
            "\u5176\u4ED6\u9875\u9762\u4ECD\u53EF\u6B63\u5E38\u4F7F\u7528"
          )
        )
      );
    }
    return this.props.children;
  }
};

// src/client/CommandPalette.tsx
var React4 = __toESM(require("react"), 1);
var import_react3 = require("react");
function score(text, query) {
  if (!query) return 1;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q)) {
    return 100 - t.indexOf(q) + (t.startsWith(q) ? 50 : 0);
  }
  let ti = 0;
  let matched = 0;
  let streak = 0;
  let bonus = 0;
  for (const ch of q) {
    const idx = t.indexOf(ch, ti);
    if (idx === -1) return -1;
    if (idx === ti) {
      streak += 1;
      bonus += streak * 2;
    } else {
      streak = 0;
    }
    ti = idx + 1;
    matched += 1;
  }
  return matched > 0 ? bonus + matched : -1;
}
function CommandPalette(props) {
  const [q, setQ] = (0, import_react3.useState)("");
  const [cursor, setCursor] = (0, import_react3.useState)(0);
  const inputRef = (0, import_react3.useRef)(null);
  const commands = (0, import_react3.useMemo)(() => {
    const list = props.tabs.map(([id, label]) => ({
      id: "tab:" + id,
      title: label,
      group: "\u8DF3\u8F6C\u9875\u9762",
      hint: id,
      run: () => {
        setTab(id);
        props.onClose();
      }
    }));
    list.push(
      { id: "theme:auto", title: "\u4E3B\u9898\uFF1A\u8DDF\u968F\u7CFB\u7EDF", group: "\u8BBE\u7F6E", run: () => {
        setTheme("auto");
        props.onClose();
      } },
      { id: "theme:dark", title: "\u4E3B\u9898\uFF1A\u6DF1\u8272", group: "\u8BBE\u7F6E", run: () => {
        setTheme("dark");
        props.onClose();
      } },
      { id: "theme:light", title: "\u4E3B\u9898\uFF1A\u6D45\u8272", group: "\u8BBE\u7F6E", run: () => {
        setTheme("light");
        props.onClose();
      } }
    );
    return list;
  }, [props.tabs, props.onClose]);
  const results = (0, import_react3.useMemo)(() => {
    const scored = commands.map((c) => ({ c, s: score(c.title + " " + (c.hint ?? ""), q) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
    return scored.map((x) => x.c);
  }, [commands, q]);
  (0, import_react3.useEffect)(() => {
    if (props.open) {
      setQ("");
      setCursor(0);
      setTimeout(() => {
        try {
          inputRef.current?.focus();
        } catch {
        }
      }, 0);
    }
  }, [props.open]);
  (0, import_react3.useEffect)(() => {
    setCursor(0);
  }, [q]);
  if (!props.open) return null;
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      props.onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      results[cursor]?.run();
    }
  };
  const groups = [];
  for (const c of results) {
    const g = groups.find((x) => x.name === c.group);
    if (g) g.items.push(c);
    else groups.push({ name: c.group, items: [c] });
  }
  let flatIndex = 0;
  return React4.createElement(
    "div",
    {
      className: "twb-cmdk-mask",
      onClick: (e) => {
        if (e.target === e.currentTarget) props.onClose();
      }
    },
    React4.createElement(
      "div",
      { className: "twb-cmdk", onKeyDown },
      React4.createElement("input", {
        ref: inputRef,
        className: "twb-cmdk-input",
        placeholder: "\u641C\u7D22\u9875\u9762\u3001\u547D\u4EE4\u2026",
        value: q,
        onChange: (e) => setQ(e.target.value),
        onKeyDown
      }),
      results.length === 0 ? React4.createElement("div", { className: "twb-cmdk-empty" }, "\u6CA1\u6709\u5339\u914D\u7684\u547D\u4EE4") : React4.createElement(
        "div",
        { className: "twb-cmdk-list" },
        groups.map((g) => React4.createElement(
          React4.Fragment,
          { key: g.name },
          React4.createElement("div", { className: "twb-cmdk-group" }, g.name),
          g.items.map((c) => {
            const idx = flatIndex++;
            return React4.createElement(
              "div",
              {
                key: c.id,
                className: "twb-cmdk-item" + (idx === cursor ? " on" : ""),
                onMouseEnter: () => setCursor(idx),
                onClick: () => c.run()
              },
              React4.createElement("span", null, c.title),
              c.hint ? React4.createElement("span", { className: "hint" }, c.hint) : null
            );
          })
        ))
      ),
      React4.createElement(
        "div",
        { className: "twb-cmdk-foot" },
        React4.createElement("span", null, React4.createElement("kbd", null, "\u2191"), " ", React4.createElement("kbd", null, "\u2193"), " \u9009\u62E9"),
        React4.createElement("span", null, React4.createElement("kbd", null, "Enter"), " \u6267\u884C"),
        React4.createElement("span", null, React4.createElement("kbd", null, "Esc"), " \u5173\u95ED"),
        React4.createElement("span", { style: { marginLeft: "auto" } }, `\u5F53\u524D\uFF1A${state.tab}`)
      )
    )
  );
}

// src/client/panels/Dashboard.tsx
var React5 = __toESM(require("react"), 1);
var import_react4 = require("react");

// src/shared/types.ts
var STAGES = ["inquiry", "quote", "pi", "production", "booking", "customs", "shipped", "receipt", "closed"];
function quoteTotal(q) {
  let total = 0, cost = 0;
  for (const it of q.items) {
    total += it.qty * it.price * 100;
    cost += it.qty * it.cost * 100;
  }
  total = Math.round(total);
  cost = Math.round(cost);
  const margin = total - cost;
  return { totalCents: total, costCents: cost, marginCents: margin, marginRate: total ? margin / total : 0 };
}

// src/client/panels/Dashboard.tsx
var STAGE_CN = {
  inquiry: "\u8BE2\u76D8",
  quote: "\u62A5\u4EF7",
  pi: "PI/\u5408\u540C",
  production: "\u751F\u4EA7",
  booking: "\u8BA2\u8231",
  customs: "\u62A5\u5173",
  shipped: "\u51FA\u8FD0",
  receipt: "\u6536\u6B3E",
  closed: "\u7ED3\u6848"
};
function Dashboard() {
  const [d, setD] = (0, import_react4.useState)(null);
  const [err, setErr] = (0, import_react4.useState)("");
  useVersion();
  (0, import_react4.useEffect)(() => {
    api.dashboard().then(setD).catch((e) => setErr(e.message));
  }, []);
  if (err) return React5.createElement(Empty, { title: "\u770B\u677F\u52A0\u8F7D\u5931\u8D25", desc: err });
  if (!d) {
    return React5.createElement(
      "div",
      null,
      React5.createElement(PageHead, { title: "\u7ECF\u8425\u770B\u677F", sub: "\u52A0\u8F7D\u4E2D\u2026" }),
      React5.createElement(CardsSkeleton, { n: 6 }),
      React5.createElement(TableSkeleton, { rows: 5, cols: 3 }),
      React5.createElement("div", { style: { height: 16 } }),
      React5.createElement(TableSkeleton, { rows: 4, cols: 4 })
    );
  }
  const stageData = (d.revenueByStage ?? []).filter((x) => x.cents > 0);
  const maxStage = Math.max(1, ...stageData.map((x) => x.cents));
  const months = (d.marginByMonth ?? []).slice(-6);
  const totalRevenue = months.reduce((s, m) => s + m.revenueCents, 0);
  const totalGross = months.reduce((s, m) => s + (m.revenueCents - m.costCents), 0);
  const avgMargin = totalRevenue ? totalGross / totalRevenue : 0;
  return React5.createElement(
    "div",
    null,
    React5.createElement(PageHead, { title: "\u7ECF\u8425\u770B\u677F", sub: "\u8FD1 6 \u4E2A\u6708\u7ECF\u8425\u5065\u5EB7\u5EA6\u603B\u89C8" }),
    React5.createElement(
      "div",
      { className: "twb-cards" },
      React5.createElement(StatCard, { label: "\u672C\u6708\u8BE2\u76D8", value: d.inquiriesThisMonth, sub: "\u65B0\u589E\u8BE2\u76D8\u6570" }),
      React5.createElement(StatCard, { label: "\u8BE2\u76D8\u8F6C\u5316\u7387", value: pct(d.inquiryToOrderRate ?? 0), tone: "accent", sub: "\u8BE2\u76D8 \u2192 \u8BA2\u5355" }),
      React5.createElement(StatCard, { label: "\u5728\u624B\u8BA2\u5355", value: moneyShort(d.openOrderCents), sub: "\u672A\u7ED3\u6848\u91D1\u989D" }),
      React5.createElement(StatCard, {
        label: "\u672A\u6536\u6C47",
        value: moneyShort(d.unpaidCents),
        tone: d.unpaidCents > 0 ? "warn" : "ok",
        sub: d.unpaidCents > 0 ? "\u5F85\u50AC\u6536" : "\u5DF2\u5168\u90E8\u6536\u56DE"
      }),
      React5.createElement(StatCard, {
        label: "\u903E\u671F\u4EA4\u671F",
        value: d.overdueCount + " \u5355",
        tone: d.overdueCount > 0 ? "err" : "ok",
        sub: d.overdueCount > 0 ? "\u9700\u7ACB\u5373\u5904\u7406" : "\u5168\u90E8\u6309\u671F"
      }),
      React5.createElement(StatCard, { label: "\u5BA2\u6237 / \u8BA2\u5355", value: d.totalCustomers + " / " + d.totalOrders, sub: "\u7D2F\u8BA1\u5EFA\u6863" })
    ),
    React5.createElement(
      Section,
      { title: "\u5404\u9636\u6BB5\u5728\u624B\u91D1\u989D" },
      stageData.length === 0 ? React5.createElement(Empty, { title: "\u8FD8\u6CA1\u6709\u5728\u624B\u8BA2\u5355", desc: "\u4ECE\u300C\u62A5\u4EF7/PI\u300D\u521B\u5EFA\u62A5\u4EF7\u5E76\u8F6C\u4E3A\u8BA2\u5355\u540E\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A\u5404\u9636\u6BB5\u91D1\u989D\u5206\u5E03\u3002" }) : React5.createElement(
        "div",
        { className: "twb-table-wrap" },
        React5.createElement(
          "table",
          { className: "twb-table" },
          React5.createElement("tbody", null, stageData.map((x) => React5.createElement(
            "tr",
            { key: x.stage },
            React5.createElement("td", { style: { width: 96, fontWeight: 550 } }, STAGE_CN[x.stage] ?? x.stage),
            React5.createElement(
              "td",
              null,
              React5.createElement(
                "div",
                { className: "twb-bar-track" },
                React5.createElement("div", {
                  className: "twb-bar",
                  style: { width: Math.max(3, x.cents / maxStage * 100) + "%" }
                })
              )
            ),
            React5.createElement("td", { className: "num", style: { width: 150 } }, money(x.cents))
          )))
        )
      )
    ),
    React5.createElement(
      Section,
      { title: "\u6708\u5EA6\u8425\u6536 / \u6BDB\u5229" },
      months.length === 0 ? React5.createElement(Empty, { title: "\u6682\u65E0\u6708\u5EA6\u6570\u636E", desc: "\u8BA2\u5355\u4EA7\u751F\u6536\u6C47\u8BB0\u5F55\u540E\uFF0C\u8FD9\u91CC\u4F1A\u6309\u6708\u6C47\u603B\u8425\u6536\u4E0E\u6BDB\u5229\u3002" }) : React5.createElement(
        "div",
        null,
        React5.createElement(
          "div",
          { className: "twb-cards", style: { marginBottom: 12 } },
          React5.createElement(StatCard, { label: "\u8FD1 6 \u6708\u8425\u6536", value: moneyShort(totalRevenue), tone: "accent" }),
          React5.createElement(StatCard, { label: "\u8FD1 6 \u6708\u6BDB\u5229", value: moneyShort(totalGross), tone: "ok" }),
          React5.createElement(StatCard, { label: "\u5E73\u5747\u6BDB\u5229\u7387", value: pct(avgMargin) })
        ),
        React5.createElement(Table, {
          head: ["\u6708\u4EFD", "\u8425\u6536", "\u6BDB\u5229", "\u6BDB\u5229\u7387"]
        }, months.map((m) => {
          const gross = m.revenueCents - m.costCents;
          const rate = m.revenueCents ? gross / m.revenueCents : NaN;
          return React5.createElement(
            "tr",
            { key: m.month },
            React5.createElement("td", { className: "mono" }, m.month),
            React5.createElement("td", { className: "num" }, money(m.revenueCents)),
            React5.createElement("td", { className: "num" }, money(gross)),
            React5.createElement(
              "td",
              { className: "num" },
              React5.createElement("span", { className: "twb-badge plain " + (rate >= 0.2 ? "ok" : rate >= 0.1 ? "warn" : "err") }, pct(rate))
            )
          );
        }))
      )
    ),
    React5.createElement(
      Section,
      { title: "\u5C65\u7EA6\u6D41\u7A0B" },
      React5.createElement(
        "div",
        { className: "twb-steps" },
        STAGES.map((s, i) => React5.createElement("div", {
          key: s,
          className: "twb-step done",
          style: { opacity: 1 - i * 0.045, pointerEvents: "none" }
        }, STAGE_CN[s] ?? s))
      )
    )
  );
}

// src/client/panels/Customers.tsx
var React6 = __toESM(require("react"), 1);
var import_react5 = require("react");
function NewCustomerInline({ onDone }) {
  const [f, setF] = (0, import_react5.useState)({ name: "", country: "", source: "\u5B98\u7F51", contact: "", email: "", whatsapp: "", tags: "", note: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return React6.createElement(
    "div",
    {
      style: {
        padding: 14,
        marginBottom: 16,
        border: "1px solid var(--twb-line)",
        borderRadius: "var(--twb-r)",
        background: "var(--twb-raised)"
      }
    },
    React6.createElement(
      "div",
      { className: "twb-grid3" },
      F("\u516C\u53F8\u540D\u79F0 *", f.name, set("name")),
      F("\u56FD\u5BB6", f.country, set("country")),
      F("\u6765\u6E90", f.source, set("source")),
      F("\u8054\u7CFB\u4EBA", f.contact, set("contact")),
      F("\u90AE\u7BB1", f.email, set("email")),
      F("WhatsApp", f.whatsapp, set("whatsapp"))
    ),
    React6.createElement(
      "div",
      { className: "twb-toolbar", style: { marginBottom: 0, marginTop: 4 } },
      React6.createElement("button", {
        className: "twb-btn",
        onClick: async () => {
          if (!f.name) return toasts.push("\u516C\u53F8\u540D\u79F0\u5FC5\u586B");
          try {
            await saveRow("customers", f);
            onDone();
          } catch (e) {
            toasts.push(e.message);
          }
        }
      }, "\u521B\u5EFA\u5BA2\u6237"),
      React6.createElement("button", { className: "twb-btn secondary", onClick: onDone }, "\u53D6\u6D88")
    )
  );
}
function F(label, value, onChange) {
  return React6.createElement(Field, { label }, React6.createElement(TextInput, { value, onChange }));
}
function Customers() {
  const [q, setQ] = (0, import_react5.useState)("");
  const [adding, setAdding] = (0, import_react5.useState)(false);
  const { rows, reload, loading } = useList("customers", q);
  const columns = [
    { label: "\u540D\u79F0", get: (r) => r.name, width: 200, render: (r) => React6.createElement("span", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, r.name || "-") },
    { label: "\u56FD\u5BB6", get: (r) => r.country },
    { label: "\u6765\u6E90", get: (r) => r.source, render: (r) => r.source ? React6.createElement(Badge, { plain: true }, r.source) : "\u2014" },
    { label: "\u90AE\u7BB1", get: (r) => r.email, render: (r) => React6.createElement("span", { className: "mono twb-muted" }, r.email || "\u2014") },
    { label: "WhatsApp", get: (r) => r.whatsapp, render: (r) => React6.createElement("span", { className: "mono twb-muted" }, r.whatsapp || "\u2014") }
  ];
  const sort = useSortedRows(rows, columns);
  return React6.createElement(
    "div",
    null,
    React6.createElement(PageHead, { title: "\u5BA2\u6237\u6863\u6848", sub: "\u516C\u53F8\u4FE1\u606F\u4E0E\u8054\u7CFB\u65B9\u5F0F\uFF0C\u62A5\u4EF7\u4E0E\u8BA2\u5355\u7684\u5173\u8054\u4E3B\u4F53" }),
    React6.createElement(
      "div",
      { className: "twb-toolbar" },
      React6.createElement(TextInput, {
        placeholder: "\u641C\u7D22\u5BA2\u6237\u2026",
        value: q,
        onChange: (e) => setQ(e.target.value),
        style: { minWidth: 240 }
      }),
      React6.createElement(
        "button",
        { className: "twb-btn", onClick: () => setAdding(!adding) },
        adding ? "\u6536\u8D77" : "+ \u65B0\u5BA2\u6237"
      ),
      React6.createElement("span", { className: "spacer" }),
      React6.createElement("span", { className: "twb-muted" }, `\u5171 ${rows.length} \u4F4D\u5BA2\u6237`)
    ),
    adding ? React6.createElement(NewCustomerInline, { onDone: () => {
      setAdding(false);
      reload();
    } }) : null,
    loading ? React6.createElement(TableSkeleton, { rows: 6, cols: 5 }) : React6.createElement(SortableTable, {
      columns,
      rows: sort.sorted,
      sortKey: sort.key,
      asc: sort.asc,
      onSort: sort.toggle,
      onRowClick: (r) => {
        openDrawer("customers", r.id);
        reload();
      },
      empty: React6.createElement(Empty, { title: "\u8FD8\u6CA1\u6709\u5BA2\u6237", desc: "\u624B\u52A8\u65B0\u5EFA\uFF0C\u6216\u4ECE\u300C\u7EBF\u7D22\u6C60\u300D\u628A\u5DF2\u8BC4\u4F30\u7684\u7EBF\u7D22\u8F6C\u4E3A\u5BA2\u6237\u3002" })
    }),
    React6.createElement(Drawer, {
      domain: "customers",
      render: (row, _c, again) => React6.createElement(CustomerForm, { row, saved: again })
    })
  );
}
function CustomerForm(props) {
  const [f, setF] = (0, import_react5.useState)({ ...props.row });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return React6.createElement(
    "div",
    null,
    React6.createElement(
      "div",
      { className: "twb-grid2" },
      F2("\u516C\u53F8\u540D\u79F0", f.name, set("name")),
      F2("\u56FD\u5BB6", f.country, set("country")),
      F2("\u6765\u6E90", f.source, set("source")),
      F2("\u8054\u7CFB\u4EBA", f.contact, set("contact")),
      F2("\u90AE\u7BB1", f.email, set("email")),
      F2("WhatsApp", f.whatsapp, set("whatsapp")),
      F2("\u6807\u7B7E", f.tags, set("tags"))
    ),
    React6.createElement(
      Field,
      { label: "\u5907\u6CE8" },
      React6.createElement(TextArea, { rows: 4, value: f.note ?? "", onChange: set("note") })
    ),
    React6.createElement("button", {
      className: "twb-btn",
      onClick: async () => {
        try {
          await saveRow("customers", f, f.id);
          props.saved();
        } catch (e) {
          toasts.push(e.message);
        }
      }
    }, "\u4FDD\u5B58")
  );
}
function F2(label, value, onChange) {
  return React6.createElement(Field, { label }, React6.createElement(TextInput, { value: String(value ?? ""), onChange }));
}

// src/client/panels/Inquiries.tsx
var React7 = __toESM(require("react"), 1);
var import_react6 = require("react");
var STATUS = [["new", "\u65B0\u8BE2\u76D8"], ["following", "\u8DDF\u8FDB\u4E2D"], ["quoted", "\u5DF2\u62A5\u4EF7"], ["invalid", "\u65E0\u6548"]];
var CN = Object.fromEntries(STATUS);
function tone(s) {
  if (s === "quoted") return "ok";
  if (s === "following") return "warn";
  if (s === "invalid") return "err";
  return void 0;
}
function Inquiries() {
  const [q, setQ] = (0, import_react6.useState)("");
  const { rows, reload } = useList("inquiries", q);
  const [adding, setAdding] = (0, import_react6.useState)(false);
  const open = rows.filter((r) => r.status === "new" || r.status === "following").length;
  return React7.createElement(
    "div",
    null,
    React7.createElement(PageHead, { title: "\u8BE2\u76D8\u7BA1\u7406", sub: "\u6765\u81EA\u5404\u6E20\u9053\u7684\u4E70\u5BB6\u8BE2\u4EF7\u8BB0\u5F55" }),
    React7.createElement(
      "div",
      { className: "twb-toolbar" },
      React7.createElement(TextInput, {
        placeholder: "\u641C\u7D22\u4EA7\u54C1 / \u5185\u5BB9\u2026",
        value: q,
        onChange: (e) => setQ(e.target.value),
        style: { minWidth: 240 }
      }),
      React7.createElement(
        "button",
        { className: "twb-btn", onClick: () => setAdding(!adding) },
        adding ? "\u6536\u8D77" : "+ \u65B0\u8BE2\u76D8"
      ),
      React7.createElement("span", { className: "spacer" }),
      React7.createElement("span", { className: "twb-muted" }, `\u5F85\u5904\u7406 ${open} / \u5171 ${rows.length}`)
    ),
    adding ? React7.createElement(NewInquiry, { onDone: () => {
      setAdding(false);
      reload();
    } }) : null,
    rows.length === 0 ? React7.createElement(Empty, { title: "\u8FD8\u6CA1\u6709\u8BE2\u76D8\u8BB0\u5F55", desc: "\u6536\u5230\u4E70\u5BB6\u8BE2\u4EF7\u540E\u5728\u8FD9\u91CC\u767B\u8BB0\uFF0C\u540E\u7EED\u53EF\u4E00\u952E\u751F\u6210\u62A5\u4EF7\u5355\u3002" }) : React7.createElement(
      Table,
      { head: ["\u4EA7\u54C1", "\u6570\u91CF", "\u6E20\u9053", "\u72B6\u6001", "\u6536\u5230\u65F6\u95F4"] },
      rows.map((r) => React7.createElement(
        "tr",
        {
          key: r.id,
          className: "row",
          onClick: () => {
            openDrawer("inquiries", r.id);
            reload();
          }
        },
        React7.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, r.product || "-"),
        React7.createElement("td", { className: "num" }, String(r.qty ?? 0)),
        React7.createElement("td", null, r.channel || "\u2014"),
        React7.createElement("td", null, React7.createElement(Badge, { tone: tone(r.status) }, CN[r.status] ?? r.status)),
        React7.createElement("td", { className: "mono twb-muted" }, r.received_at || r.created_at || "\u2014")
      ))
    ),
    React7.createElement(Drawer, {
      domain: "inquiries",
      render: (row, _c, again) => React7.createElement(InquiryForm, { row, saved: again })
    })
  );
}
function NewInquiry(props) {
  const [f, setF] = (0, import_react6.useState)({ product: "", qty: 0, channel: "\u963F\u91CC\u56FD\u9645\u7AD9", content: "", status: "new", received_at: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return React7.createElement(
    "div",
    {
      style: {
        padding: 14,
        marginBottom: 16,
        border: "1px solid var(--twb-line)",
        borderRadius: "var(--twb-r)",
        background: "var(--twb-raised)"
      }
    },
    React7.createElement(
      "div",
      { className: "twb-grid3" },
      Fx("\u4EA7\u54C1 *", f.product, set("product")),
      Fx("\u6570\u91CF", f.qty, set("qty")),
      Fx("\u6E20\u9053", f.channel, set("channel")),
      Fx("\u6536\u5230\u65F6\u95F4", f.received_at, set("received_at"))
    ),
    React7.createElement(
      Field,
      { label: "\u8BE2\u76D8\u5185\u5BB9" },
      React7.createElement(TextArea, { rows: 3, value: f.content, onChange: set("content") })
    ),
    React7.createElement("button", {
      className: "twb-btn",
      onClick: async () => {
        try {
          await saveRow("inquiries", { ...f, qty: Number(f.qty) });
          props.onDone();
        } catch (e) {
          toasts.push(e.message);
        }
      }
    }, "\u521B\u5EFA\u8BE2\u76D8")
  );
}
function InquiryForm(props) {
  const [f, setF] = (0, import_react6.useState)({ ...props.row });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return React7.createElement(
    "div",
    null,
    React7.createElement(
      "div",
      { className: "twb-grid2" },
      Fx("\u4EA7\u54C1", f.product, set("product")),
      Fx("\u6570\u91CF", f.qty, set("qty")),
      React7.createElement(
        Field,
        { label: "\u72B6\u6001" },
        React7.createElement(
          Select,
          { value: f.status, onChange: set("status") },
          STATUS.map(([v, l]) => React7.createElement("option", { key: v, value: v }, l))
        )
      ),
      Fx("\u6E20\u9053", f.channel, set("channel"))
    ),
    React7.createElement(
      Field,
      { label: "\u5185\u5BB9" },
      React7.createElement(TextArea, { rows: 5, value: f.content ?? "", onChange: set("content") })
    ),
    React7.createElement(
      "div",
      { className: "twb-toolbar" },
      React7.createElement("button", {
        className: "twb-btn",
        onClick: async () => {
          try {
            await saveRow("inquiries", f, f.id);
            props.saved();
          } catch (e) {
            toasts.push(e.message);
          }
        }
      }, "\u4FDD\u5B58"),
      f.status === "new" ? React7.createElement("button", {
        className: "twb-btn secondary",
        onClick: async () => {
          await saveRow("inquiries", { status: "following" }, f.id);
          props.saved();
        }
      }, "\u6807\u8BB0\u8DDF\u8FDB") : null
    ),
    React7.createElement(AiDraft, {
      title: "\u8BE2\u76D8 #" + f.id,
      context: `\u4EA7\u54C1 ${f.product}\uFF0C\u6570\u91CF ${f.qty}\uFF0C\u6E20\u9053 ${f.channel}\u3002\u8BE2\u76D8\u5185\u5BB9\uFF1A${f.content}`
    })
  );
}
function Fx(label, value, onChange) {
  return React7.createElement(Field, { label }, React7.createElement(TextInput, { value: String(value ?? ""), onChange }));
}

// src/client/panels/Quotes.tsx
var React8 = __toESM(require("react"), 1);
var import_react7 = require("react");
function Quotes() {
  const [q, setQ] = (0, import_react7.useState)("");
  const { rows, reload, loading } = useList("quotes", q);
  const [adding, setAdding] = (0, import_react7.useState)(false);
  const columns = [
    {
      label: "\u5355\u53F7",
      get: (r) => r.no,
      width: 150,
      render: (r) => React8.createElement("span", { className: "mono", style: { color: "var(--twb-fg)", fontWeight: 550 } }, r.no)
    },
    {
      label: "\u5BA2\u6237",
      get: (r) => r.customer_id,
      width: 90,
      render: (r) => React8.createElement("span", { className: "twb-muted" }, "#" + (r.customer_id ?? "-"))
    },
    {
      label: "\u91D1\u989D",
      num: true,
      width: 140,
      get: (r) => quoteTotal({ items: r.items ?? [] }).totalCents,
      render: (r) => money(quoteTotal({ items: r.items ?? [] }).totalCents, r.currency)
    },
    {
      label: "\u6BDB\u5229\u7387",
      width: 96,
      get: (r) => quoteTotal({ items: r.items ?? [] }).marginRate,
      render: (r) => {
        const t = quoteTotal({ items: r.items ?? [] });
        return React8.createElement(
          Badge,
          { tone: t.marginRate >= 0.2 ? "ok" : t.marginRate >= 0.1 ? "warn" : "err" },
          (t.marginRate * 100).toFixed(1) + "%"
        );
      }
    },
    {
      label: "\u72B6\u6001",
      get: (r) => r.status,
      width: 96,
      render: (r) => React8.createElement(Badge, {
        plain: true,
        tone: r.status === "won" ? "ok" : r.status === "lost" ? "err" : void 0
      }, r.status === "won" ? "\u5DF2\u6210\u5355" : r.status === "lost" ? "\u5DF2\u5931\u5355" : r.status === "sent" ? "\u5DF2\u53D1\u9001" : "\u8349\u7A3F")
    },
    {
      label: "",
      width: 52,
      render: (r) => React8.createElement("button", {
        className: "twb-btn ghost sm",
        onClick: (e) => {
          e.stopPropagation();
          window.open(api.piUrl(r.id), "_blank");
        }
      }, "PI")
    }
  ];
  const sort = useSortedRows(rows, columns);
  return React8.createElement(
    "div",
    null,
    React8.createElement(PageHead, { title: "\u62A5\u4EF7 / PI", sub: "\u6309\u660E\u7EC6\u62A5\u4EF7\uFF0C\u5B9E\u65F6\u7B97\u6BDB\u5229\uFF0C\u53EF\u4E00\u952E\u8F6C\u8BA2\u5355" }),
    React8.createElement(
      "div",
      { className: "twb-toolbar" },
      React8.createElement(TextInput, {
        placeholder: "\u641C\u7D22\u5355\u53F7\u2026",
        value: q,
        onChange: (e) => setQ(e.target.value),
        style: { minWidth: 240 }
      }),
      React8.createElement(
        "button",
        { className: "twb-btn", onClick: () => setAdding(!adding) },
        adding ? "\u6536\u8D77" : "+ \u65B0\u62A5\u4EF7"
      ),
      React8.createElement("span", { className: "spacer" }),
      React8.createElement("span", { className: "twb-muted" }, `\u5171 ${rows.length} \u4EFD`)
    ),
    adding ? React8.createElement(NewQuote, { onDone: () => {
      setAdding(false);
      reload();
    } }) : null,
    loading ? React8.createElement(TableSkeleton, { rows: 6, cols: 6 }) : React8.createElement(SortableTable, {
      columns,
      rows: sort.sorted,
      sortKey: sort.key,
      asc: sort.asc,
      onSort: sort.toggle,
      onRowClick: (r) => {
        openDrawer("quotes", r.id);
        reload();
      },
      empty: React8.createElement(Empty, { title: "\u8FD8\u6CA1\u6709\u62A5\u4EF7\u5355", desc: "\u65B0\u5EFA\u62A5\u4EF7\u540E\u586B\u5199\u660E\u7EC6\uFF0C\u7CFB\u7EDF\u81EA\u52A8\u7B97\u5408\u8BA1\u4E0E\u6BDB\u5229\u7387\uFF0C\u5E76\u53EF\u5BFC\u51FA PI \u6216\u8F6C\u8BA2\u5355\u3002" })
    }),
    React8.createElement(Drawer, {
      domain: "quotes",
      render: (row, _c, again) => React8.createElement(QuoteForm, { row, saved: again })
    })
  );
}
function NewQuote(props) {
  const [no, setNo] = (0, import_react7.useState)("Q" + Date.now().toString().slice(-8));
  const [cid, setCid] = (0, import_react7.useState)(0);
  const [customers, setCustomers] = (0, import_react7.useState)([]);
  (0, import_react7.useEffect)(() => {
    api.list("customers", "").then((r) => {
      const list = Array.isArray(r) ? r : [];
      setCustomers(list);
      if (!cid && list.length) setCid(list[0].id);
    }).catch(() => {
    });
  }, []);
  return React8.createElement(
    "div",
    {
      style: {
        padding: 14,
        marginBottom: 16,
        border: "1px solid var(--twb-line)",
        borderRadius: "var(--twb-r)",
        background: "var(--twb-raised)"
      }
    },
    React8.createElement(
      "div",
      { className: "twb-grid2" },
      React8.createElement(
        Field,
        { label: "\u62A5\u4EF7\u5355\u53F7" },
        React8.createElement(TextInput, { value: no, onChange: (e) => setNo(e.target.value) })
      ),
      React8.createElement(
        Field,
        {
          label: "\u5BA2\u6237",
          hint: customers.length ? void 0 : "\u8FD8\u6CA1\u6709\u5BA2\u6237\u6863\u6848\uFF0C\u5148\u53BB\u300C\u5BA2\u6237\u300D\u9875\u65B0\u5EFA"
        },
        React8.createElement(
          Select,
          {
            value: String(cid || ""),
            onChange: (e) => setCid(Number(e.target.value) || 0)
          },
          customers.length === 0 ? React8.createElement("option", { value: "0" }, "\uFF08\u65E0\u5BA2\u6237\uFF09") : customers.map((c) => React8.createElement(
            "option",
            { key: c.id, value: String(c.id) },
            `${c.name || "\u672A\u547D\u540D"} #${c.id}${c.country ? " \xB7 " + c.country : ""}`
          ))
        )
      )
    ),
    React8.createElement("button", {
      className: "twb-btn",
      onClick: async () => {
        try {
          await saveRow("quotes", {
            no,
            customer_id: cid,
            currency: "USD",
            fx_rate: 1,
            items: [{ name: "", qty: 0, price: 0, cost: 0 }],
            validity_days: 30,
            status: "draft"
          });
          props.onDone();
        } catch (e) {
          toasts.push(e.message);
        }
      }
    }, "\u521B\u5EFA\u62A5\u4EF7")
  );
}
function QuoteForm(props) {
  const [f, setF] = (0, import_react7.useState)({ ...props.row });
  const items = Array.isArray(f.items) ? f.items : [];
  const t = quoteTotal({ items });
  const setItem = (i, k, v) => {
    const next = items.map((it, j) => j === i ? { ...it, [k]: k === "name" ? v : Number(v) || 0 } : it);
    setF({ ...f, items: next });
  };
  const cellInput = (i, k, value, width) => React8.createElement(TextInput, {
    style: { width, minWidth: width, fontFamily: k === "name" ? "inherit" : "var(--twb-mono)" },
    value: String(value ?? ""),
    onChange: (e) => setItem(i, k, e.target.value)
  });
  return React8.createElement(
    "div",
    null,
    React8.createElement(
      "div",
      { className: "twb-cards", style: { marginBottom: 18 } },
      React8.createElement(
        "div",
        { className: "twb-card" },
        React8.createElement("div", { className: "k" }, "\u5408\u8BA1"),
        React8.createElement("div", { className: "v" }, money(t.totalCents, f.currency))
      ),
      React8.createElement(
        "div",
        { className: "twb-card tone-ok" },
        React8.createElement("div", { className: "k" }, "\u6BDB\u5229"),
        React8.createElement("div", { className: "v" }, money(t.marginCents, f.currency))
      ),
      React8.createElement(
        "div",
        { className: "twb-card" + (t.marginRate >= 0.2 ? " tone-ok" : t.marginRate >= 0.1 ? " tone-warn" : " tone-err") },
        React8.createElement("div", { className: "k" }, "\u6BDB\u5229\u7387"),
        React8.createElement("div", { className: "v" }, (t.marginRate * 100).toFixed(1) + "%")
      )
    ),
    React8.createElement("div", { className: "twb-section" }, "\u62A5\u4EF7\u53C2\u6570"),
    React8.createElement(
      "div",
      { className: "twb-grid3" },
      React8.createElement(
        Field,
        { label: "\u5E01\u79CD" },
        React8.createElement(TextInput, { value: f.currency ?? "USD", onChange: (e) => setF({ ...f, currency: e.target.value }) })
      ),
      React8.createElement(
        Field,
        { label: "\u6C47\u7387\uFF08\u5BF9\u4EBA\u6C11\u5E01\uFF09" },
        React8.createElement(TextInput, { value: String(f.fx_rate ?? 1), onChange: (e) => setF({ ...f, fx_rate: Number(e.target.value) || 1 }) })
      ),
      React8.createElement(
        Field,
        { label: "\u6709\u6548\u671F\uFF08\u5929\uFF09" },
        React8.createElement(TextInput, { value: String(f.validity_days ?? 30), onChange: (e) => setF({ ...f, validity_days: Number(e.target.value) || 30 }) })
      ),
      React8.createElement(
        Field,
        { label: "\u72B6\u6001" },
        React8.createElement(
          Select,
          { value: f.status ?? "draft", onChange: (e) => setF({ ...f, status: e.target.value }) },
          [["draft", "\u8349\u7A3F"], ["sent", "\u5DF2\u53D1\u9001"], ["won", "\u5DF2\u6210\u5355"], ["lost", "\u5DF2\u5931\u5355"]].map(([v, l]) => React8.createElement("option", { key: v, value: v }, l))
        )
      )
    ),
    React8.createElement("div", { className: "twb-section" }, "\u660E\u7EC6"),
    React8.createElement(
      "div",
      { className: "twb-table-wrap" },
      React8.createElement(
        "table",
        { className: "twb-table" },
        React8.createElement("thead", null, React8.createElement(
          "tr",
          null,
          ["\u54C1\u540D", "\u6570\u91CF", "\u5355\u4EF7", "\u6210\u672C", "\u91D1\u989D", ""].map((h, i) => React8.createElement("th", { key: i }, h))
        )),
        React8.createElement(
          "tbody",
          null,
          items.map((it, i) => React8.createElement(
            "tr",
            { key: i },
            React8.createElement("td", null, cellInput(i, "name", it.name, 200)),
            React8.createElement("td", null, cellInput(i, "qty", it.qty, 76)),
            React8.createElement("td", null, cellInput(i, "price", it.price, 88)),
            React8.createElement("td", null, cellInput(i, "cost", it.cost, 88)),
            React8.createElement("td", { className: "num", style: { color: "var(--twb-fg)" } }, money(it.qty * it.price * 100, f.currency)),
            React8.createElement(
              "td",
              { style: { width: 44, textAlign: "right" } },
              React8.createElement("button", {
                className: "twb-btn ghost sm",
                onClick: () => setF({ ...f, items: items.filter((_, j) => j !== i) })
              }, "\xD7")
            )
          ))
        )
      )
    ),
    React8.createElement(
      "div",
      { className: "twb-toolbar", style: { marginTop: 12 } },
      React8.createElement("button", {
        className: "twb-btn secondary sm",
        onClick: () => setF({ ...f, items: [...items, { name: "", qty: 0, price: 0, cost: 0 }] })
      }, "+ \u660E\u7EC6\u884C")
    ),
    React8.createElement(
      Field,
      { label: "\u5907\u6CE8 / \u6761\u6B3E" },
      React8.createElement(TextArea, { rows: 3, value: f.note ?? "", onChange: (e) => setF({ ...f, note: e.target.value }) })
    ),
    React8.createElement(
      "div",
      { className: "twb-toolbar" },
      React8.createElement("button", {
        className: "twb-btn",
        onClick: async () => {
          try {
            await saveRow("quotes", f, f.id);
            props.saved();
          } catch (e) {
            toasts.push(e.message);
          }
        }
      }, "\u4FDD\u5B58"),
      React8.createElement("button", {
        className: "twb-btn secondary",
        onClick: () => window.open(api.piUrl(f.id), "_blank")
      }, "\u5BFC\u51FA PI / \u6253\u5370"),
      f.status !== "won" ? React8.createElement("button", {
        className: "twb-btn secondary",
        onClick: async () => {
          try {
            const o = await api.toOrder(f.id);
            toasts.push("\u5DF2\u8F6C\u8BA2\u5355 " + o.no, "ok");
            props.saved();
          } catch (e) {
            toasts.push(e.message);
          }
        }
      }, "\u8F6C\u8BA2\u5355") : null
    )
  );
}

// src/client/panels/Orders.tsx
var React9 = __toESM(require("react"), 1);
var import_react8 = require("react");
var STAGE_CN2 = {
  inquiry: "\u8BE2\u76D8",
  quote: "\u62A5\u4EF7",
  pi: "PI/\u5408\u540C",
  production: "\u751F\u4EA7",
  booking: "\u8BA2\u8231",
  customs: "\u62A5\u5173",
  shipped: "\u51FA\u8FD0",
  receipt: "\u6536\u6B3E",
  closed: "\u7ED3\u6848"
};
var DONE_STAGES = ["shipped", "receipt", "closed"];
function Orders() {
  const [q, setQ] = (0, import_react8.useState)("");
  const { rows, reload, loading } = useList("orders", q);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const overdue = rows.filter((r) => r.delivery_date && r.delivery_date < today && !DONE_STAGES.includes(r.stage)).length;
  const total = rows.reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  const columns = [
    {
      label: "\u8BA2\u5355\u53F7",
      get: (r) => r.no,
      width: 150,
      render: (r) => React9.createElement("span", { className: "mono", style: { color: "var(--twb-fg)", fontWeight: 550 } }, r.no)
    },
    {
      label: "\u5BA2\u6237",
      get: (r) => r.customer_id,
      width: 80,
      render: (r) => React9.createElement("span", { className: "twb-muted" }, "#" + (r.customer_id ?? "-"))
    },
    {
      label: "\u91D1\u989D",
      num: true,
      width: 140,
      get: (r) => r.amount_cents,
      render: (r) => money(r.amount_cents, r.currency)
    },
    {
      label: "\u7B7E\u7EA6",
      get: (r) => r.sign_date,
      width: 110,
      render: (r) => React9.createElement("span", { className: "mono twb-muted" }, r.sign_date || "\u2014")
    },
    {
      label: "\u4EA4\u671F",
      get: (r) => r.delivery_date,
      width: 150,
      render: (r) => {
        const isOverdue = r.delivery_date && r.delivery_date < today && !DONE_STAGES.includes(r.stage);
        const soon = r.delivery_date && !isOverdue && r.delivery_date <= today.slice(0, 8) + String(Number(today.slice(8, 10)) + 7).padStart(2, "0") && r.stage !== "closed";
        return React9.createElement(
          "span",
          { className: "mono" },
          r.delivery_date || "\u2014",
          isOverdue ? React9.createElement(Badge, { tone: "err" }, "\u903E\u671F") : soon ? React9.createElement(Badge, { tone: "warn" }, "\u4E34\u8FD1") : null
        );
      }
    },
    {
      label: "\u9636\u6BB5",
      get: (r) => r.stage,
      width: 100,
      render: (r) => React9.createElement(Badge, {
        plain: true,
        tone: r.stage === "closed" ? "ok" : void 0
      }, STAGE_CN2[r.stage] ?? r.stage)
    }
  ];
  const sort = useSortedRows(rows, columns);
  return React9.createElement(
    "div",
    null,
    React9.createElement(PageHead, { title: "\u8BA2\u5355\u5C65\u7EA6", sub: "PI/\u5408\u540C \u2192 \u751F\u4EA7 \u2192 \u8BA2\u8231 \u2192 \u62A5\u5173 \u2192 \u51FA\u8FD0 \u2192 \u6536\u6B3E \u2192 \u7ED3\u6848" }),
    React9.createElement(
      "div",
      { className: "twb-toolbar" },
      React9.createElement(TextInput, {
        placeholder: "\u641C\u7D22\u8BA2\u5355\u53F7\u2026",
        value: q,
        onChange: (e) => setQ(e.target.value),
        style: { minWidth: 240 }
      }),
      React9.createElement("span", { className: "spacer" }),
      overdue > 0 ? React9.createElement(Badge, { tone: "err" }, `${overdue} \u5355\u903E\u671F`) : null,
      React9.createElement("span", { className: "twb-muted" }, `\u5171 ${rows.length} \u5355 \xB7 ${moneyShort(total)}`)
    ),
    loading ? React9.createElement(TableSkeleton, { rows: 6, cols: 6 }) : React9.createElement(SortableTable, {
      columns,
      rows: sort.sorted,
      sortKey: sort.key,
      asc: sort.asc,
      onSort: sort.toggle,
      onRowClick: (r) => {
        openDrawer("orders", r.id);
        reload();
      },
      empty: React9.createElement(Empty, { title: "\u8FD8\u6CA1\u6709\u8BA2\u5355", desc: "\u4ECE\u300C\u62A5\u4EF7/PI\u300D\u6253\u5F00\u4E00\u4EFD\u62A5\u4EF7\uFF0C\u70B9\u300C\u8F6C\u8BA2\u5355\u300D\u5373\u53EF\u751F\u6210\u3002" })
    }),
    React9.createElement(Drawer, {
      domain: "orders",
      render: (row, _c, again) => React9.createElement(OrderForm, { row, saved: again })
    })
  );
}
function OrderForm(props) {
  const [f, setF] = (0, import_react8.useState)({ ...props.row });
  const [balance, setBalance] = (0, import_react8.useState)(null);
  (0, import_react8.useState)(() => {
    api.balance(f.id).then(setBalance).catch(() => {
    });
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const progress = Array.isArray(f.progress) && f.progress.length ? f.progress : STAGES.map((s) => ({ stage: s, done: false, at: "" }));
  const mark = (i) => async () => {
    const next = progress.map((p, j) => j === i ? { ...p, done: !p.done, at: p.done ? "" : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) } : p);
    const lastDone = next.map((p, j) => p.done ? j : -1).filter((j) => j >= 0).pop() ?? 0;
    const stage = STAGES[lastDone];
    setF({ ...f, progress: next, stage });
    try {
      await saveRow("orders", { progress: next, stage }, f.id);
      props.saved();
    } catch (e) {
      toasts.push(e.message);
    }
  };
  const doneCount = progress.filter((p) => p.done).length;
  const ratio = progress.length ? doneCount / progress.length : 0;
  return React9.createElement(
    "div",
    null,
    React9.createElement(
      "div",
      { className: "twb-cards", style: { marginBottom: 18 } },
      React9.createElement(
        "div",
        { className: "twb-card" },
        React9.createElement("div", { className: "k" }, "\u8BA2\u5355\u91D1\u989D"),
        React9.createElement("div", { className: "v" }, money(f.amount_cents ?? 0, f.currency))
      ),
      React9.createElement(
        "div",
        { className: "twb-card" },
        React9.createElement("div", { className: "k" }, "\u5F53\u524D\u9636\u6BB5"),
        React9.createElement("div", { className: "v", style: { fontSize: 15, fontFamily: "inherit" } }, STAGE_CN2[f.stage] ?? f.stage)
      ),
      React9.createElement(
        "div",
        { className: "twb-card" + (balance && balance.dueCents > 0 ? " tone-warn" : " tone-ok") },
        React9.createElement("div", { className: "k" }, "\u672A\u6536\u6C47"),
        React9.createElement(
          "div",
          { className: "v", style: { fontSize: 15 } },
          balance ? money(balance.dueCents, f.currency) : "\u2026"
        )
      )
    ),
    React9.createElement("div", { className: "twb-section" }, "\u5C65\u7EA6\u8FDB\u5EA6"),
    React9.createElement(
      "div",
      { className: "twb-bar-track", style: { marginBottom: 12 } },
      React9.createElement("div", { className: "twb-bar", style: { width: Math.max(2, ratio * 100) + "%" } })
    ),
    React9.createElement(
      "div",
      { className: "twb-steps" },
      progress.map((p, i) => React9.createElement("button", {
        key: p.stage,
        className: "twb-step" + (p.done ? " done" : ""),
        onClick: mark(i),
        title: p.at || "\u672A\u5B8C\u6210"
      }, STAGE_CN2[p.stage] ?? p.stage))
    ),
    React9.createElement("div", { className: "twb-section" }, "\u5173\u952E\u65E5\u671F"),
    React9.createElement(
      "div",
      { className: "twb-grid2" },
      React9.createElement(
        Field,
        { label: "\u7B7E\u7EA6\u65E5\u671F" },
        React9.createElement(TextInput, { value: f.sign_date ?? "", onChange: set("sign_date") })
      ),
      React9.createElement(
        Field,
        { label: "\u4EA4\u8D27\u65E5\u671F" },
        React9.createElement(TextInput, { value: f.delivery_date ?? "", onChange: set("delivery_date") })
      )
    ),
    balance ? React9.createElement(
      "div",
      { className: "twb-muted", style: { marginBottom: 12 } },
      "\u5DF2\u6536 " + money(balance.paidCents, f.currency) + "\u3000\xB7\u3000\u5E94\u6536 " + money(balance.dueCents, f.currency)
    ) : null,
    React9.createElement(
      Field,
      { label: "\u5907\u6CE8" },
      React9.createElement(TextArea, { rows: 3, value: f.note ?? "", onChange: set("note") })
    ),
    React9.createElement(
      "div",
      { className: "twb-toolbar" },
      React9.createElement("button", {
        className: "twb-btn",
        onClick: async () => {
          try {
            await saveRow("orders", { sign_date: f.sign_date, delivery_date: f.delivery_date, note: f.note }, f.id);
            props.saved();
          } catch (e) {
            toasts.push(e.message);
          }
        }
      }, "\u4FDD\u5B58"),
      React9.createElement("button", {
        className: "twb-btn secondary",
        onClick: () => openDrawer("shipments", f.id)
      }, "\u67E5\u770B\u7269\u6D41")
    ),
    React9.createElement(AiDraft, {
      title: "\u8BA2\u5355 " + f.no,
      context: `\u8BA2\u5355 ${f.no}\uFF0C\u91D1\u989D ${f.amount_cents / 100} ${f.currency}\uFF0C\u7B7E\u7EA6 ${f.sign_date}\uFF0C\u4EA4\u671F ${f.delivery_date}\uFF0C\u5F53\u524D\u9636\u6BB5 ${STAGE_CN2[f.stage] ?? f.stage}\u3002\u8FDB\u5EA6\u8282\u70B9\uFF1A${JSON.stringify(progress)}`
    })
  );
}

// src/client/panels/Logistics.tsx
var React10 = __toESM(require("react"), 1);
var import_react9 = require("react");
var SHIP_FIELDS = [
  ["booking_no", "\u8BA2\u8231\u53F7"],
  ["vessel", "\u8239\u540D/\u822A\u6B21"],
  ["etd", "ETD"],
  ["ata", "ATA"],
  ["container", "\u67DC\u53F7"],
  ["bl_no", "\u63D0\u5355\u53F7"],
  ["customs_status", "\u62A5\u5173\u72B6\u6001"]
];
function Logistics() {
  const [q, setQ] = (0, import_react9.useState)("");
  const { rows, reload } = useList("shipments", q);
  const [adding, setAdding] = (0, import_react9.useState)(false);
  return React10.createElement(
    "div",
    null,
    React10.createElement(PageHead, { title: "\u7269\u6D41\u5355\u8BC1", sub: "\u8BA2\u8231\u3001\u8239\u671F\u3001\u67DC\u53F7\u3001\u63D0\u5355\u4E0E\u62A5\u5173\u72B6\u6001" }),
    React10.createElement(
      "div",
      { className: "twb-toolbar" },
      React10.createElement(TextInput, {
        placeholder: "\u641C\u7D22\u8BA2\u8231\u53F7 / \u63D0\u5355\u53F7\u2026",
        value: q,
        onChange: (e) => setQ(e.target.value),
        style: { minWidth: 240 }
      }),
      React10.createElement(
        "button",
        { className: "twb-btn", onClick: () => setAdding(!adding) },
        adding ? "\u6536\u8D77" : "+ \u65B0\u8BA2\u8231"
      ),
      React10.createElement("span", { className: "spacer" }),
      React10.createElement("span", { className: "twb-muted" }, `\u5171 ${rows.length} \u7968`)
    ),
    adding ? React10.createElement(NewShipment, { onDone: () => {
      setAdding(false);
      reload();
    } }) : null,
    rows.length === 0 ? React10.createElement(Empty, { title: "\u8FD8\u6CA1\u6709\u51FA\u8FD0\u8BB0\u5F55", desc: "\u8BA2\u5355\u8FDB\u5165\u8BA2\u8231\u9636\u6BB5\u540E\uFF0C\u5728\u8FD9\u91CC\u767B\u8BB0\u8BA2\u8231\u53F7\u3001\u8239\u671F\u4E0E\u67DC\u53F7\u3002" }) : React10.createElement(
      Table,
      { head: ["\u8BA2\u5355", "\u8BA2\u8231\u53F7", "\u8239\u540D/\u822A\u6B21", "ETD", "\u67DC\u53F7", "\u63D0\u5355\u53F7", "\u62A5\u5173"] },
      rows.map((r) => React10.createElement(
        "tr",
        {
          key: r.id,
          className: "row",
          onClick: () => {
            openDrawer("shipments", r.id);
            reload();
          }
        },
        React10.createElement("td", { className: "twb-muted" }, "#" + r.order_id),
        React10.createElement("td", { className: "mono" }, r.booking_no || "\u2014"),
        React10.createElement("td", null, r.vessel || "\u2014"),
        React10.createElement("td", { className: "mono" }, r.etd || "\u2014"),
        React10.createElement("td", { className: "mono" }, r.container || "\u2014"),
        React10.createElement("td", { className: "mono" }, r.bl_no || "\u2014"),
        React10.createElement(
          "td",
          null,
          r.customs_status ? React10.createElement(Badge, { plain: true, tone: r.customs_status.includes("\u5DF2") ? "ok" : void 0 }, r.customs_status) : "\u2014"
        )
      ))
    ),
    React10.createElement(
      Section,
      { title: "\u5DF2\u4E0A\u4F20\u5355\u8BC1" },
      React10.createElement(Docs, null)
    ),
    React10.createElement(Drawer, {
      domain: "shipments",
      render: (row, _c, again) => React10.createElement(ShipmentForm, { row, saved: again })
    })
  );
}
function NewShipment(props) {
  const [f, setF] = (0, import_react9.useState)({
    order_id: 0,
    booking_no: "",
    vessel: "",
    etd: "",
    ata: "",
    container: "",
    bl_no: "",
    customs_status: "\u672A\u7533\u62A5",
    note: ""
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return React10.createElement(
    "div",
    {
      style: {
        padding: 14,
        marginBottom: 16,
        border: "1px solid var(--twb-line)",
        borderRadius: "var(--twb-r)",
        background: "var(--twb-raised)"
      }
    },
    React10.createElement(
      "div",
      { className: "twb-grid3" },
      React10.createElement(
        Field,
        { label: "\u8BA2\u5355 ID *" },
        React10.createElement(TextInput, { value: String(f.order_id || ""), onChange: set("order_id") })
      ),
      SHIP_FIELDS.slice(0, 5).map(([k, label]) => React10.createElement(
        Field,
        { key: k, label },
        React10.createElement(TextInput, { value: String(f[k] ?? ""), onChange: set(k) })
      ))
    ),
    React10.createElement("button", {
      className: "twb-btn",
      onClick: async () => {
        try {
          await saveRow("shipments", { ...f, order_id: Number(f.order_id) });
          props.onDone();
        } catch (e) {
          toasts.push(e.message);
        }
      }
    }, "\u521B\u5EFA")
  );
}
function ShipmentForm(props) {
  const [f, setF] = (0, import_react9.useState)({ ...props.row });
  const [file, setFile] = (0, import_react9.useState)(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return React10.createElement(
    "div",
    null,
    React10.createElement(
      "div",
      { className: "twb-grid2" },
      SHIP_FIELDS.map(([k, label]) => React10.createElement(
        Field,
        { key: k, label },
        React10.createElement(TextInput, { value: String(f[k] ?? ""), onChange: set(k) })
      ))
    ),
    React10.createElement("button", {
      className: "twb-btn",
      onClick: async () => {
        try {
          await saveRow("shipments", f, f.id);
          props.saved();
        } catch (e) {
          toasts.push(e.message);
        }
      }
    }, "\u4FDD\u5B58"),
    React10.createElement(
      Section,
      { title: "\u4E0A\u4F20\u5355\u8BC1" },
      React10.createElement(
        Field,
        { label: "\u6587\u4EF6" },
        React10.createElement("input", {
          type: "file",
          style: { fontSize: 12, color: "var(--twb-fg-2)" },
          onChange: (e) => setFile(e.target.files?.[0] ?? null)
        })
      ),
      React10.createElement(
        Field,
        { label: "\u7C7B\u578B" },
        React10.createElement(TextInput, {
          value: f.doc_kind ?? "packing_list",
          onChange: (e) => setF({ ...f, doc_kind: e.target.value })
        }),
        "\u5982 packing_list / invoice / bill_of_lading"
      ),
      React10.createElement("button", {
        className: "twb-btn secondary",
        disabled: !file,
        onClick: async () => {
          if (!file) return;
          const form = new FormData();
          form.append("order_id", String(f.order_id));
          form.append("kind", f.doc_kind ?? "other");
          form.append("note", f.doc_note ?? "");
          form.append("file", file, file.name);
          try {
            await api.upload(form);
            toasts.push("\u5355\u8BC1\u5DF2\u4E0A\u4F20", "ok");
          } catch (e) {
            toasts.push(e.message);
          }
        }
      }, "\u4E0A\u4F20")
    )
  );
}
function Docs() {
  const { rows } = useList("documents", "");
  if (rows.length === 0) {
    return React10.createElement(
      "div",
      { className: "twb-muted", style: { padding: "10px 0" } },
      "\u8FD8\u6CA1\u6709\u4E0A\u4F20\u5355\u8BC1\u3002\u6253\u5F00\u67D0\u6761\u51FA\u8FD0\u8BB0\u5F55\u7684\u62BD\u5C49\u5373\u53EF\u4E0A\u4F20\u3002"
    );
  }
  return React10.createElement(
    Table,
    { head: ["\u8BA2\u5355", "\u7C7B\u578B", "\u6587\u4EF6", "\u65F6\u95F4"] },
    rows.map((r) => React10.createElement(
      "tr",
      { key: r.id },
      React10.createElement("td", { className: "twb-muted" }, "#" + r.order_id),
      React10.createElement("td", null, React10.createElement(Badge, { plain: true }, r.kind)),
      React10.createElement(
        "td",
        null,
        React10.createElement("a", {
          href: api.fileUrl(r.file),
          target: "_blank",
          rel: "noreferrer",
          style: { color: "var(--twb-accent)" }
        }, r.file)
      ),
      React10.createElement("td", { className: "mono twb-muted" }, r.created_at)
    ))
  );
}

// src/client/panels/Receipts.tsx
var React11 = __toESM(require("react"), 1);
var import_react10 = require("react");
function Receipts() {
  const [q, setQ] = (0, import_react10.useState)("");
  const { rows, reload } = useList("receipts", q);
  const [adding, setAdding] = (0, import_react10.useState)(false);
  const income = rows.filter((r) => r.type !== "\u8D39\u7528").reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  const expense = rows.filter((r) => r.type === "\u8D39\u7528").reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  return React11.createElement(
    "div",
    null,
    React11.createElement(PageHead, { title: "\u6536\u6C47\u5BF9\u8D26", sub: "\u5B9A\u91D1\u4E0E\u5C3E\u6B3E\u767B\u8BB0\uFF0C\u81EA\u52A8\u7B97\u6BCF\u5355\u5E94\u6536\u4E0E\u8D26\u9F84" }),
    React11.createElement(
      "div",
      { className: "twb-toolbar" },
      React11.createElement(TextInput, {
        placeholder: "\u641C\u7D22\u6C34\u5355\u53F7\u2026",
        value: q,
        onChange: (e) => setQ(e.target.value),
        style: { minWidth: 240 }
      }),
      React11.createElement(
        "button",
        { className: "twb-btn", onClick: () => setAdding(!adding) },
        adding ? "\u6536\u8D77" : "+ \u767B\u8BB0\u6536\u6B3E"
      ),
      React11.createElement("span", { className: "spacer" }),
      React11.createElement(
        "span",
        { className: "twb-muted" },
        `\u5B9E\u6536 ${moneyShort(income)}${expense ? " \xB7 \u8D39\u7528 " + moneyShort(expense) : ""}`
      )
    ),
    adding ? React11.createElement(NewReceipt, { onDone: () => {
      setAdding(false);
      reload();
    } }) : null,
    rows.length === 0 ? React11.createElement(Empty, { title: "\u8FD8\u6CA1\u6709\u6536\u6B3E\u8BB0\u5F55", desc: "\u6536\u5230\u5B9A\u91D1\u6216\u5C3E\u6B3E\u540E\u5728\u8FD9\u91CC\u767B\u8BB0\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u66F4\u65B0\u8BA2\u5355\u5E94\u6536\u4F59\u989D\u3002" }) : React11.createElement(
      Table,
      { head: ["\u8BA2\u5355", "\u7C7B\u578B", "\u91D1\u989D", "\u5E01\u79CD", "\u5230\u8D26\u65E5", "\u6C34\u5355\u53F7", ""] },
      rows.map((r) => React11.createElement(
        "tr",
        { key: r.id },
        React11.createElement("td", { className: "twb-muted" }, "#" + r.order_id),
        React11.createElement(
          "td",
          null,
          React11.createElement(Badge, { plain: true, tone: r.type === "\u5C3E\u6B3E" ? "ok" : r.type === "\u8D39\u7528" ? "err" : void 0 }, r.type)
        ),
        React11.createElement("td", { className: "num", style: { color: "var(--twb-fg)" } }, money(r.amount_cents, r.currency)),
        React11.createElement("td", { className: "mono twb-muted" }, r.currency),
        React11.createElement("td", { className: "mono" }, r.date || "\u2014"),
        React11.createElement("td", { className: "mono twb-muted" }, r.bank_ref || "\u2014"),
        React11.createElement(
          "td",
          { style: { width: 52, textAlign: "right" } },
          React11.createElement("button", {
            className: "twb-btn ghost sm",
            onClick: async () => {
              if (!confirm("\u5220\u9664\u8BE5\u6536\u6B3E\u8BB0\u5F55\uFF1F")) return;
              try {
                await api.remove("receipts", r.id);
                toasts.push("\u5DF2\u5220\u9664", "ok");
                reload();
              } catch (e) {
                toasts.push(e.message);
              }
            }
          }, "\u5220\u9664")
        )
      ))
    ),
    React11.createElement(
      Section,
      { title: "\u5E94\u6536\u5BF9\u8D26\uFF08\u672A\u7ED3\u6848\u8BA2\u5355\uFF09" },
      React11.createElement(OrderBalances, null)
    )
  );
}
function OrderBalances() {
  const { rows } = useList("orders", "");
  const [map, setMap] = (0, import_react10.useState)({});
  (0, import_react10.useState)(() => {
    for (const o of rows) {
      if (o.stage !== "closed") {
        api.balance(o.id).then((b) => setMap((m) => ({ ...m, [o.id]: b }))).catch(() => {
        });
      }
    }
  });
  const open = rows.filter((o) => o.stage !== "closed");
  if (open.length === 0) {
    return React11.createElement("div", { className: "twb-muted", style: { padding: "10px 0" } }, "\u6240\u6709\u8BA2\u5355\u5747\u5DF2\u7ED3\u6848\uFF0C\u65E0\u5E94\u6536\u6B3E\u9879\u3002");
  }
  return React11.createElement(
    Table,
    { head: ["\u8BA2\u5355", "\u5E94\u6536", "\u5DF2\u6536", "\u672A\u6536", "\u8D26\u9F84"] },
    open.map((o) => {
      const b = map[o.id];
      const age = b && b.dueCents > 0 && o.delivery_date ? Math.max(0, Math.floor((Date.now() - new Date(o.delivery_date).getTime()) / 864e5)) : null;
      return React11.createElement(
        "tr",
        { key: o.id },
        React11.createElement("td", { className: "mono", style: { color: "var(--twb-fg)", fontWeight: 550 } }, o.no),
        React11.createElement("td", { className: "num" }, money(o.amount_cents, o.currency)),
        React11.createElement("td", { className: "num twb-muted" }, b ? money(b.paidCents, o.currency) : "\u2026"),
        React11.createElement(
          "td",
          { className: "num" },
          b ? React11.createElement(
            Badge,
            { tone: b.dueCents > 0 ? age != null && age > 60 ? "err" : "warn" : "ok" },
            money(b.dueCents, o.currency)
          ) : "\u2026"
        ),
        React11.createElement("td", { className: "mono" }, age != null ? age + " \u5929" : "\u2014")
      );
    })
  );
}
function NewReceipt(props) {
  const [f, setF] = (0, import_react10.useState)({
    order_id: 0,
    type: "\u5C3E\u6B3E",
    amount_cents_str: "",
    currency: "USD",
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    bank_ref: "",
    note: ""
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return React11.createElement(
    "div",
    {
      style: {
        padding: 14,
        marginBottom: 16,
        border: "1px solid var(--twb-line)",
        borderRadius: "var(--twb-r)",
        background: "var(--twb-raised)"
      }
    },
    React11.createElement(
      "div",
      { className: "twb-grid3" },
      React11.createElement(
        Field,
        { label: "\u8BA2\u5355 ID *" },
        React11.createElement(TextInput, { value: String(f.order_id || ""), onChange: set("order_id") })
      ),
      React11.createElement(
        Field,
        { label: "\u7C7B\u578B" },
        React11.createElement(
          Select,
          { value: f.type, onChange: set("type") },
          ["\u5B9A\u91D1", "\u5C3E\u6B3E", "\u8D39\u7528"].map((t) => React11.createElement("option", { key: t, value: t }, t))
        )
      ),
      React11.createElement(
        Field,
        { label: "\u91D1\u989D *" },
        React11.createElement(TextInput, { value: f.amount_cents_str, onChange: set("amount_cents_str"), placeholder: "\u5982 12500.00" })
      ),
      React11.createElement(
        Field,
        { label: "\u5E01\u79CD" },
        React11.createElement(TextInput, { value: f.currency, onChange: set("currency") })
      ),
      React11.createElement(
        Field,
        { label: "\u5230\u8D26\u65E5" },
        React11.createElement(TextInput, { value: f.date, onChange: set("date") })
      ),
      React11.createElement(
        Field,
        { label: "\u6C34\u5355\u53F7" },
        React11.createElement(TextInput, { value: f.bank_ref, onChange: set("bank_ref") })
      )
    ),
    React11.createElement("button", {
      className: "twb-btn",
      onClick: async () => {
        const cents = Math.round(Number(f.amount_cents_str || 0) * 100);
        if (!f.order_id || !Number.isFinite(cents) || cents <= 0) return toasts.push("\u8BA2\u5355\u4E0E\u91D1\u989D\u5FC5\u586B");
        try {
          await saveRow("receipts", {
            order_id: Number(f.order_id),
            type: f.type,
            amount_cents: cents,
            currency: f.currency,
            date: f.date,
            bank_ref: f.bank_ref,
            note: f.note
          });
          props.onDone();
        } catch (e) {
          toasts.push(e.message);
        }
      }
    }, "\u767B\u8BB0")
  );
}

// src/client/panels/Settings.tsx
var React12 = __toESM(require("react"), 1);
var import_react11 = require("react");
var BIZ_KEYS = [
  ["company", "\u516C\u53F8\u540D\u79F0\uFF08\u82F1\u6587\u62AC\u5934\uFF09"],
  ["company_address", "\u516C\u53F8\u5730\u5740"],
  ["company_tel", "\u516C\u53F8\u7535\u8BDD"],
  ["company_email", "\u516C\u53F8\u90AE\u7BB1"],
  ["incoterms", "\u9ED8\u8BA4\u8D38\u6613\u6761\u6B3E"],
  ["bank_info", "\u6536\u6B3E\u94F6\u884C\u4FE1\u606F", "textarea"],
  ["ai_base", "AI \u76F4\u8FDE base URL", "\u7559\u7A7A\u5219\u4EC5\u7528\u4F1A\u8BDD\u4EA4\u63A5"],
  ["ai_key", "AI Key", "password"],
  ["ai_model", "AI \u6A21\u578B\u540D"]
];
var LEADS_KEYS = [
  { path: "serp.engine", label: "\u641C\u7D22\u5F15", hint: "ddg \u514D\u5BC6\u94A5 / serpapi \u9700 key" },
  { path: "serp.serpapiKey", label: "SerpAPI Key", type: "password" },
  { path: "serp.proxy", label: "\u672C\u5730\u4EE3\u7406", hint: "\u5927\u9646\u7F51\u7EDC\u5FC5\u586B\uFF0C\u5982 http://127.0.0.1:7890" },
  { path: "serp.perLayer", label: "\u6BCF\u5C42\u7ED3\u679C\u6570" },
  { path: "icp.product", label: "\u5356\u4EC0\u4E48\uFF08ICP \u4EA7\u54C1\uFF09", hint: "\u8BC4\u5206\u4E0E\u5F00\u53D1\u4FE1\u90FD\u4F1A\u7528" },
  { path: "icp.buyers", label: "\u627E\u4EC0\u4E48\u4E70\u5BB6\uFF08ICP \u753B\u50CF\uFF09" },
  { path: "smtp.host", label: "SMTP \u4E3B\u673A" },
  { path: "smtp.port", label: "SMTP \u7AEF\u53E3" },
  { path: "smtp.user", label: "SMTP \u7528\u6237\u540D" },
  { path: "smtp.pass", label: "SMTP \u5BC6\u7801", type: "password" },
  { path: "smtp.from", label: "\u53D1\u4EF6\u90AE\u7BB1" },
  { path: "smtp.dailyCap", label: "\u6BCF\u65E5\u53D1\u9001\u4E0A\u9650" },
  { path: "imap.host", label: "IMAP \u4E3B\u673A\uFF08\u6536\u56DE\u590D\uFF09" },
  { path: "imap.user", label: "IMAP \u7528\u6237\u540D" },
  { path: "imap.pass", label: "IMAP \u5BC6\u7801", type: "password" },
  { path: "deepseek.apiKey", label: "DeepSeek Key", type: "password", hint: "AI \u5199\u5F00\u53D1\u4FE1\u7528" },
  { path: "evolution.baseURL", label: "Evolution \u5730\u5740\uFF08WhatsApp\uFF09" },
  { path: "evolution.instance", label: "Evolution \u5B9E\u4F8B\u540D" },
  { path: "evolution.apiKey", label: "Evolution Key", type: "password" },
  { path: "track.publicBaseUrl", label: "\u8FFD\u8E2A\u516C\u7F51\u5730\u5740", hint: "\u90AE\u4EF6\u6253\u5F00/\u70B9\u51FB\u7EDF\u8BA1\u7528" }
];
function getPath(obj, path) {
  return path.split(".").reduce((acc, k) => acc == null ? acc : acc[k], obj);
}
function setPath(obj, path, value) {
  const keys = path.split(".");
  const out = { ...obj ?? {} };
  let cur = out;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...cur[keys[i]] ?? {} };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return out;
}
function Settings() {
  const [f, setF] = (0, import_react11.useState)({});
  const [health, setHealth] = (0, import_react11.useState)(null);
  const [busy, setBusy] = (0, import_react11.useState)(false);
  const [leadCfg, setLeadCfg] = (0, import_react11.useState)({});
  const [summary, setSummary] = (0, import_react11.useState)(null);
  const [section, setSection] = (0, import_react11.useState)("biz");
  (0, import_react11.useEffect)(() => {
    api.getSettings().then(setF).catch((e) => toasts.push(e.message));
    fetch("/api/trade-workbench/health").then((r) => r.json()).then(setHealth).catch(() => {
    });
    leads.configRaw().then(setLeadCfg).catch(() => {
    });
    leads.configSummary().then(setSummary).catch(() => {
    });
  }, []);
  const save = async () => {
    setBusy(true);
    try {
      setF(await api.putSettings(f));
      toasts.push("\u8BBE\u7F6E\u5DF2\u4FDD\u5B58", "ok");
    } catch (e) {
      toasts.push(e.message);
    } finally {
      setBusy(false);
    }
  };
  const saveLeads = async () => {
    setBusy(true);
    try {
      await leads.configWrite(leadCfg);
      setSummary(await leads.configSummary());
      toasts.push("\u83B7\u5BA2\u914D\u7F6E\u5DF2\u4FDD\u5B58", "ok");
    } catch (e) {
      toasts.push(e.message);
    } finally {
      setBusy(false);
    }
  };
  const exportBackup = async () => {
    try {
      const domains = ["customers", "followups", "inquiries", "quotes", "orders", "shipments", "receipts", "documents"];
      const dump = {};
      for (const d of domains) dump[d] = await api.list(d);
      dump.settings = f;
      dump.leads = await leads.crmList().catch(() => []);
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "trade-workbench-backup-" + (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) + ".json";
      a.click();
      URL.revokeObjectURL(a.href);
      toasts.push("\u5907\u4EFD\u5DF2\u5BFC\u51FA", "ok");
    } catch (e) {
      toasts.push(e.message);
    }
  };
  const bizPane = React12.createElement(
    "div",
    { style: { maxWidth: 620 } },
    BIZ_KEYS.map(([k, label, hint]) => React12.createElement(
      Field,
      { key: k, label, hint: hint && hint !== "textarea" ? hint : void 0 },
      hint === "textarea" ? React12.createElement(TextArea, {
        rows: 3,
        value: f[k] ?? "",
        onChange: (e) => setF({ ...f, [k]: e.target.value })
      }) : React12.createElement(TextInput, {
        type: hint === "password" ? "password" : "text",
        value: f[k] ?? "",
        onChange: (e) => setF({ ...f, [k]: e.target.value })
      })
    )),
    React12.createElement(
      "div",
      { className: "twb-toolbar" },
      React12.createElement(
        "button",
        { className: "twb-btn", onClick: save, disabled: busy },
        busy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u8BBE\u7F6E"
      ),
      React12.createElement("button", { className: "twb-btn secondary", onClick: exportBackup }, "\u5BFC\u51FA\u5168\u91CF\u5907\u4EFD")
    )
  );
  const statusCards = summary ? React12.createElement(
    "div",
    { className: "twb-cards", style: { marginBottom: 18 } },
    React12.createElement(
      "div",
      { className: "twb-card" },
      React12.createElement("div", { className: "k" }, "\u641C\u7D22\u5F15"),
      React12.createElement("div", { className: "v", style: { fontSize: 15, fontFamily: "inherit" } }, summary.serp?.engine ?? "-"),
      React12.createElement("div", { className: "sub" }, summary.serp?.hasSerpapiKey ? "\u5DF2\u914D Key" : "\u672A\u914D Key")
    ),
    React12.createElement(
      "div",
      { className: "twb-card" + (summary.smtp?.ready ? summary.smtp.dryRun ? " tone-warn" : " tone-ok" : "") },
      React12.createElement("div", { className: "k" }, "\u53D1\u4FE1"),
      React12.createElement(
        "div",
        { className: "v", style: { fontSize: 15, fontFamily: "inherit" } },
        summary.smtp?.ready ? summary.smtp.dryRun ? "\u6F14\u7EC3\u4E2D" : "\u771F\u5B9E\u53D1\u9001" : "\u672A\u914D\u7F6E"
      ),
      React12.createElement("div", { className: "sub" }, summary.smtp?.dryRun ? "\u53EA\u9884\u89C8\u4E0D\u771F\u53D1" : "\u5DF2\u5173\u95ED\u6F14\u7EC3")
    ),
    React12.createElement(
      "div",
      { className: "twb-card" + (summary.icp?.ready ? " tone-ok" : "") },
      React12.createElement("div", { className: "k" }, "ICP \u753B\u50CF"),
      React12.createElement(
        "div",
        { className: "v", style: { fontSize: 15, fontFamily: "inherit" } },
        summary.icp?.ready ? "\u5DF2\u8BBE\u7F6E" : "\u672A\u8BBE\u7F6E"
      ),
      React12.createElement("div", { className: "sub" }, summary.icp?.product || "\u8BC4\u5206\u4E0E\u5199\u4FE1\u4F9D\u8D56\u5B83")
    ),
    React12.createElement(
      "div",
      { className: "twb-card" + (summary.evolution?.ready ? " tone-ok" : "") },
      React12.createElement("div", { className: "k" }, "WhatsApp"),
      React12.createElement(
        "div",
        { className: "v", style: { fontSize: 15, fontFamily: "inherit" } },
        summary.evolution?.ready ? "\u5DF2\u8FDE\u63A5" : "\u672A\u914D\u7F6E"
      ),
      React12.createElement("div", { className: "sub" }, summary.evolution?.instance || "Evolution \u7F51\u5173")
    )
  ) : null;
  const leadsPane = React12.createElement(
    "div",
    { style: { maxWidth: 700 } },
    statusCards,
    React12.createElement(
      "div",
      { className: "twb-grid2" },
      LEADS_KEYS.map(({ path, label, type, hint }) => React12.createElement(
        Field,
        { key: path, label, hint },
        React12.createElement(TextInput, {
          type: type === "password" ? "password" : "text",
          value: String(getPath(leadCfg, path) ?? ""),
          onChange: (e) => setLeadCfg(setPath(leadCfg, path, e.target.value))
        })
      ))
    ),
    React12.createElement(
      "div",
      { className: "twb-toolbar", style: { marginTop: 4 } },
      React12.createElement(
        "button",
        { className: "twb-btn", onClick: saveLeads, disabled: busy },
        busy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u83B7\u5BA2\u914D\u7F6E"
      ),
      React12.createElement("button", {
        className: "twb-btn secondary",
        onClick: async () => {
          try {
            const r = await leads.deliverability(String(getPath(leadCfg, "smtp.from") ?? "").split("@")[1] ?? "");
            toasts.push("\u9001\u8FBE\u7387\u4F53\u68C0\uFF1A" + JSON.stringify(r).slice(0, 120), "ok");
          } catch (e) {
            toasts.push(e.message);
          }
        }
      }, "\u9001\u8FBE\u7387\u4F53\u68C0")
    )
  );
  return React12.createElement(
    "div",
    null,
    React12.createElement(PageHead, { title: "\u8BBE\u7F6E", sub: "\u516C\u53F8\u62AC\u5934\u3001\u94F6\u884C\u4FE1\u606F\u4E0E\u83B7\u5BA2\u94FE\u8DEF\u914D\u7F6E" }),
    React12.createElement(
      "div",
      { className: "twb-toolbar" },
      React12.createElement(Segmented, {
        value: section,
        options: [["biz", "\u516C\u53F8\u4FE1\u606F"], ["leads", "\u83B7\u5BA2\u914D\u7F6E"]],
        onChange: (v) => setSection(v)
      })
    ),
    section === "biz" ? bizPane : leadsPane,
    React12.createElement(
      Section,
      { title: "\u8FD0\u884C\u72B6\u6001" },
      health ? React12.createElement(KeyValue, {
        rows: [
          ["\u5B58\u50A8", health.storage ?? "-"],
          ["\u6570\u636E\u5E93", React12.createElement("span", { className: "twb-mono", style: { fontSize: 11.5 } }, health.dbPath ?? "-")],
          ["\u6570\u636E\u76EE\u5F55", React12.createElement("span", { className: "twb-mono", style: { fontSize: 11.5 } }, health.dataDir ?? "-")],
          ["\u7248\u672C", health.version ?? "-"],
          ["\u65E7\u6570\u636E\u8FC1\u79FB", health.leadsMigration && !health.leadsMigration.skipped ? React12.createElement(Badge, { tone: "ok" }, `\u5DF2\u5BFC\u5165 ${health.leadsMigration.imported} \u9879`) : React12.createElement(Badge, { plain: true }, "\u65E0")]
        ]
      }) : React12.createElement("div", { className: "twb-muted" }, "host \u672A\u5C31\u7EEA\uFF08\u5237\u65B0\u6216\u91CD\u542F DSH\uFF09")
    )
  );
}

// src/client/panels/Leads.tsx
var React13 = __toESM(require("react"), 1);
var MARKETS = [
  "Brazil",
  "Mexico",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
  "USA",
  "Germany",
  "UK",
  "France",
  "Spain",
  "Italy",
  "Poland",
  "UAE",
  "Saudi Arabia",
  "Turkey",
  "Egypt",
  "Nigeria",
  "Kenya",
  "South Africa",
  "India",
  "Vietnam",
  "Thailand",
  "Indonesia",
  "Malaysia",
  "Philippines"
];
var LAYERS = [
  ["\u57FA\u7840\u641C\u7D22", "\u4EA7\u54C1\u8BCD + \u4E70\u5BB6\u8BCD\uFF08importer / distributor / wholesaler\uFF09"],
  ["LinkedIn \u5B9A\u5411", "\u6309\u91C7\u8D2D/\u8001\u677F\u804C\u4F4D\u8BCD\u641C\u51B3\u7B56\u4EBA"],
  ["\u91C7\u8D2D\u4FE1\u53F7", "\u8BE2\u76D8\u3001\u62DB\u6807\u3001\u65B0\u5E97\u5F00\u4E1A\u7B49\u5F3A\u610F\u56FE\u4FE1\u53F7"]
];
function tierTone(tier) {
  const t = String(tier ?? "");
  if (t.includes("\u6781\u9AD8") || t.includes("\u9AD8")) return "ok";
  if (t.includes("\u4E2D")) return "warn";
  if (t.includes("\u4F4E")) return "err";
  return void 0;
}
function Leads() {
  const [product, setProduct] = React13.useState("");
  const [market, setMarket] = React13.useState("Brazil");
  const [perLayer, setPerLayer] = React13.useState(10);
  const [busy, setBusy] = React13.useState(false);
  const [run, setRun] = React13.useState(null);
  const [runs, setRuns] = React13.useState([]);
  const [sel, setSel] = React13.useState(/* @__PURE__ */ new Set());
  const reloadRuns = React13.useCallback(() => {
    leads.runs(20).then((r) => setRuns(Array.isArray(r) ? r : [])).catch(() => {
    });
  }, []);
  React13.useEffect(() => {
    reloadRuns();
  }, [reloadRuns]);
  const doSearch = async () => {
    if (!product.trim()) {
      toasts.push("\u5148\u586B\u4EA7\u54C1\u8BCD");
      return;
    }
    setBusy(true);
    setSel(/* @__PURE__ */ new Set());
    try {
      const r = await leads.search({ product: product.trim(), market, perLayer });
      setRun(r);
      reloadRuns();
      const n = r?.results?.length ?? r?.leads?.length ?? 0;
      toasts.push(`\u641C\u7D22\u5B8C\u6210\uFF0C\u5F97\u5230 ${n} \u6761\u7EBF\u7D22`, "ok");
    } catch (e) {
      toasts.push("\u641C\u7D22\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const results = run?.results ?? run?.leads ?? [];
  const toggle = (i) => {
    const next = new Set(sel);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSel(next);
  };
  const toggleAll = () => {
    setSel(sel.size === results.length ? /* @__PURE__ */ new Set() : new Set(results.map((_, i) => i)));
  };
  const enrichSelected = async () => {
    const urls = [...sel].map((i) => results[i]?.url).filter(Boolean);
    if (urls.length === 0) {
      toasts.push("\u5148\u52FE\u9009\u8981\u52A0\u5DE5\u7684\u7EBF\u7D22");
      return;
    }
    setBusy(true);
    try {
      const r = await leads.enrich(urls, market);
      const added = r?.imported ?? r?.leads?.length ?? 0;
      toasts.push(`\u52A0\u5DE5\u5B8C\u6210\uFF0C${added} \u6761\u5165 CRM`, "ok");
      reloadRuns();
    } catch (e) {
      toasts.push("\u52A0\u5DE5\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  return React13.createElement(
    "div",
    null,
    React13.createElement(PageHead, { title: "\u8C37\u6B4C\u83B7\u5BA2", sub: "\u4E09\u5C42\u68C0\u7D22\uFF1A\u57FA\u7840\u8BCD \u2192 LinkedIn \u51B3\u7B56\u4EBA \u2192 \u91C7\u8D2D\u4FE1\u53F7" }),
    // 控制条：搜索条件集中一行
    React13.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
          flexWrap: "wrap",
          padding: 13,
          marginBottom: 16,
          border: "1px solid var(--twb-line)",
          borderRadius: "var(--twb-r)",
          background: "var(--twb-raised)"
        }
      },
      React13.createElement(
        Field,
        { label: "\u4EA7\u54C1\u8BCD\uFF08\u82F1\u6587\uFF09" },
        React13.createElement(TextInput, {
          placeholder: "stainless steel bottle",
          value: product,
          onChange: (e) => setProduct(e.target.value),
          style: { minWidth: 260 },
          onKeyDown: (e) => {
            if (e.key === "Enter") doSearch();
          }
        })
      ),
      React13.createElement(
        Field,
        { label: "\u76EE\u6807\u5E02\u573A" },
        React13.createElement(
          Select,
          { value: market, onChange: (e) => setMarket(e.target.value) },
          MARKETS.map((m) => React13.createElement("option", { key: m, value: m }, m))
        )
      ),
      React13.createElement(
        Field,
        { label: "\u6BCF\u5C42\u6761\u6570" },
        React13.createElement(TextInput, {
          type: "number",
          min: 1,
          max: 30,
          value: perLayer,
          onChange: (e) => setPerLayer(Number(e.target.value) || 10),
          style: { width: 78, minWidth: 78 }
        })
      ),
      React13.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 12 } },
        React13.createElement(
          "button",
          { className: "twb-btn", onClick: doSearch, disabled: busy },
          busy ? "\u641C\u7D22\u4E2D\u2026" : "\u5F00\u59CB\u641C\u7D22"
        ),
        sel.size > 0 ? React13.createElement("button", {
          className: "twb-btn secondary",
          onClick: enrichSelected,
          disabled: busy
        }, `\u52A0\u5DE5\u52FE\u9009 (${sel.size})`) : null
      )
    ),
    // 三层说明：紧凑胶囊
    React13.createElement(
      "div",
      { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 } },
      LAYERS.map(([k, v], i) => React13.createElement(
        "div",
        {
          key: k,
          style: {
            flex: "1 1 200px",
            padding: "9px 12px",
            border: "1px solid var(--twb-line)",
            borderRadius: "var(--twb-r-sm)",
            background: "var(--twb-sunken)"
          }
        },
        React13.createElement(
          "div",
          { style: { fontSize: 11, fontWeight: 620, color: "var(--twb-accent)", marginBottom: 3, letterSpacing: ".02em" } },
          `\u7B2C ${i + 1} \u5C42 \xB7 ${k}`
        ),
        React13.createElement("div", { className: "twb-dim", style: { lineHeight: 1.55 } }, v)
      ))
    ),
    results.length > 0 ? React13.createElement(
      Section,
      { title: `\u641C\u7D22\u7ED3\u679C \xB7 ${results.length} \u6761` },
      React13.createElement(
        "div",
        { className: "twb-toolbar" },
        React13.createElement(Badge, { plain: true }, "\u5F15\u64CE " + (run?.engine ?? "-")),
        run?.engineFallbacks?.length ? React13.createElement(Badge, { tone: "warn" }, "\u5F15\u64CE\u5207\u6362: " + run.engineFallbacks.join(", ")) : null,
        React13.createElement("span", { className: "spacer" }),
        React13.createElement(
          "label",
          { className: "twb-muted", style: { display: "flex", gap: 6, alignItems: "center", cursor: "pointer" } },
          React13.createElement("input", {
            type: "checkbox",
            checked: sel.size === results.length && results.length > 0,
            onChange: toggleAll
          }),
          "\u5168\u9009"
        )
      ),
      React13.createElement(
        Table,
        { head: ["", "\u516C\u53F8", "\u8BC4\u5206", "\u6807\u9898", ""] },
        results.map((r, i) => React13.createElement(
          "tr",
          { key: i, className: "row" },
          React13.createElement(
            "td",
            { style: { width: 32 } },
            React13.createElement("input", { type: "checkbox", checked: sel.has(i), onChange: () => toggle(i) })
          ),
          React13.createElement(
            "td",
            { style: { fontWeight: 550, color: "var(--twb-fg)" } },
            r.company || r.title || "-"
          ),
          React13.createElement(
            "td",
            { style: { width: 76 } },
            React13.createElement(Badge, { tone: tierTone(r.tier) }, (r.score ?? 0) + (r.tier ? " " + r.tier : ""))
          ),
          React13.createElement(
            "td",
            { className: "twb-muted", style: { maxWidth: 460 } },
            (r.snippet ?? r.title ?? "").slice(0, 90)
          ),
          React13.createElement(
            "td",
            { style: { width: 56, textAlign: "right" } },
            r.url ? React13.createElement("a", {
              href: r.url,
              target: "_blank",
              rel: "noreferrer",
              style: { color: "var(--twb-accent)", fontSize: 11.5, textDecoration: "none" }
            }, "\u6253\u5F00 \u2197") : null
          )
        ))
      )
    ) : null,
    runs.length > 0 ? React13.createElement(
      Section,
      { title: "\u5386\u53F2\u641C\u7D22" },
      React13.createElement(
        Table,
        { head: ["\u65F6\u95F4", "\u4EA7\u54C1", "\u5E02\u573A", "\u7ED3\u679C\u6570"] },
        runs.map((r) => React13.createElement(
          "tr",
          {
            key: r.id,
            className: "row",
            onClick: () => leads.run(r.id).then(setRun).catch(() => {
            })
          },
          React13.createElement(
            "td",
            { className: "mono twb-muted" },
            String(r.createdAt ?? r.ts ?? "").slice(0, 19).replace("T", " ")
          ),
          React13.createElement("td", null, r.product ?? "-"),
          React13.createElement("td", null, r.market ?? "-"),
          React13.createElement("td", { className: "num" }, String(r.results?.length ?? r.leads?.length ?? 0))
        ))
      )
    ) : null
  );
}

// src/client/panels/LeadsPool.tsx
var React14 = __toESM(require("react"), 1);
var STATUSES = ["new", "qualified", "contacted", "replied", "quoted", "won", "lost"];
var LABELS = {
  new: "\u65B0\u7EBF\u7D22",
  qualified: "\u5DF2\u8BC4\u4F30",
  contacted: "\u5DF2\u89E6\u8FBE",
  replied: "\u5DF2\u56DE\u590D",
  quoted: "\u5DF2\u62A5\u4EF7",
  won: "\u5DF2\u6210\u4EA4",
  lost: "\u5DF2\u6D41\u5931"
};
var COLORS = {
  new: "var(--twb-fg-3)",
  qualified: "var(--twb-info)",
  contacted: "var(--twb-violet)",
  replied: "var(--twb-cyan)",
  quoted: "var(--twb-accent)",
  won: "var(--twb-ok)",
  lost: "var(--twb-err)"
};
function scoreTone(score2) {
  if (score2 >= 8) return "ok";
  if (score2 >= 4) return "warn";
  return "err";
}
function LeadsPool() {
  const [rows, setRows] = React14.useState([]);
  const [q, setQ] = React14.useState("");
  const [view, setView] = React14.useState("board");
  const [detail, setDetail] = React14.useState(null);
  const [acts, setActs] = React14.useState([]);
  const [converting, setConverting] = React14.useState(false);
  const reload = React14.useCallback(() => {
    leads.crmList(q).then((r) => setRows(Array.isArray(r) ? r : r?.leads ?? [])).catch((e) => {
      toasts.push("\u52A0\u8F7D\u7EBF\u7D22\u5931\u8D25\uFF1A" + e.message);
    });
  }, [q]);
  React14.useEffect(() => {
    reload();
  }, [reload]);
  const openDetail = async (lead) => {
    setDetail(lead);
    try {
      setActs(await leads.crmActivities(lead.id));
    } catch {
      setActs([]);
    }
  };
  const move = async (lead, status) => {
    if (lead.status === status) return;
    try {
      await leads.crmUpdate(lead.id, { status });
      toasts.push(`${lead.company || lead.id} \u2192 ${LABELS[status]}`, "ok");
      reload();
      if (detail?.id === lead.id) setDetail({ ...detail, status });
    } catch (e) {
      toasts.push("\u6539\u72B6\u6001\u5931\u8D25\uFF1A" + e.message);
    }
  };
  const grouped = React14.useMemo(() => {
    const map = {};
    for (const s of STATUSES) map[s] = [];
    for (const r of rows) (map[r.status] ?? map.new).push(r);
    return map;
  }, [rows]);
  const listColumns = [
    {
      label: "\u516C\u53F8",
      get: (r) => r.company,
      width: 200,
      render: (r) => React14.createElement("span", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, r.company || "-")
    },
    {
      label: "\u57DF\u540D",
      get: (r) => r.domain,
      render: (r) => React14.createElement("span", { className: "mono twb-muted" }, r.domain || "-")
    },
    { label: "\u5E02\u573A", get: (r) => r.market },
    {
      label: "\u72B6\u6001",
      get: (r) => r.status,
      width: 96,
      render: (r) => React14.createElement(Badge, { plain: true }, LABELS[r.status] ?? r.status)
    },
    {
      label: "\u8BC4\u5206",
      get: (r) => Number(r.score ?? 0),
      width: 76,
      render: (r) => React14.createElement(Badge, { tone: scoreTone(r.score ?? 0) }, String(r.score ?? 0))
    },
    {
      label: "\u90AE\u7BB1",
      get: (r) => (r.contacts?.emails ?? [])[0],
      render: (r) => React14.createElement("span", { className: "twb-muted" }, (r.contacts?.emails ?? []).slice(0, 1).join(", ") || "-")
    }
  ];
  const listSort = useSortedRows(rows, listColumns);
  const renderTile = (lead) => React14.createElement(
    "div",
    {
      key: lead.id,
      className: "twb-tile",
      onClick: () => openDetail(lead)
    },
    React14.createElement("div", { className: "t" }, lead.company || lead.domain || lead.id),
    React14.createElement("div", { className: "m" }, [lead.market, lead.domain].filter(Boolean).join(" \xB7 ") || "\u2014"),
    React14.createElement(Badge, { tone: scoreTone(lead.score ?? 0) }, `${lead.score ?? 0}${lead.tier ? " " + lead.tier : ""}`),
    React14.createElement(
      "div",
      { className: "acts" },
      STATUSES.filter((x) => x !== lead.status).slice(0, 3).map((x) => React14.createElement("button", {
        key: x,
        onClick: (e) => {
          e.stopPropagation();
          move(lead, x);
        }
      }, LABELS[x]))
    )
  );
  const renderColumn = (s) => React14.createElement(
    "div",
    { key: s, style: { minWidth: 0 } },
    React14.createElement(
      "div",
      { className: "twb-col-head", style: { borderTopColor: COLORS[s] } },
      React14.createElement("span", null, LABELS[s]),
      React14.createElement("span", { className: "n" }, String(grouped[s].length))
    ),
    grouped[s].map(renderTile)
  );
  const body = React14.createElement(
    "div",
    null,
    React14.createElement(
      "div",
      { className: "twb-toolbar" },
      React14.createElement(TextInput, {
        placeholder: "\u641C\u7D22\u516C\u53F8 / \u57DF\u540D / \u90AE\u7BB1\u2026",
        value: q,
        onChange: (e) => setQ(e.target.value),
        style: { minWidth: 240 }
      }),
      React14.createElement(Segmented, {
        value: view,
        options: [["board", "\u770B\u677F"], ["list", "\u5217\u8868"]],
        onChange: (v) => setView(v)
      }),
      React14.createElement("span", { className: "spacer" }),
      React14.createElement("span", { className: "twb-muted" }, `\u5171 ${rows.length} \u6761\u7EBF\u7D22`)
    ),
    view === "board" ? rows.length === 0 ? React14.createElement(Empty, { title: "\u7EBF\u7D22\u6C60\u662F\u7A7A\u7684", desc: "\u53BB\u300C\u7EBF\u7D22\u641C\u7D22\u300D\u8DD1\u4E00\u6B21\u641C\u7D22\uFF0C\u52FE\u9009\u7ED3\u679C\u540E\u70B9\u300C\u52A0\u5DE5\u300D\uFF0C\u7EBF\u7D22\u4F1A\u81EA\u52A8\u5165\u6C60\u3002" }) : React14.createElement("div", {
      className: "twb-board",
      style: { gridTemplateColumns: `repeat(${STATUSES.length}, minmax(178px, 1fr))` }
    }, STATUSES.map(renderColumn)) : React14.createElement(SortableTable, {
      columns: listColumns,
      rows: listSort.sorted,
      sortKey: listSort.key,
      asc: listSort.asc,
      onSort: listSort.toggle,
      onRowClick: (r) => openDetail(r),
      empty: React14.createElement(Empty, { title: "\u7EBF\u7D22\u6C60\u662F\u7A7A\u7684", desc: "\u53BB\u300C\u7EBF\u7D22\u641C\u7D22\u300D\u8DD1\u4E00\u6B21\u641C\u7D22\uFF0C\u52FE\u9009\u7ED3\u679C\u540E\u70B9\u300C\u52A0\u5DE5\u300D\u3002" })
    })
  );
  const drawer = detail ? React14.createElement(
    React14.Fragment,
    null,
    React14.createElement("div", { className: "twb-drawer-mask", onClick: () => setDetail(null) }),
    React14.createElement(
      "div",
      { className: "twb-drawer" },
      React14.createElement(
        "header",
        null,
        React14.createElement(
          "div",
          null,
          React14.createElement("div", { className: "h" }, detail.company || detail.domain || detail.id),
          React14.createElement("div", { className: "s" }, [detail.market, detail.domain].filter(Boolean).join(" \xB7 ") || "\u7EBF\u7D22\u8BE6\u60C5")
        ),
        React14.createElement("button", { className: "twb-btn secondary sm", onClick: () => setDetail(null) }, "\u5173\u95ED")
      ),
      React14.createElement(
        "div",
        { className: "content" },
        React14.createElement(
          "div",
          { className: "twb-cards", style: { marginBottom: 18 } },
          React14.createElement(
            "div",
            { className: "twb-card" },
            React14.createElement("div", { className: "k" }, "\u8BC4\u5206"),
            React14.createElement("div", { className: "v" }, String(detail.score ?? 0)),
            React14.createElement("div", { className: "sub" }, detail.tier || "\u672A\u5206\u7EA7")
          ),
          React14.createElement(
            "div",
            { className: "twb-card" },
            React14.createElement("div", { className: "k" }, "\u72B6\u6001"),
            React14.createElement(
              "div",
              { className: "v", style: { fontSize: 15, fontFamily: "inherit" } },
              LABELS[detail.status] ?? detail.status
            )
          )
        ),
        React14.createElement(
          Section,
          { title: "\u8054\u7CFB\u4FE1\u606F" },
          React14.createElement(KeyValue, {
            rows: [
              ["\u90AE\u7BB1", (detail.contacts?.emails ?? []).join(", ") || "\u2014"],
              ["WhatsApp", (detail.contacts?.whatsapps ?? []).join(", ") || "\u2014"],
              ["\u7535\u8BDD", (detail.contacts?.phones ?? []).join(", ") || "\u2014"],
              ["\u7F51\u7AD9", detail.url ? React14.createElement("a", { href: detail.url, target: "_blank", rel: "noreferrer", style: { color: "var(--twb-accent)" } }, detail.url) : "\u2014"]
            ]
          })
        ),
        detail.advice ? React14.createElement(
          Section,
          { title: "\u5F00\u53D1\u5EFA\u8BAE" },
          React14.createElement("div", { className: "twb-pre" }, detail.advice)
        ) : null,
        React14.createElement(
          Section,
          { title: "\u6D41\u8F6C\u72B6\u6001" },
          React14.createElement(
            "div",
            { className: "twb-steps" },
            STATUSES.map((s) => React14.createElement("button", {
              key: s,
              className: "twb-step" + (detail.status === s ? " done" : ""),
              onClick: () => move(detail, s)
            }, LABELS[s]))
          )
        ),
        React14.createElement(
          Section,
          { title: "\u8F6C\u4E3A\u5BA2\u6237\u6863\u6848" },
          React14.createElement(
            "div",
            { className: "twb-muted", style: { marginBottom: 10, lineHeight: 1.7 } },
            "\u7EBF\u7D22\u53EA\u662F\u641C\u7D22\u7ED3\u679C\u7684\u52A0\u5DE5\u54C1\uFF1B\u8F6C\u6210\u5BA2\u6237\u540E\u624D\u4F1A\u6302\u4E0A\u62A5\u4EF7\u5355\u4E0E\u8BA2\u5355\uFF0C\u8FDB\u5165\u6B63\u5F0F\u7684\u4EA4\u4ED8\u6D41\u7A0B\u3002"
          ),
          React14.createElement("button", {
            className: "twb-btn",
            disabled: converting,
            onClick: async () => {
              setConverting(true);
              try {
                const r = await leads.toCustomer(detail.id);
                toasts.push(`\u5DF2\u521B\u5EFA\u5BA2\u6237 #${r.customer?.id ?? ""}`, "ok");
                setDetail(null);
                reload();
              } catch (e) {
                toasts.push("\u8F6C\u5BA2\u6237\u5931\u8D25\uFF1A" + e.message);
              } finally {
                setConverting(false);
              }
            }
          }, converting ? "\u521B\u5EFA\u4E2D\u2026" : "\u8F6C\u4E3A\u5BA2\u6237")
        ),
        React14.createElement(
          Section,
          { title: "\u6D3B\u52A8\u8BB0\u5F55" },
          acts.length === 0 ? React14.createElement("div", { className: "twb-muted" }, "\u6682\u65E0\u6D3B\u52A8\u8BB0\u5F55") : React14.createElement("div", null, acts.map((a, i) => React14.createElement(
            "div",
            {
              key: i,
              style: {
                display: "flex",
                gap: 12,
                padding: "7px 0",
                borderBottom: "1px solid var(--twb-hairline)",
                fontSize: 12
              }
            },
            React14.createElement(
              "span",
              { className: "twb-mono twb-dim", style: { flex: "0 0 96px" } },
              String(a.ts ?? "").slice(5, 16).replace("T", " ")
            ),
            React14.createElement("span", { style: { color: "var(--twb-fg-2)" } }, a.note ?? a.type ?? "")
          )))
        )
      )
    )
  ) : null;
  return React14.createElement("div", null, body, detail ? drawer : null);
}

// src/client/panels/EmailFinder.tsx
var React15 = __toESM(require("react"), 1);
var STATUS_LABEL = {
  valid: "\u6709\u6548",
  guessed: "\u731C\u6D4B\u672A\u9A8C",
  "catch-all": "\u6574\u57DF\u63A5\u6536",
  invalid: "\u65E0\u6548",
  "no-mx": "\u65E0 MX",
  unverifiable: "\u65E0\u6CD5\u9A8C\u8BC1"
};
function statusTone(s) {
  if (s === "valid") return "ok";
  if (s === "invalid" || s === "no-mx") return "err";
  if (s) return "warn";
  return void 0;
}
function EmailFinder() {
  const [domain, setDomain] = React15.useState("");
  const [first, setFirst] = React15.useState("");
  const [last, setLast] = React15.useState("");
  const [single, setSingle] = React15.useState("");
  const [found, setFound] = React15.useState(null);
  const [verified, setVerified] = React15.useState(null);
  const [busy, setBusy] = React15.useState(false);
  const doFind = async () => {
    if (!domain.trim()) {
      toasts.push("\u5148\u586B\u57DF\u540D\uFF0C\u5982 acme.com");
      return;
    }
    setBusy(true);
    setFound(null);
    setVerified(null);
    try {
      setFound(await leads.emailFind({ domain: domain.trim(), first, last }));
    } catch (e) {
      toasts.push("\u67E5\u627E\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const doVerify = async (email) => {
    const target = (email ?? single).trim();
    if (!target) {
      toasts.push("\u5148\u586B\u8981\u9A8C\u8BC1\u7684\u90AE\u7BB1");
      return;
    }
    setBusy(true);
    setVerified(null);
    try {
      const r = await leads.emailVerify(target);
      setVerified({ email: target, ...r });
    } catch (e) {
      toasts.push("\u9A8C\u8BC1\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const candidates = found?.candidates ?? found?.emails ?? [];
  const badges = found?.results ?? [];
  const list = badges.length ? badges : candidates.map((c) => ({ email: c }));
  return React15.createElement(
    "div",
    null,
    React15.createElement(PageHead, { title: "\u90AE\u7BB1\u9A8C\u8BC1", sub: "\u6A21\u5F0F\u731C\u6D4B + MX \u89E3\u6790 + SMTP RCPT \u63A2\u6D4B" }),
    React15.createElement(
      "div",
      {
        style: {
          padding: 13,
          marginBottom: 16,
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
          flexWrap: "wrap",
          border: "1px solid var(--twb-line)",
          borderRadius: "var(--twb-r)",
          background: "var(--twb-raised)"
        }
      },
      React15.createElement(
        Field,
        { label: "\u57DF\u540D" },
        React15.createElement(TextInput, {
          placeholder: "acme.com",
          value: domain,
          onChange: (e) => setDomain(e.target.value),
          style: { minWidth: 180 },
          onKeyDown: (e) => {
            if (e.key === "Enter") doFind();
          }
        })
      ),
      React15.createElement(
        Field,
        { label: "\u540D\uFF08\u53EF\u9009\uFF09" },
        React15.createElement(TextInput, {
          placeholder: "John",
          value: first,
          onChange: (e) => setFirst(e.target.value),
          style: { minWidth: 100 }
        })
      ),
      React15.createElement(
        Field,
        { label: "\u59D3\uFF08\u53EF\u9009\uFF09" },
        React15.createElement(TextInput, {
          placeholder: "Smith",
          value: last,
          onChange: (e) => setLast(e.target.value),
          style: { minWidth: 100 }
        })
      ),
      React15.createElement(
        "div",
        { style: { marginBottom: 12 } },
        React15.createElement(
          "button",
          { className: "twb-btn", onClick: doFind, disabled: busy },
          busy ? "\u5904\u7406\u4E2D\u2026" : "\u67E5\u627E\u90AE\u7BB1"
        )
      )
    ),
    found ? React15.createElement(
      Section,
      { title: `\u547D\u4E2D ${list.length} \u4E2A\u5019\u9009` },
      found.mx ? React15.createElement(
        "div",
        { style: { marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" } },
        React15.createElement("span", { className: "twb-dim" }, "MX \u8BB0\u5F55"),
        (Array.isArray(found.mx) ? found.mx : [found.mx]).map((m, i) => React15.createElement(Badge, { key: i, plain: true }, String(m)))
      ) : null,
      list.length === 0 ? React15.createElement(Empty, { title: "\u6CA1\u6709\u627E\u5230\u5019\u9009\u90AE\u7BB1", desc: "\u8BE5\u57DF\u540D\u53EF\u80FD\u6CA1\u6709\u53EF\u731C\u6D4B\u7684\u516C\u5F00\u90AE\u7BB1\u683C\u5F0F\uFF0C\u6216\u7F51\u7AD9\u65E0\u6CD5\u8BBF\u95EE\u3002" }) : React15.createElement(
        Table,
        { head: ["\u90AE\u7BB1", "\u72B6\u6001", ""] },
        list.map((c, i) => React15.createElement(
          "tr",
          { key: i },
          React15.createElement("td", { className: "mono", style: { color: "var(--twb-fg)" } }, c.email ?? c.address ?? String(c)),
          React15.createElement(
            "td",
            { style: { width: 110 } },
            c.status ? React15.createElement(Badge, { tone: statusTone(c.status) }, STATUS_LABEL[c.status] ?? c.status) : React15.createElement("span", { className: "twb-dim" }, "\u672A\u9A8C\u8BC1")
          ),
          React15.createElement(
            "td",
            { style: { width: 70, textAlign: "right" } },
            React15.createElement("button", {
              className: "twb-btn secondary sm",
              onClick: () => doVerify(c.email ?? c.address)
            }, "\u9A8C\u8BC1")
          )
        ))
      )
    ) : null,
    React15.createElement(
      Section,
      { title: "\u76F4\u63A5\u9A8C\u8BC1\u5355\u4E2A\u90AE\u7BB1" },
      React15.createElement(
        "div",
        { className: "twb-toolbar" },
        React15.createElement(TextInput, {
          placeholder: "buyer@acme.com",
          value: single,
          onChange: (e) => setSingle(e.target.value),
          style: { minWidth: 260 },
          onKeyDown: (e) => {
            if (e.key === "Enter") doVerify();
          }
        }),
        React15.createElement("button", { className: "twb-btn", onClick: () => doVerify(), disabled: busy }, "\u9A8C\u8BC1")
      ),
      verified ? React15.createElement(
        "div",
        {
          style: {
            marginTop: 12,
            maxWidth: 460,
            padding: 14,
            border: "1px solid var(--twb-line)",
            borderRadius: "var(--twb-r)",
            background: "var(--twb-raised)"
          }
        },
        React15.createElement("div", { className: "twb-mono", style: { fontSize: 12.5, marginBottom: 8, color: "var(--twb-fg)" } }, verified.email),
        React15.createElement(
          Badge,
          { tone: statusTone(verified.status) },
          STATUS_LABEL[verified.status] ?? verified.status ?? "\u672A\u77E5"
        ),
        verified.reason ? React15.createElement("div", { className: "twb-muted", style: { marginTop: 8, lineHeight: 1.6 } }, verified.reason) : null,
        verified.catchAll ? React15.createElement("div", { className: "twb-dim", style: { marginTop: 6 } }, "\u8BE5\u57DF\u4E3A catch-all\uFF0C\u7ED3\u679C\u4EC5\u4F9B\u53C2\u8003") : null
      ) : null
    )
  );
}

// src/client/panels/Review.tsx
var React16 = __toESM(require("react"), 1);
var import_react12 = require("react");
var STATUS_LABEL2 = {
  pending: "\u5F85\u5BA1",
  sent: "\u5DF2\u53D1\u9001",
  skipped: "\u5DF2\u8DF3\u8FC7",
  failed: "\u5931\u8D25"
};
function tone2(s) {
  if (s === "sent") return "ok";
  if (s === "pending") return "warn";
  if (s === "failed") return "err";
  return void 0;
}
function Review() {
  const [tab, setTab2] = (0, import_react12.useState)("queue");
  return React16.createElement(
    "div",
    null,
    React16.createElement(PageHead, { title: "\u5BA2\u670D\u5BA1\u6838", sub: "WhatsApp \u6D88\u606F\u4EBA\u5DE5\u786E\u8BA4\u540E\u53D1\u9001\uFF0CAI \u4EC5\u8D77\u8349" }),
    React16.createElement(
      "div",
      { className: "twb-toolbar" },
      React16.createElement(Segmented, {
        value: tab,
        options: [["queue", "\u5BA1\u6838\u961F\u5217"], ["broadcast", "\u53D7\u63A7\u7FA4\u53D1"]],
        onChange: (v) => setTab2(v)
      })
    ),
    tab === "queue" ? React16.createElement(QueuePane, null) : React16.createElement(BroadcastPane, null)
  );
}
function QueuePane() {
  const [rows, setRows] = (0, import_react12.useState)([]);
  const [busy, setBusy] = (0, import_react12.useState)(false);
  const [filter, setFilter] = (0, import_react12.useState)("pending");
  const reload = React16.useCallback(() => {
    const p = filter === "pending" ? leads.waQueue() : leads.waMessages(100);
    p.then((r) => setRows(Array.isArray(r) ? r : [])).catch((e) => {
      toasts.push("\u52A0\u8F7D\u5BA1\u6838\u961F\u5217\u5931\u8D25\uFF1A" + e.message);
    });
  }, [filter]);
  (0, import_react12.useEffect)(() => {
    reload();
  }, [reload]);
  const setDraft = (id, draft) => {
    setRows(rows.map((r) => r.id === id ? { ...r, draft } : r));
  };
  const act = async () => {
    setBusy(true);
    try {
      toasts.push("\u53D1\u9001\u52A8\u4F5C\u7531\u5BF9\u8BDD\u4E2D\u7684 AI \u6267\u884C\uFF08wa_reply \u5DE5\u5177\uFF0C\u542B\u9891\u63A7\u4E0E\u5BA1\u8BA1\uFF09", "ok");
    } finally {
      setBusy(false);
    }
  };
  const pending = rows.filter((r) => r.status === "pending");
  return React16.createElement(
    "div",
    null,
    React16.createElement(
      "div",
      { className: "twb-toolbar" },
      React16.createElement(Segmented, {
        value: filter,
        options: [["pending", `\u5F85\u5BA1 ${pending.length}`], ["all", "\u5168\u90E8"]],
        onChange: (v) => setFilter(v)
      }),
      React16.createElement("button", { className: "twb-btn secondary sm", onClick: reload }, "\u5237\u65B0")
    ),
    rows.length === 0 ? React16.createElement(Empty, {
      title: filter === "pending" ? "\u6682\u65E0\u5F85\u5BA1\u6D88\u606F" : "\u6682\u65E0\u6D88\u606F\u8BB0\u5F55",
      desc: filter === "pending" ? "WhatsApp \u6536\u5230\u65B0\u6D88\u606F\u540E\u4F1A\u81EA\u52A8\u8FDB\u961F\u5217\uFF1B\u4E5F\u53EF\u7528\u300C\u53D7\u63A7\u7FA4\u53D1\u300D\u4E3B\u52A8\u53D1\u8D77\u3002" : "\u914D\u7F6E Evolution \u7F51\u5173\u540E\uFF0C\u804A\u5929\u8BB0\u5F55\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002"
    }) : React16.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 12 } },
      rows.map((m) => React16.createElement(
        "div",
        {
          key: m.id,
          style: {
            border: "1px solid var(--twb-line)",
            borderRadius: "var(--twb-r)",
            background: "var(--twb-raised)",
            overflow: "hidden",
            maxWidth: 760
          }
        },
        React16.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderBottom: "1px solid var(--twb-hairline)",
              background: "var(--twb-sunken)"
            }
          },
          React16.createElement(
            "span",
            { style: { fontWeight: 600, fontSize: 12.5, color: "var(--twb-fg)" } },
            m.from ?? m.chatId ?? "\u672A\u77E5\u53D1\u9001\u65B9"
          ),
          React16.createElement(Badge, { tone: tone2(m.status) }, STATUS_LABEL2[m.status] ?? m.status ?? "-"),
          React16.createElement(
            "span",
            { className: "twb-mono twb-dim", style: { marginLeft: "auto" } },
            String(m.ts ?? "").slice(0, 19).replace("T", " ")
          )
        ),
        React16.createElement(
          "div",
          { style: { padding: 14 } },
          React16.createElement("div", {
            style: {
              background: "var(--twb-sunken)",
              border: "1px solid var(--twb-line)",
              borderRadius: "12px 12px 12px 3px",
              padding: "10px 13px",
              fontSize: 12.5,
              lineHeight: 1.7,
              marginBottom: 12,
              whiteSpace: "pre-wrap",
              color: "var(--twb-fg-2)",
              maxWidth: 560
            }
          }, m.text ?? m.body ?? ""),
          React16.createElement(
            "div",
            { className: "twb-field" },
            React16.createElement("label", null, "AI \u8349\u7A3F / \u56DE\u590D\u5185\u5BB9"),
            React16.createElement(TextArea, {
              rows: 3,
              value: m.draft ?? "",
              onChange: (e) => setDraft(m.id, e.target.value),
              placeholder: "\u5728\u6B64\u7F16\u8F91\u56DE\u590D\u5185\u5BB9\u2026"
            })
          ),
          React16.createElement(
            "div",
            { style: { display: "flex", gap: 8, alignItems: "center" } },
            React16.createElement("button", { className: "twb-btn sm", disabled: busy, onClick: act }, "\u786E\u8BA4\u53D1\u9001"),
            React16.createElement("button", { className: "twb-btn secondary sm", disabled: busy, onClick: act }, "\u8DF3\u8FC7"),
            React16.createElement(
              "span",
              { className: "twb-dim", style: { marginLeft: 4 } },
              "\u5B9E\u9645\u53D1\u9001\u7531 wa_reply \u5DE5\u5177\u6267\u884C\uFF08\u542B\u9891\u63A7\u4E0E\u5BA1\u8BA1\uFF09"
            )
          )
        )
      ))
    )
  );
}
function BroadcastPane() {
  const [text, setText] = (0, import_react12.useState)("");
  const [status, setStatus] = (0, import_react12.useState)("qualified");
  const [limit, setLimit] = (0, import_react12.useState)(30);
  const [preview, setPreview] = (0, import_react12.useState)(null);
  const [result, setResult] = (0, import_react12.useState)(null);
  const [busy, setBusy] = (0, import_react12.useState)(false);
  const doPreview = async () => {
    if (!text.trim()) {
      toasts.push("\u5148\u5199\u8981\u53D1\u9001\u7684\u5185\u5BB9");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      setPreview(await leads.waBroadcastPreview(text.trim(), { status, limit }));
    } catch (e) {
      toasts.push("\u9884\u89C8\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const doSend = async () => {
    if (!preview?.targets?.length) return;
    setBusy(true);
    try {
      const r = await leads.waBroadcastExecute(text.trim(), preview.targets);
      setResult(r);
      setPreview(null);
      toasts.push("\u5E7F\u64AD\u5DF2\u6267\u884C", "ok");
    } catch (e) {
      toasts.push("\u53D1\u9001\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const overCap = preview && preview.sentToday + preview.targets.length > preview.cap;
  const resultPane = result ? renderResult(result) : null;
  return React16.createElement(
    "div",
    null,
    React16.createElement(
      "div",
      {
        style: {
          padding: 13,
          marginBottom: 16,
          border: "1px solid var(--twb-line)",
          borderRadius: "var(--twb-r)",
          background: "var(--twb-raised)",
          maxWidth: 780
        }
      },
      React16.createElement(
        "div",
        { className: "twb-muted", style: { marginBottom: 12, lineHeight: 1.7 } },
        "\u7FA4\u53D1\u6709\u968F\u673A\u95F4\u9694\u4E0E\u6BCF\u65E5\u4E0A\u9650\u4FDD\u62A4\uFF0C\u8FDE\u7EED 3 \u6B21\u5931\u8D25\u4F1A\u7194\u65AD\u3002\u4ECD\u5C5E\u9AD8\u98CE\u9669\u64CD\u4F5C \u2014\u2014 \u52A1\u5FC5\u5148\u9884\u89C8\u786E\u8BA4\u6536\u4EF6\u4EBA\u540D\u5355\u3002"
      ),
      React16.createElement(
        Field,
        { label: "\u6D88\u606F\u5185\u5BB9" },
        React16.createElement(TextArea, {
          rows: 4,
          value: text,
          onChange: (e) => {
            setText(e.target.value);
            setPreview(null);
          },
          placeholder: "Hi {name}, we noticed you're sourcing\u2026\uFF08\u5EFA\u8BAE\u7B80\u77ED\u3001\u5E26\u660E\u786E\u4EF7\u503C\u70B9\uFF09"
        })
      ),
      React16.createElement(
        "div",
        { style: { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" } },
        React16.createElement(
          Field,
          { label: "\u53EA\u53D1\u7ED9\u5904\u4E8E\u6B64\u72B6\u6001\u7684\u7EBF\u7D22" },
          React16.createElement(
            "select",
            {
              className: "twb-select",
              value: status,
              onChange: (e) => {
                setStatus(e.target.value);
                setPreview(null);
              }
            },
            [["qualified", "\u5DF2\u8BC4\u4F30"], ["contacted", "\u5DF2\u89E6\u8FBE"], ["replied", "\u5DF2\u56DE\u590D"], ["", "\u4E0D\u9650"]].map(([v, l]) => React16.createElement("option", { key: v, value: v }, l))
          )
        ),
        React16.createElement(
          Field,
          { label: "\u672C\u6B21\u6700\u591A\u53D1\u9001" },
          React16.createElement(TextInput, {
            type: "number",
            min: 1,
            max: 100,
            value: limit,
            onChange: (e) => {
              setLimit(Number(e.target.value) || 30);
              setPreview(null);
            },
            style: { width: 96, minWidth: 96 }
          })
        ),
        React16.createElement(
          "div",
          { style: { marginBottom: 12 } },
          React16.createElement(
            "button",
            { className: "twb-btn secondary", onClick: doPreview, disabled: busy },
            busy ? "\u7EDF\u8BA1\u4E2D\u2026" : "\u9884\u89C8\u6536\u4EF6\u4EBA"
          )
        )
      )
    ),
    preview ? React16.createElement(
      React16.Fragment,
      null,
      React16.createElement(
        "div",
        { className: "twb-cards", style: { maxWidth: 780 } },
        React16.createElement(StatCard, { label: "\u5C06\u53D1\u9001", value: preview.targets.length, tone: "accent" }),
        React16.createElement(StatCard, { label: "\u6709\u53F7\u7801\u7EBF\u7D22", value: preview.total }),
        React16.createElement(StatCard, {
          label: "\u4ECA\u65E5\u5DF2\u53D1",
          value: preview.sentToday,
          tone: overCap ? "err" : "ok",
          sub: `\u4E0A\u9650 ${preview.cap}`
        }),
        React16.createElement(StatCard, {
          label: "\u9884\u8BA1\u8017\u65F6",
          value: Math.ceil(preview.targets.length * ((preview.minDelaySec + preview.maxDelaySec) / 2) / 60) + " \u5206\u949F",
          sub: `\u95F4\u9694 ${preview.minDelaySec}\u2013${preview.maxDelaySec} \u79D2`
        })
      ),
      overCap ? React16.createElement("div", {
        style: {
          padding: "10px 13px",
          marginBottom: 14,
          maxWidth: 780,
          border: "1px solid color-mix(in srgb, var(--twb-err) 34%, transparent)",
          borderRadius: "var(--twb-r-sm)",
          background: "var(--twb-err-dim)",
          color: "var(--twb-err)",
          fontSize: 12
        }
      }, `\u4ECA\u65E5\u989D\u5EA6\u4E0D\u8DB3\uFF1A\u5DF2\u53D1 ${preview.sentToday} + \u672C\u6B21 ${preview.targets.length} \u8D85\u8FC7\u4E0A\u9650 ${preview.cap}\uFF0C\u8D85\u51FA\u90E8\u5206\u4F1A\u88AB\u81EA\u52A8\u8DF3\u8FC7\u3002`) : null,
      React16.createElement(
        Section,
        { title: "\u6536\u4EF6\u4EBA\u540D\u5355\uFF08\u786E\u8BA4\u540E\u518D\u53D1\u9001\uFF09" },
        React16.createElement(
          Table,
          { head: ["\u53F7\u7801", "\u516C\u53F8"] },
          preview.targets.map((t, i) => React16.createElement(
            "tr",
            { key: i },
            React16.createElement("td", { className: "mono", style: { color: "var(--twb-fg)" } }, t.number),
            React16.createElement("td", { className: "twb-muted" }, t.company || "\u2014")
          ))
        )
      ),
      React16.createElement(
        "div",
        { className: "twb-toolbar", style: { marginTop: 14 } },
        React16.createElement("button", {
          className: "twb-btn danger",
          onClick: doSend,
          disabled: busy
        }, busy ? "\u53D1\u9001\u4E2D\u2026" : `\u786E\u8BA4\u53D1\u9001\u7ED9 ${preview.targets.length} \u4E2A\u53F7\u7801`),
        React16.createElement("button", {
          className: "twb-btn secondary",
          onClick: () => setPreview(null)
        }, "\u53D6\u6D88"),
        React16.createElement("span", { className: "twb-dim" }, "\u53D6\u6D88\u4E0D\u4F1A\u4EA7\u751F\u4EFB\u4F55\u53D1\u9001")
      )
    ) : null,
    result ? resultPane : null
  );
}
function renderResult(result) {
  const ok = result.sent ?? (result.results ?? []).filter((r) => !r.skipped && !r.error).length;
  const skip = result.skipped ?? (result.results ?? []).filter((r) => r.skipped).length;
  const fail = result.failed ?? (result.results ?? []).filter((r) => r.error).length;
  return React16.createElement(
    Section,
    { title: "\u53D1\u9001\u7ED3\u679C" },
    React16.createElement(
      "div",
      { style: { maxWidth: 780 } },
      React16.createElement(KeyValue, {
        rows: [["\u6210\u529F", String(ok)], ["\u8DF3\u8FC7", String(skip)], ["\u5931\u8D25", String(fail)]]
      }),
      React16.createElement("pre", {
        className: "twb-pre",
        style: { marginTop: 12, maxHeight: 240, overflow: "auto" }
      }, JSON.stringify(result, null, 2))
    )
  );
}

// src/client/panels/Templates.tsx
var React17 = __toESM(require("react"), 1);
var LANGS = [["en", "\u82F1\u8BED"], ["es", "\u897F\u8BED"], ["pt", "\u8461\u8BED"], ["zh", "\u4E2D\u6587"]];
var langLabel = (k) => (LANGS.find(([v]) => v === k) ?? [, k ?? "-"])[1];
function Templates() {
  const [rows, setRows] = React17.useState([]);
  const [editing, setEditing] = React17.useState(null);
  const [busy, setBusy] = React17.useState(false);
  const reload = React17.useCallback(() => {
    leads.templatesList().then((r) => setRows(Array.isArray(r) ? r : [])).catch(() => setRows([]));
  }, []);
  React17.useEffect(() => {
    reload();
  }, [reload]);
  const blank = { name: "", language: "en", subject: "", body: "", tags: [] };
  const save = async () => {
    if (!editing?.name?.trim()) {
      toasts.push("\u6A21\u677F\u8981\u6709\u4E2A\u540D\u5B57");
      return;
    }
    setBusy(true);
    try {
      await leads.templatesSave(editing);
      toasts.push("\u5DF2\u4FDD\u5B58", "ok");
      setEditing(null);
      reload();
    } catch (e) {
      toasts.push("\u4FDD\u5B58\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    try {
      await leads.templatesDelete(id);
      toasts.push("\u5DF2\u5220\u9664", "ok");
      reload();
    } catch (e) {
      toasts.push("\u5220\u9664\u5931\u8D25\uFF1A" + e.message);
    }
  };
  return React17.createElement(
    "div",
    null,
    React17.createElement(PageHead, { title: "\u90AE\u4EF6\u6A21\u677F", sub: "\u5F00\u53D1\u4FE1\u6A21\u677F \xB7 \u652F\u6301\u53D8\u91CF\u4E0E spintax \u53D8\u4F53" }),
    React17.createElement(
      "div",
      { className: "twb-toolbar" },
      React17.createElement("button", { className: "twb-btn", onClick: () => setEditing({ ...blank }) }, "+ \u65B0\u5EFA\u6A21\u677F"),
      React17.createElement("span", { className: "spacer" }),
      React17.createElement("span", { className: "twb-muted" }, `\u5171 ${rows.length} \u4E2A\u6A21\u677F`)
    ),
    rows.length === 0 ? React17.createElement(Empty, {
      title: "\u8FD8\u6CA1\u6709\u6A21\u677F",
      desc: "\u65B0\u5EFA\u4E00\u4E2A\u6A21\u677F\u4F5C\u4E3A\u5F00\u53D1\u4FE1\u5E95\u7A3F\u3002\u53D1\u9001\u65F6\u53EF\u7528 {Name} {Company} \u53D8\u91CF\uFF0C\u4EE5\u53CA {Hi|Hello|Hey} \u8FD9\u7C7B\u968F\u673A\u53D8\u4F53\u3002",
      action: React17.createElement("button", { className: "twb-btn", onClick: () => setEditing({ ...blank }) }, "\u65B0\u5EFA\u7B2C\u4E00\u4E2A\u6A21\u677F")
    }) : React17.createElement(
      Table,
      { head: ["\u540D\u79F0", "\u8BED\u8A00", "\u4E3B\u9898", "\u4F7F\u7528\u6B21\u6570", ""] },
      rows.map((t) => React17.createElement(
        "tr",
        { key: t.id },
        React17.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, t.name ?? "-"),
        React17.createElement("td", null, React17.createElement(Badge, { plain: true }, langLabel(t.language))),
        React17.createElement("td", { className: "twb-muted", style: { maxWidth: 320 } }, (t.subject ?? "").slice(0, 60) || "\u2014"),
        React17.createElement("td", { className: "num" }, String(t.usedCount ?? t.uses ?? 0)),
        React17.createElement(
          "td",
          { style: { width: 110, textAlign: "right" } },
          React17.createElement("button", { className: "twb-btn secondary sm", style: { marginRight: 6 }, onClick: () => setEditing({ ...t }) }, "\u7F16\u8F91"),
          React17.createElement("button", { className: "twb-btn ghost sm", onClick: () => remove(t.id) }, "\u5220\u9664")
        )
      ))
    ),
    editing ? React17.createElement(
      React17.Fragment,
      null,
      React17.createElement("div", { className: "twb-drawer-mask", onClick: () => setEditing(null) }),
      React17.createElement(
        "div",
        { className: "twb-drawer" },
        React17.createElement(
          "header",
          null,
          React17.createElement(
            "div",
            null,
            React17.createElement("div", { className: "h" }, editing.id ? "\u7F16\u8F91\u6A21\u677F" : "\u65B0\u5EFA\u6A21\u677F"),
            React17.createElement("div", { className: "s" }, "\u53D8\u91CF\u4E0E spintax \u4F1A\u5728\u53D1\u9001\u65F6\u5C55\u5F00")
          ),
          React17.createElement("button", { className: "twb-btn secondary sm", onClick: () => setEditing(null) }, "\u5173\u95ED")
        ),
        React17.createElement(
          "div",
          { className: "content" },
          React17.createElement(
            "div",
            { className: "twb-grid2" },
            React17.createElement(
              Field,
              { label: "\u540D\u79F0" },
              React17.createElement(TextInput, {
                value: editing.name ?? "",
                onChange: (e) => setEditing({ ...editing, name: e.target.value })
              })
            ),
            React17.createElement(
              Field,
              { label: "\u8BED\u8A00" },
              React17.createElement(Select, {
                value: editing.language ?? "en",
                onChange: (e) => setEditing({ ...editing, language: e.target.value })
              }, LANGS.map(([k, v]) => React17.createElement("option", { key: k, value: k }, v)))
            )
          ),
          React17.createElement(
            Field,
            { label: "\u4E3B\u9898" },
            React17.createElement(TextInput, {
              value: editing.subject ?? "",
              onChange: (e) => setEditing({ ...editing, subject: e.target.value }),
              placeholder: "\u5982 {Company} - our stainless bottles"
            })
          ),
          React17.createElement(
            Field,
            { label: "\u6B63\u6587" },
            React17.createElement(TextArea, {
              rows: 14,
              value: editing.body ?? "",
              style: { minHeight: 280, fontFamily: "inherit" },
              onChange: (e) => setEditing({ ...editing, body: e.target.value }),
              placeholder: "\u652F\u6301 {Name} {Company} \u53D8\u91CF\u4E0E {a|b|c} spintax \u53D8\u4F53"
            }),
            "\u53D8\u91CF\uFF1A{Name} {Company} {Country}\u3000\xB7\u3000Spintax\uFF1A{Hi|Hello|Hey} \u53D1\u9001\u65F6\u968F\u673A\u9009\u4E00\u4E2A"
          ),
          React17.createElement(
            "button",
            { className: "twb-btn", onClick: save, disabled: busy },
            busy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u6A21\u677F"
          )
        )
      )
    ) : null
  );
}

// src/client/panels/Sop.tsx
var React18 = __toESM(require("react"), 1);
var import_react13 = require("react");
var STAGES2 = ["parse", "discover", "enrich", "score", "draft", "approve", "outreach", "close"];
var STAGE_CN3 = {
  parse: "\u89E3\u6790\u9700\u6C42",
  discover: "\u641C\u7D22\u7EBF\u7D22",
  enrich: "\u52A0\u5DE5\u7EBF\u7D22",
  score: "\u8BC4\u4F30\u6253\u5206",
  draft: "\u751F\u6210\u8349\u7A3F",
  approve: "\u4EBA\u5DE5\u5BA1\u6279",
  outreach: "\u89E6\u8FBE",
  close: "\u7ED3\u6848"
};
function stageIndex(s) {
  const i = STAGES2.indexOf(s ?? "parse");
  return i < 0 ? 0 : i;
}
function Sop() {
  const [rows, setRows] = (0, import_react13.useState)([]);
  const [goal, setGoal] = (0, import_react13.useState)("");
  const [product, setProduct] = (0, import_react13.useState)("");
  const [market, setMarket] = (0, import_react13.useState)("");
  const [detail, setDetail] = (0, import_react13.useState)(null);
  const [busy, setBusy] = (0, import_react13.useState)(false);
  const reload = React18.useCallback(() => {
    leads.sopList().then((r) => setRows(Array.isArray(r) ? r : [])).catch((e) => toasts.push("\u52A0\u8F7D\u5931\u8D25\uFF1A" + e.message));
  }, []);
  React18.useEffect(() => {
    reload();
  }, [reload]);
  const create = async () => {
    if (!goal.trim()) {
      toasts.push("\u5148\u5199\u6E05\u76EE\u6807\uFF0C\u5982\uFF1A\u5F00\u53D1 3 \u4E2A\u58A8\u897F\u54E5\u7535\u5439\u98CE\u4E70\u5BB6");
      return;
    }
    setBusy(true);
    try {
      await leads.sopCreate({ goal: goal.trim(), product, market });
      toasts.push("SOP \u4EFB\u52A1\u5DF2\u521B\u5EFA", "ok");
      setGoal("");
      setProduct("");
      setMarket("");
      reload();
    } catch (e) {
      toasts.push("\u521B\u5EFA\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const openDetail = async (task) => {
    try {
      setDetail(await leads.sopStatus(task.id));
    } catch (e) {
      toasts.push("\u52A0\u8F7D\u8BE6\u60C5\u5931\u8D25\uFF1A" + e.message);
    }
  };
  const advance = async (id) => {
    try {
      await leads.sopNext(id);
      toasts.push("\u5DF2\u63A8\u8FDB\u5230\u4E0B\u4E00\u9636\u6BB5", "ok");
      reload();
      if (detail?.id === id) setDetail(await leads.sopStatus(id));
    } catch (e) {
      toasts.push("\u63A8\u8FDB\u5931\u8D25\uFF1A" + e.message);
    }
  };
  const approve = async (id, hash) => {
    try {
      await leads.sopApprove(id, hash);
      toasts.push("\u8349\u7A3F\u5DF2\u5BA1\u6279\u901A\u8FC7", "ok");
      reload();
      setDetail(await leads.sopStatus(id));
    } catch (e) {
      toasts.push("\u5BA1\u6279\u5931\u8D25\uFF1A" + e.message);
    }
  };
  return React18.createElement(
    "div",
    null,
    React18.createElement(PageHead, {
      title: "SOP \u9636\u6BB5\u673A",
      sub: "\u516B\u9636\u6BB5\u5F3A\u5236\u987A\u5E8F \xB7 \u5F00\u53D1\u4FE1\u53D1\u9001\u524D\u5FC5\u987B\u4EBA\u5DE5\u5BA1\u6279\uFF08\u8349\u7A3F\u6539\u52A8\u5373\u5931\u6548\uFF09"
    }),
    React18.createElement(
      "div",
      {
        style: {
          padding: 13,
          marginBottom: 18,
          border: "1px solid var(--twb-line)",
          borderRadius: "var(--twb-r)",
          background: "var(--twb-raised)"
        }
      },
      React18.createElement(
        "div",
        { style: { display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" } },
        React18.createElement(
          Field,
          { label: "\u76EE\u6807 *" },
          React18.createElement(TextInput, {
            placeholder: "\u5F00\u53D1 3 \u4E2A\u58A8\u897F\u54E5\u7535\u5439\u98CE\u4E70\u5BB6",
            value: goal,
            onChange: (e) => setGoal(e.target.value),
            style: { minWidth: 300 },
            onKeyDown: (e) => {
              if (e.key === "Enter") create();
            }
          })
        ),
        React18.createElement(
          Field,
          { label: "\u4EA7\u54C1" },
          React18.createElement(TextInput, { placeholder: "hair dryer", value: product, onChange: (e) => setProduct(e.target.value), style: { minWidth: 160 } })
        ),
        React18.createElement(
          Field,
          { label: "\u5E02\u573A" },
          React18.createElement(TextInput, { placeholder: "Mexico", value: market, onChange: (e) => setMarket(e.target.value), style: { minWidth: 120 } })
        ),
        React18.createElement(
          "div",
          { style: { marginBottom: 12 } },
          React18.createElement(
            "button",
            { className: "twb-btn", onClick: create, disabled: busy },
            busy ? "\u521B\u5EFA\u4E2D\u2026" : "\u65B0\u5EFA SOP \u4EFB\u52A1"
          )
        )
      )
    ),
    React18.createElement(
      "div",
      { style: { display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 18 } },
      STAGES2.map((s, i) => React18.createElement(
        "div",
        {
          key: s,
          style: {
            flex: "1 1 90px",
            padding: "8px 10px",
            textAlign: "center",
            border: "1px solid var(--twb-line)",
            borderRadius: "var(--twb-r-sm)",
            background: "var(--twb-sunken)",
            fontSize: 11,
            color: s === "approve" ? "var(--twb-accent)" : "var(--twb-fg-3)",
            borderColor: s === "approve" ? "var(--twb-accent-line)" : void 0
          }
        },
        React18.createElement("div", { style: { fontFamily: "var(--twb-mono)", fontSize: 10, opacity: 0.5, marginBottom: 2 } }, String(i + 1)),
        STAGE_CN3[s]
      ))
    ),
    rows.length === 0 ? React18.createElement(Empty, {
      title: "\u8FD8\u6CA1\u6709 SOP \u4EFB\u52A1",
      desc: "SOP \u628A\u300C\u641C\u7EBF\u7D22 \u2192 \u8BC4\u5206 \u2192 \u5199\u4FE1 \u2192 \u5BA1\u6279 \u2192 \u89E6\u8FBE \u2192 \u7ED3\u6848\u300D\u4E32\u6210\u5F3A\u5236\u6D41\u7A0B\uFF0C\u9632\u6B62\u8DF3\u6B65\u6F0F\u5BA1\u3002"
    }) : React18.createElement(
      Table,
      { head: ["\u76EE\u6807", "\u5F53\u524D\u9636\u6BB5", "\u8FDB\u5EA6", "\u72B6\u6001", ""] },
      rows.map((t) => {
        const idx = stageIndex(t.stage);
        return React18.createElement(
          "tr",
          { key: t.id, className: "row", onClick: () => openDetail(t) },
          React18.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, t.goal ?? "-"),
          React18.createElement(
            "td",
            null,
            React18.createElement(
              Badge,
              { plain: true, tone: t.stage === "approve" ? "accent" : void 0 },
              STAGE_CN3[t.stage] ?? t.stage ?? "-"
            )
          ),
          React18.createElement(
            "td",
            { style: { width: 130 } },
            React18.createElement(
              "div",
              { className: "twb-bar-track" },
              React18.createElement("div", { className: "twb-bar", style: { width: (idx + 1) / STAGES2.length * 100 + "%" } })
            )
          ),
          React18.createElement(
            "td",
            null,
            React18.createElement(Badge, { tone: t.closed ? "ok" : "warn" }, t.closed ? "\u5DF2\u7ED3\u6848" : "\u8FDB\u884C\u4E2D")
          ),
          React18.createElement(
            "td",
            { style: { width: 70, textAlign: "right" } },
            React18.createElement("button", {
              className: "twb-btn secondary sm",
              onClick: (e) => {
                e.stopPropagation();
                advance(t.id);
              }
            }, "\u63A8\u8FDB")
          )
        );
      })
    ),
    detail ? React18.createElement(
      React18.Fragment,
      null,
      React18.createElement("div", { className: "twb-drawer-mask", onClick: () => setDetail(null) }),
      React18.createElement(
        "div",
        { className: "twb-drawer" },
        React18.createElement(
          "header",
          null,
          React18.createElement(
            "div",
            null,
            React18.createElement("div", { className: "h" }, detail.goal ?? "SOP \u4EFB\u52A1"),
            React18.createElement("div", { className: "s" }, `\u5F53\u524D\uFF1A${STAGE_CN3[detail.stage] ?? detail.stage}`)
          ),
          React18.createElement("button", { className: "twb-btn secondary sm", onClick: () => setDetail(null) }, "\u5173\u95ED")
        ),
        React18.createElement(
          "div",
          { className: "content" },
          React18.createElement(
            Section,
            { title: "\u9636\u6BB5\u8FDB\u5EA6" },
            React18.createElement(
              "div",
              { className: "twb-steps" },
              STAGES2.map((s, i) => React18.createElement("div", {
                key: s,
                className: "twb-step" + (i <= stageIndex(detail.stage) ? " done" : ""),
                style: { cursor: "default" }
              }, `${i + 1}. ${STAGE_CN3[s]}`))
            )
          ),
          detail.drafts?.length ? React18.createElement(
            Section,
            { title: "\u5F85\u5BA1\u6279\u8349\u7A3F" },
            detail.drafts.map((d, i) => React18.createElement(
              "div",
              {
                key: i,
                style: {
                  border: "1px solid var(--twb-line)",
                  borderRadius: "var(--twb-r-sm)",
                  padding: 12,
                  marginBottom: 10,
                  background: "var(--twb-sunken)"
                }
              },
              React18.createElement(
                "div",
                { style: { fontWeight: 600, fontSize: 12.5, marginBottom: 6 } },
                d.subject || d.to || `\u8349\u7A3F #${i + 1}`
              ),
              React18.createElement(
                "div",
                { className: "twb-pre", style: { maxHeight: 200, overflow: "auto", marginBottom: 8 } },
                d.body ?? d.text ?? ""
              ),
              React18.createElement(
                "div",
                { style: { display: "flex", gap: 8, alignItems: "center" } },
                React18.createElement(Badge, { tone: d.approved ? "ok" : "warn" }, d.approved ? "\u5DF2\u5BA1\u6279" : "\u5F85\u5BA1\u6279"),
                React18.createElement("button", {
                  className: "twb-btn sm",
                  disabled: d.approved,
                  onClick: () => approve(detail.id, d.hash)
                }, "\u5BA1\u6279\u901A\u8FC7"),
                React18.createElement(
                  "span",
                  { className: "twb-dim" },
                  "\u5BA1\u6279\u540E\u5982\u518D\u6539\u52A8\u6B63\u6587\uFF0C\u5BA1\u6279\u81EA\u52A8\u5931\u6548"
                )
              )
            ))
          ) : null,
          React18.createElement(
            Section,
            { title: "\u4EFB\u52A1\u4FE1\u606F" },
            React18.createElement(KeyValue, {
              rows: [
                ["\u4EFB\u52A1 ID", React18.createElement("span", { className: "twb-mono" }, detail.id ?? "-")],
                ["\u4EA7\u54C1", detail.product || "\u2014"],
                ["\u5E02\u573A", detail.market || "\u2014"],
                ["\u521B\u5EFA\u65F6\u95F4", String(detail.createdAt ?? "").slice(0, 19).replace("T", " ")]
              ]
            })
          ),
          React18.createElement(
            "div",
            { className: "twb-toolbar" },
            React18.createElement("button", {
              className: "twb-btn",
              onClick: () => advance(detail.id)
            }, `\u63A8\u8FDB\u5230\u300C${STAGE_CN3[STAGES2[Math.min(stageIndex(detail.stage) + 1, STAGES2.length - 1)]]}\u300D`),
            React18.createElement("button", {
              className: "twb-btn secondary",
              onClick: async () => {
                try {
                  await leads.sopClose(detail.id);
                  toasts.push("\u5DF2\u7ED3\u6848", "ok");
                  reload();
                  setDetail(null);
                } catch (e) {
                  toasts.push(e.message);
                }
              }
            }, "\u7ED3\u6848")
          )
        )
      )
    ) : null
  );
}

// src/client/panels/Mail.tsx
var React19 = __toESM(require("react"), 1);
var import_react14 = require("react");
var LANGS2 = [["en", "\u82F1\u8BED"], ["es", "\u897F\u8BED"], ["pt", "\u8461\u8BED"]];
function Mail() {
  const [pool, setPool] = (0, import_react14.useState)([]);
  const [picked, setPicked] = (0, import_react14.useState)(null);
  const [lang, setLang] = (0, import_react14.useState)("en");
  const [kind, setKind] = (0, import_react14.useState)("first");
  const [draft, setDraft] = (0, import_react14.useState)(null);
  const [busy, setBusy] = (0, import_react14.useState)(false);
  const [sm, setSm] = (0, import_react14.useState)(null);
  const [tab, setTab2] = (0, import_react14.useState)("compose");
  (0, import_react14.useEffect)(() => {
    leads.crmList("").then((r) => {
      const list = Array.isArray(r) ? r : r?.leads ?? [];
      setPool(list);
      if (!picked && list.length) setPicked(list[0]);
    }).catch(() => {
    });
    leads.configSummary().then(setSm).catch(() => {
    });
  }, []);
  const dryRun = sm?.smtp?.dryRun !== false;
  const emails = picked?.contacts?.emails ?? [];
  const to = emails[0] ?? "";
  const compose = async () => {
    if (!picked) {
      toasts.push("\u5148\u9009\u4E00\u6761\u7EBF\u7D22");
      return;
    }
    setBusy(true);
    setDraft(null);
    try {
      const r = await leads.emailCompose(picked.id, {
        language: lang,
        kind,
        contactName: picked.contacts?.contact
      });
      setDraft(r);
    } catch (e) {
      toasts.push("\u751F\u6210\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const send = async () => {
    if (!to) {
      toasts.push("\u7EBF\u7D22\u6CA1\u6709\u90AE\u7BB1\uFF0C\u5148\u53BB\u300C\u90AE\u7BB1\u9A8C\u8BC1\u300D\u627E");
      return;
    }
    if (!draft?.subject) {
      toasts.push("\u5148\u751F\u6210\u6216\u586B\u5199\u8349\u7A3F");
      return;
    }
    setBusy(true);
    try {
      const r = await leads.emailSend({
        to,
        subject: draft.subject,
        text: draft.body ?? draft.text ?? ""
      });
      toasts.push(dryRun ? "\u5DF2\u5199\u5165\u9884\u89C8\uFF08dry-run \u6A21\u5F0F\uFF0C\u672A\u771F\u53D1\uFF09" : "\u90AE\u4EF6\u5DF2\u53D1\u9001", "ok");
    } catch (e) {
      toasts.push("\u53D1\u9001\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const startSeq = async () => {
    if (!picked) return;
    setBusy(true);
    try {
      await leads.seqStart(picked.id, void 0, lang);
      toasts.push(dryRun ? "\u5E8F\u5217\u5DF2\u521B\u5EFA\uFF08\u6F14\u7EC3\u6A21\u5F0F\uFF09" : "\u8DDF\u8FDB\u5E8F\u5217\u5DF2\u542F\u52A8", "ok");
    } catch (e) {
      toasts.push("\u542F\u52A8\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const composePane = () => React19.createElement(
    "div",
    {
      style: { display: "grid", gridTemplateColumns: "minmax(220px, 300px) 1fr", gap: 16, alignItems: "start" }
    },
    React19.createElement(
      "div",
      {
        style: {
          border: "1px solid var(--twb-line)",
          borderRadius: "var(--twb-r)",
          background: "var(--twb-raised)",
          overflow: "hidden"
        }
      },
      React19.createElement("div", {
        style: {
          padding: "9px 12px",
          borderBottom: "1px solid var(--twb-hairline)",
          background: "var(--twb-sunken)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          color: "var(--twb-fg-4)"
        }
      }, `\u7EBF\u7D22\u6C60 \xB7 ${pool.length}`),
      React19.createElement(
        "div",
        { style: { maxHeight: 460, overflow: "auto" } },
        pool.length === 0 ? React19.createElement(
          "div",
          { className: "twb-muted", style: { padding: 16 } },
          "\u7EBF\u7D22\u6C60\u4E3A\u7A7A\uFF0C\u5148\u53BB\u300C\u7EBF\u7D22\u641C\u7D22\u300D\u52A0\u5DE5\u51E0\u6761\u3002"
        ) : pool.map((l) => React19.createElement(
          "div",
          {
            key: l.id,
            onClick: () => {
              setPicked(l);
              setDraft(null);
            },
            style: {
              padding: "9px 12px",
              cursor: "pointer",
              fontSize: 12,
              borderBottom: "1px solid var(--twb-hairline)",
              background: picked?.id === l.id ? "var(--twb-accent-dim)" : void 0,
              borderLeft: picked?.id === l.id ? "2px solid var(--twb-accent)" : "2px solid transparent"
            }
          },
          React19.createElement(
            "div",
            { style: { fontWeight: 550, color: "var(--twb-fg)", marginBottom: 2 } },
            l.company || l.domain || l.id
          ),
          React19.createElement(
            "div",
            { style: { fontSize: 10.5, color: "var(--twb-fg-4)" } },
            [(l.contacts?.emails ?? [])[0] ?? "\u65E0\u90AE\u7BB1", l.market].filter(Boolean).join(" \xB7 ")
          )
        ))
      )
    ),
    React19.createElement("div", null, composeRight())
  );
  const composeRight = () => {
    if (!picked) {
      return React19.createElement(Empty, { title: "\u4ECE\u5DE6\u4FA7\u9009\u4E00\u6761\u7EBF\u7D22", desc: "\u9009\u597D\u7EBF\u7D22\u540E\u5373\u53EF\u751F\u6210\u5F00\u53D1\u4FE1\u3002" });
    }
    const recipient = to ? React19.createElement("div", { className: "twb-dim", style: { marginBottom: 10 } }, "\u6536\u4EF6\u4EBA\uFF1A" + to) : React19.createElement(
      "div",
      { style: { marginBottom: 10 } },
      React19.createElement(Badge, { tone: "err" }, "\u8BE5\u7EBF\u7D22\u6CA1\u6709\u90AE\u7BB1\uFF0C\u9700\u5148\u5230\u300C\u90AE\u7BB1\u9A8C\u8BC1\u300D\u67E5\u627E")
    );
    const editor = draft ? React19.createElement(
      "div",
      null,
      React19.createElement(
        Field,
        { label: "\u4E3B\u9898" },
        React19.createElement(TextInput, {
          value: draft.subject ?? "",
          onChange: (e) => setDraft({ ...draft, subject: e.target.value })
        })
      ),
      React19.createElement(
        Field,
        { label: "\u6B63\u6587" },
        React19.createElement(TextArea, {
          rows: 14,
          value: draft.body ?? draft.text ?? "",
          style: { minHeight: 260, fontFamily: "inherit" },
          onChange: (e) => setDraft({ ...draft, body: e.target.value })
        })
      ),
      React19.createElement(
        "div",
        { className: "twb-toolbar" },
        React19.createElement(
          "button",
          { className: "twb-btn", onClick: send, disabled: busy || !to },
          busy ? "\u53D1\u9001\u4E2D\u2026" : dryRun ? "\u53D1\u9001\uFF08\u6F14\u7EC3\uFF09" : "\u53D1\u9001\u90AE\u4EF6"
        ),
        React19.createElement(
          "button",
          { className: "twb-btn secondary", onClick: startSeq, disabled: busy },
          "\u6539\u4E3A\u6392\u8FDB\u5E8F\u5217"
        ),
        React19.createElement(
          "span",
          { className: "twb-muted" },
          dryRun ? "\u5F53\u524D dry-run\uFF0C\u53EA\u843D\u9884\u89C8\u4E0D\u53D1\u4FE1" : "\u5C06\u771F\u5B9E\u53D1\u51FA\uFF0C\u6CE8\u610F\u65E5\u4E0A\u9650"
        )
      )
    ) : React19.createElement(Empty, {
      title: "\u8FD8\u6CA1\u6709\u8349\u7A3F",
      desc: "\u70B9\u300CAI \u751F\u6210\u8349\u7A3F\u300D\uFF0C\u7CFB\u7EDF\u4F1A\u7ED3\u5408 ICP \u753B\u50CF\u4E0E\u7EBF\u7D22\u4FE1\u606F\u5199\u51FA\u5F00\u53D1\u4FE1\uFF1B\u4E5F\u53EF\u4EE5\u76F4\u63A5\u624B\u5199\u3002",
      action: React19.createElement("button", {
        className: "twb-btn secondary",
        onClick: () => setDraft({ subject: "", body: "" })
      }, "\u624B\u5199\u4E00\u5C01")
    });
    return React19.createElement(
      React19.Fragment,
      null,
      React19.createElement(
        "div",
        { className: "twb-toolbar" },
        React19.createElement(
          Field,
          { label: "\u8BED\u8A00" },
          React19.createElement(Segmented, { value: lang, options: LANGS2, onChange: setLang })
        ),
        React19.createElement(
          Field,
          { label: "\u7C7B\u578B" },
          React19.createElement(Segmented, {
            value: kind,
            options: [["first", "\u9996\u5C01"], ["followup", "\u8DDF\u8FDB"]],
            onChange: setKind
          })
        ),
        React19.createElement("span", { className: "spacer" }),
        React19.createElement(
          "button",
          { className: "twb-btn", onClick: compose, disabled: busy },
          busy ? "\u751F\u6210\u4E2D\u2026" : "AI \u751F\u6210\u8349\u7A3F"
        )
      ),
      recipient,
      editor
    );
  };
  return React19.createElement(
    "div",
    null,
    React19.createElement(PageHead, { title: "\u90AE\u4EF6\u4E2D\u5FC3", sub: "\u5F00\u53D1\u4FE1\u751F\u6210 \u2192 \u9884\u89C8 \u2192 \u53D1\u9001 / \u6392\u8FDB\u8DDF\u8FDB\u5E8F\u5217" }),
    React19.createElement(
      "div",
      { className: "twb-toolbar" },
      React19.createElement(Segmented, {
        value: tab,
        options: [["compose", "\u5199\u90AE\u4EF6"], ["seq", "\u8DDF\u8FDB\u5E8F\u5217"]],
        onChange: (v) => setTab2(v)
      }),
      React19.createElement("span", { className: "spacer" }),
      sm ? React19.createElement(
        Badge,
        { tone: dryRun ? "warn" : "ok" },
        dryRun ? "\u6F14\u7EC3\u6A21\u5F0F\uFF08\u4E0D\u771F\u53D1\uFF09" : "\u771F\u5B9E\u53D1\u9001"
      ) : null
    ),
    tab === "compose" ? composePane() : React19.createElement(SequencePane, { pool, sm, dryRun }),
    React19.createElement(
      Section,
      { title: "\u914D\u7F6E\u72B6\u6001" },
      sm ? React19.createElement(KeyValue, {
        rows: [
          ["SMTP", sm.smtp?.ready ? `\u5DF2\u914D\u7F6E\uFF08${sm.smtp.from}\uFF09` : "\u672A\u914D\u7F6E\uFF0C\u65E0\u6CD5\u53D1\u4FE1"],
          ["\u65E5\u4E0A\u9650", sm.smtp?.dailyCap ? `${sm.smtp.dailyCap} \u5C01/\u5929` : "\u672A\u8BBE\u4E0A\u9650"],
          ["ICP \u753B\u50CF", sm.icp?.ready ? sm.icp.product : "\u672A\u8BBE\u7F6E\uFF0CAI \u4E0D\u77E5\u9053\u4F60\u5356\u4EC0\u4E48"],
          ["DeepSeek", sm.deepseek?.ready ? "\u5DF2\u914D\u7F6E" : "\u672A\u914D\u7F6E\uFF0C\u53EA\u80FD\u7528\u6A21\u677F\u515C\u5E95"]
        ]
      }) : React19.createElement("div", { className: "twb-muted" }, "\u52A0\u8F7D\u4E2D\u2026")
    )
  );
}
function SequencePane(props) {
  return React19.createElement(
    "div",
    null,
    React19.createElement(
      "div",
      {
        style: {
          padding: 13,
          marginBottom: 16,
          border: "1px solid var(--twb-line)",
          borderRadius: "var(--twb-r)",
          background: "var(--twb-raised)"
        }
      },
      React19.createElement(
        "div",
        { className: "twb-muted", style: { lineHeight: 1.8 } },
        React19.createElement("div", null, "\u8DDF\u8FDB\u5E8F\u5217\u6309 Day 0 / 3 / 7 / 14 \u56DB\u6B65\u81EA\u52A8\u8DDF\u8FDB\uFF0C\u56DE\u590D\u5373\u505C\u3002"),
        React19.createElement("div", null, "\u53D1\u9001\u53EA\u5728\u6536\u4EF6\u4EBA\u5F53\u5730\u65F6\u95F4\u5DE5\u4F5C\u65E5 9\u201319 \u70B9\u8FDB\u884C\uFF0C\u7A97\u5916\u81EA\u52A8\u987A\u5EF6\u3002"),
        React19.createElement("div", null, props.dryRun ? "\u5F53\u524D\u6F14\u7EC3\u6A21\u5F0F\uFF1A\u5E8F\u5217\u53EA\u6807\u8BB0\u4E0D\u771F\u53D1\u3002" : "\u5F53\u524D\u771F\u5B9E\u53D1\u9001\uFF1A\u53D7\u65E5\u4E0A\u9650\u4E0E\u90AE\u7BB1\u603B\u4E0A\u9650\u4FDD\u62A4\u3002")
      )
    ),
    props.pool.length === 0 ? React19.createElement(Empty, { title: "\u7EBF\u7D22\u6C60\u4E3A\u7A7A", desc: "\u5148\u52A0\u5DE5\u51E0\u6761\u7EBF\u7D22\uFF0C\u518D\u56DE\u6765\u542F\u52A8\u5E8F\u5217\u3002" }) : React19.createElement(SeqRows, { pool: props.pool })
  );
}
function SeqRows(props) {
  const [status, setStatus] = (0, import_react14.useState)({});
  const [busy, setBusy] = (0, import_react14.useState)(null);
  const check = async (id) => {
    try {
      const r = await leads.seqStatus(id);
      setStatus((m) => ({ ...m, [id]: r }));
    } catch {
    }
  };
  (0, import_react14.useEffect)(() => {
    for (const l of props.pool) check(l.id);
  }, [props.pool]);
  const start = async (id) => {
    setBusy(id);
    try {
      await leads.seqStart(id);
      toasts.push("\u5E8F\u5217\u5DF2\u542F\u52A8", "ok");
      await check(id);
    } catch (e) {
      toasts.push("\u542F\u52A8\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(null);
    }
  };
  const stop = async (id) => {
    setBusy(id);
    try {
      await leads.seqStop(id);
      toasts.push("\u5E8F\u5217\u5DF2\u505C\u6B62", "ok");
      await check(id);
    } catch (e) {
      toasts.push("\u505C\u6B62\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(null);
    }
  };
  return React19.createElement(
    Table,
    { head: ["\u7EBF\u7D22", "\u5E8F\u5217\u72B6\u6001", "\u5DF2\u53D1", "\u4E0B\u4E00\u6B65", ""] },
    props.pool.map((l) => {
      const s = status[l.id];
      const active = s?.active;
      return React19.createElement(
        "tr",
        { key: l.id },
        React19.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, l.company || l.domain || l.id),
        React19.createElement(
          "td",
          null,
          React19.createElement(
            Badge,
            { tone: active ? "ok" : "plain" },
            s ? active ? "\u8FDB\u884C\u4E2D" : "\u5DF2\u7ED3\u675F" : "\u672A\u542F\u52A8"
          )
        ),
        React19.createElement("td", { className: "num" }, String(s?.sentCount ?? 0)),
        React19.createElement("td", { className: "mono twb-muted" }, s?.nextDue ?? "\u2014"),
        React19.createElement(
          "td",
          { style: { width: 120, textAlign: "right" } },
          active ? React19.createElement("button", { className: "twb-btn secondary sm", disabled: busy === l.id, onClick: () => stop(l.id) }, "\u505C\u6B62") : React19.createElement("button", { className: "twb-btn sm", disabled: busy === l.id, onClick: () => start(l.id) }, "\u542F\u52A8")
        )
      );
    })
  );
}

// src/client/panels/Knowledge.tsx
var React20 = __toESM(require("react"), 1);
var import_react15 = require("react");
var TYPES = [
  ["product", "\u4EA7\u54C1\u8D44\u6599"],
  ["pricing", "\u62A5\u4EF7\u653F\u7B56"],
  ["case", "\u6848\u4F8B"],
  ["market", "\u5E02\u573A\u89C4\u5219"],
  ["other", "\u5176\u4ED6"]
];
var typeLabel = (k) => (TYPES.find(([v]) => v === k) ?? [, k ?? "\u5176\u4ED6"])[1];
function Knowledge() {
  const [rows, setRows] = (0, import_react15.useState)([]);
  const [q, setQ] = (0, import_react15.useState)("");
  const [hits, setHits] = (0, import_react15.useState)(null);
  const [editing, setEditing] = (0, import_react15.useState)(null);
  const [busy, setBusy] = (0, import_react15.useState)(false);
  const reload = React20.useCallback(() => {
    leads.kbList().then((r) => setRows(Array.isArray(r) ? r : r?.entries ?? [])).catch(() => setRows([]));
  }, []);
  React20.useEffect(() => {
    reload();
  }, [reload]);
  const search = async () => {
    if (!q.trim()) {
      setHits(null);
      return;
    }
    try {
      const r = await leads.kbSearch(q.trim());
      setHits(Array.isArray(r) ? r : r?.results ?? []);
    } catch (e) {
      toasts.push("\u68C0\u7D22\u5931\u8D25\uFF1A" + e.message);
    }
  };
  const blank = { title: "", body: "", type: "product", tags: [] };
  const save = async () => {
    if (!editing?.title?.trim()) {
      toasts.push("\u6807\u9898\u5FC5\u586B");
      return;
    }
    setBusy(true);
    try {
      await leads.kbUpsert(editing);
      toasts.push("\u5DF2\u4FDD\u5B58", "ok");
      setEditing(null);
      reload();
    } catch (e) {
      toasts.push("\u4FDD\u5B58\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const shown = hits ?? rows;
  return React20.createElement(
    "div",
    null,
    React20.createElement(PageHead, { title: "\u77E5\u8BC6\u5E93", sub: "\u4EA7\u54C1 \xB7 \u62A5\u4EF7\u653F\u7B56 \xB7 \u6848\u4F8B \xB7 \u5E02\u573A\u89C4\u5219\uFF0CAI \u56DE\u4FE1\u65F6\u7684\u4F9D\u636E" }),
    React20.createElement(
      "div",
      { className: "twb-toolbar" },
      React20.createElement(TextInput, {
        placeholder: "\u68C0\u7D22\u77E5\u8BC6\u5E93\u2026",
        value: q,
        onChange: (e) => setQ(e.target.value),
        style: { minWidth: 260 },
        onKeyDown: (e) => {
          if (e.key === "Enter") search();
        }
      }),
      React20.createElement("button", { className: "twb-btn secondary", onClick: search }, "\u68C0\u7D22"),
      hits ? React20.createElement("button", { className: "twb-btn ghost", onClick: () => {
        setHits(null);
        setQ("");
      } }, "\u6E05\u9664") : null,
      React20.createElement("button", { className: "twb-btn", onClick: () => setEditing({ ...blank }) }, "+ \u5F55\u5165\u6761\u76EE"),
      React20.createElement("span", { className: "spacer" }),
      React20.createElement(
        "span",
        { className: "twb-muted" },
        hits ? `\u547D\u4E2D ${hits.length} \u6761` : `\u5171 ${rows.length} \u6761`
      )
    ),
    shown.length === 0 ? React20.createElement(Empty, {
      title: hits ? "\u6CA1\u6709\u5339\u914D\u7684\u6761\u76EE" : "\u77E5\u8BC6\u5E93\u8FD8\u662F\u7A7A\u7684",
      desc: hits ? "\u6362\u4E2A\u5173\u952E\u8BCD\u8BD5\u8BD5\u3002AI \u56DE\u4FE1\u65F6\u68C0\u7D22\u4E0D\u5230\u8D44\u6599\u4F1A\u76F4\u63A5\u8BF4\u8D44\u6599\u4E0D\u8DB3\uFF0C\u800C\u4E0D\u662F\u7F16\u9020\u3002" : "\u5F55\u5165\u4EA7\u54C1\u53C2\u6570\u3001MOQ\u3001\u4EA4\u671F\u3001\u4ED8\u6B3E\u65B9\u5F0F\u3001\u8BA4\u8BC1\u8BC1\u4E66\u3001\u6210\u529F\u6848\u4F8B \u2014\u2014 \u8FD9\u4E9B\u662F AI \u5199\u5F00\u53D1\u4FE1\u548C\u56DE\u590D\u5BA2\u6237\u7684\u4E8B\u5B9E\u6765\u6E90\u3002",
      action: hits ? null : React20.createElement("button", { className: "twb-btn", onClick: () => setEditing({ ...blank }) }, "\u5F55\u5165\u7B2C\u4E00\u6761")
    }) : React20.createElement(
      Table,
      { head: ["\u6807\u9898", "\u7C7B\u578B", "\u5185\u5BB9\u6458\u8981", ""] },
      shown.map((r, i) => React20.createElement(
        "tr",
        {
          key: r.id ?? i,
          className: "row",
          onClick: () => setEditing({ ...r })
        },
        React20.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)", maxWidth: 220 } }, r.title ?? "-"),
        React20.createElement("td", null, React20.createElement(Badge, { plain: true }, typeLabel(r.type))),
        React20.createElement(
          "td",
          { className: "twb-muted", style: { maxWidth: 460 } },
          String(r.body ?? "").slice(0, 100)
        ),
        React20.createElement(
          "td",
          { style: { width: 60, textAlign: "right" } },
          React20.createElement("button", {
            className: "twb-btn ghost sm",
            onClick: (e) => {
              e.stopPropagation();
              setEditing({ ...r });
            }
          }, "\u7F16\u8F91")
        )
      ))
    ),
    editing ? React20.createElement(
      React20.Fragment,
      null,
      React20.createElement("div", { className: "twb-drawer-mask", onClick: () => setEditing(null) }),
      React20.createElement(
        "div",
        { className: "twb-drawer" },
        React20.createElement(
          "header",
          null,
          React20.createElement(
            "div",
            null,
            React20.createElement("div", { className: "h" }, editing.id ? "\u7F16\u8F91\u6761\u76EE" : "\u5F55\u5165\u6761\u76EE"),
            React20.createElement("div", { className: "s" }, "\u5199\u5F97\u8D8A\u5177\u4F53\uFF0CAI \u56DE\u4FE1\u8D8A\u6709\u636E\u53EF\u4F9D")
          ),
          React20.createElement("button", { className: "twb-btn secondary sm", onClick: () => setEditing(null) }, "\u5173\u95ED")
        ),
        React20.createElement(
          "div",
          { className: "content" },
          React20.createElement(
            "div",
            { className: "twb-grid2" },
            React20.createElement(
              Field,
              { label: "\u6807\u9898" },
              React20.createElement(TextInput, {
                value: editing.title ?? "",
                onChange: (e) => setEditing({ ...editing, title: e.target.value }),
                placeholder: "\u5982\uFF1A\u4E0D\u9508\u94A2\u4FDD\u6E29\u676F 500ml \u89C4\u683C\u4E0E MOQ"
              })
            ),
            React20.createElement(
              Field,
              { label: "\u7C7B\u578B" },
              React20.createElement(Select, {
                value: editing.type ?? "product",
                onChange: (e) => setEditing({ ...editing, type: e.target.value })
              }, TYPES.map(([v, l]) => React20.createElement("option", { key: v, value: v }, l)))
            )
          ),
          React20.createElement(
            Field,
            { label: "\u6B63\u6587", hint: "\u5EFA\u8BAE\u5199\u6E05\u53C2\u6570\u3001\u4EF7\u683C\u533A\u95F4\u3001\u4EA4\u671F\u3001\u8BA4\u8BC1\u7B49\u786C\u4FE1\u606F" },
            React20.createElement(TextArea, {
              rows: 16,
              value: editing.body ?? "",
              style: { minHeight: 320, fontFamily: "inherit" },
              onChange: (e) => setEditing({ ...editing, body: e.target.value })
            })
          ),
          React20.createElement(
            "div",
            { className: "twb-toolbar" },
            React20.createElement(
              "button",
              { className: "twb-btn", onClick: save, disabled: busy },
              busy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58"
            )
          )
        )
      )
    ) : null
  );
}

// src/client/panels/Stats.tsx
var React21 = __toESM(require("react"), 1);
var import_react16 = require("react");
function Bar(props) {
  const ratio = props.max > 0 ? props.value / props.max : 0;
  return React21.createElement(
    "div",
    { style: { marginBottom: 9 } },
    React21.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 } },
      React21.createElement("span", { style: { color: "var(--twb-fg-2)" } }, props.label),
      React21.createElement(
        "span",
        { className: "twb-mono", style: { color: "var(--twb-fg-3)" } },
        props.hint ?? String(props.value)
      )
    ),
    React21.createElement(
      "div",
      { className: "twb-bar-track" },
      React21.createElement("div", { className: "twb-bar", style: { width: Math.max(2, ratio * 100) + "%" } })
    )
  );
}
function Stats() {
  const [d, setD] = (0, import_react16.useState)(null);
  const [err, setErr] = (0, import_react16.useState)("");
  (0, import_react16.useEffect)(() => {
    leads.statsReport({}).then(setD).catch((e) => setErr(e.message));
  }, []);
  if (err) return React21.createElement(Empty, { title: "\u7EDF\u8BA1\u52A0\u8F7D\u5931\u8D25", desc: err });
  if (!d) {
    return React21.createElement(
      "div",
      null,
      React21.createElement(PageHead, { title: "\u6548\u679C\u7EDF\u8BA1", sub: "\u7EDF\u8BA1\u4E2D\u2026" }),
      React21.createElement(CardsSkeleton, { n: 6 }),
      React21.createElement(TableSkeleton, { rows: 5, cols: 4 })
    );
  }
  const funnel = d.funnel ?? {};
  const byMarket = d.byMarket ?? [];
  const byTier = d.byTier ?? [];
  const byReply = d.replyClasses ?? [];
  const maxFunnel = Math.max(1, ...Object.values(funnel).map((v) => Number(v) || 0));
  const totalLeads = Number(funnel.leads ?? d.totalLeads ?? 0);
  const contacted = Number(funnel.contacted ?? 0);
  const replied = Number(funnel.replied ?? 0);
  const won = Number(funnel.won ?? 0);
  return React21.createElement(
    "div",
    null,
    React21.createElement(PageHead, { title: "\u6548\u679C\u7EDF\u8BA1", sub: "\u83B7\u5BA2\u6F0F\u6597\u3001\u5206\u5C42\u56DE\u590D\u7387\u4E0E\u5E02\u573A\u5206\u5E03" }),
    React21.createElement(
      "div",
      { className: "twb-cards" },
      React21.createElement(StatCard, { label: "\u7EBF\u7D22\u603B\u91CF", value: totalLeads }),
      React21.createElement(StatCard, { label: "\u5DF2\u89E6\u8FBE", value: contacted, sub: totalLeads ? `\u5360 ${(contacted / totalLeads * 100).toFixed(1)}%` : void 0 }),
      React21.createElement(StatCard, {
        label: "\u56DE\u590D\u7387",
        value: contacted ? (replied / contacted * 100).toFixed(1) + "%" : "\u2014",
        tone: replied > 0 ? "ok" : void 0,
        sub: `${replied} \u6761\u56DE\u590D`
      }),
      React21.createElement(StatCard, {
        label: "\u6210\u5355\u6570",
        value: won,
        tone: won > 0 ? "ok" : void 0,
        sub: totalLeads ? `\u8F6C\u5316 ${(won / totalLeads * 100).toFixed(1)}%` : void 0
      }),
      React21.createElement(StatCard, { label: "\u6253\u5F00\u7387", value: d.openRate != null ? (d.openRate * 100).toFixed(1) + "%" : "\u2014" }),
      React21.createElement(StatCard, { label: "\u70B9\u51FB\u7387", value: d.clickRate != null ? (d.clickRate * 100).toFixed(1) + "%" : "\u2014" })
    ),
    Object.keys(funnel).length > 0 ? React21.createElement(
      Section,
      { title: "\u83B7\u5BA2\u6F0F\u6597" },
      React21.createElement(
        "div",
        {
          style: {
            padding: 14,
            border: "1px solid var(--twb-line)",
            borderRadius: "var(--twb-r)",
            background: "var(--twb-raised)",
            maxWidth: 520
          }
        },
        Object.entries(funnel).map(([k, v]) => React21.createElement(Bar, { key: k, label: k, value: Number(v) || 0, max: maxFunnel }))
      )
    ) : null,
    byTier.length > 0 ? React21.createElement(
      Section,
      { title: "\u5206\u5C42\u56DE\u590D\u7387" },
      React21.createElement(
        Table,
        { head: ["\u5206\u5C42", "\u6570\u91CF", "\u56DE\u590D", "\u56DE\u590D\u7387"] },
        byTier.map((t, i) => React21.createElement(
          "tr",
          { key: i },
          React21.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, t.tier ?? "-"),
          React21.createElement("td", { className: "num" }, String(t.total ?? 0)),
          React21.createElement("td", { className: "num" }, String(t.replied ?? 0)),
          React21.createElement(
            "td",
            null,
            React21.createElement(Badge, {
              tone: (t.replied ?? 0) / Math.max(1, t.total ?? 1) >= 0.1 ? "ok" : "warn"
            }, ((t.replied ?? 0) / Math.max(1, t.total ?? 1) * 100).toFixed(1) + "%")
          )
        ))
      )
    ) : null,
    byMarket.length > 0 ? React21.createElement(
      Section,
      { title: "\u5E02\u573A\u5206\u5E03" },
      React21.createElement(
        Table,
        { head: ["\u5E02\u573A", "\u7EBF\u7D22\u6570", "\u56DE\u590D\u6570"] },
        byMarket.map((m, i) => React21.createElement(
          "tr",
          { key: i },
          React21.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, m.market ?? "-"),
          React21.createElement("td", { className: "num" }, String(m.total ?? 0)),
          React21.createElement("td", { className: "num" }, String(m.replied ?? 0))
        ))
      )
    ) : null,
    byReply.length > 0 ? React21.createElement(
      Section,
      { title: "\u56DE\u590D\u5206\u7C7B" },
      React21.createElement(
        Table,
        { head: ["\u5206\u7C7B", "\u6570\u91CF"] },
        byReply.map((r, i) => React21.createElement(
          "tr",
          { key: i },
          React21.createElement("td", null, React21.createElement(Badge, { plain: true }, r.klass ?? r.label ?? "-")),
          React21.createElement("td", { className: "num" }, String(r.count ?? 0))
        ))
      )
    ) : null,
    Object.keys(funnel).length === 0 && byMarket.length === 0 ? React21.createElement(Empty, {
      title: "\u8FD8\u6CA1\u6709\u53EF\u7EDF\u8BA1\u7684\u6570\u636E",
      desc: "\u8DD1\u51E0\u6B21\u641C\u7D22\u3001\u52A0\u5DE5\u7EBF\u7D22\u5E76\u53D1\u51E0\u5C01\u5F00\u53D1\u4FE1\u540E\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A\u6F0F\u6597\u8F6C\u5316\u4E0E\u56DE\u590D\u7387\u3002"
    }) : null,
    React21.createElement(
      Section,
      { title: "\u89E6\u8FBE\u91CF" },
      React21.createElement(KeyValue, {
        rows: [
          ["\u4ECA\u65E5\u53D1\u9001", String(d.todaySends ?? 0)],
          ["\u672C\u5468\u53D1\u9001", String(d.weekSends ?? 0)],
          ["\u7D2F\u8BA1\u53D1\u9001", String(d.totalSends ?? 0)],
          ["\u6291\u5236\u540D\u5355", String(d.suppressed ?? 0)]
        ]
      })
    )
  );
}

// src/client/panels/Ops.tsx
var React22 = __toESM(require("react"), 1);
var import_react17 = require("react");
function Ops() {
  const [tab, setTab2] = (0, import_react17.useState)("cron");
  const [cron, setCron] = (0, import_react17.useState)(null);
  const [suppress, setSuppress] = (0, import_react17.useState)(null);
  const [monitor, setMonitor] = (0, import_react17.useState)([]);
  const [audit, setAudit] = (0, import_react17.useState)([]);
  const [warmup, setWarmup] = (0, import_react17.useState)(null);
  (0, import_react17.useEffect)(() => {
    leads.cronStatus().then(setCron).catch(() => {
    });
    leads.suppressList().then(setSuppress).catch(() => {
    });
    leads.monitorList().then((r) => setMonitor(Array.isArray(r) ? r : [])).catch(() => {
    });
    leads.auditQuery({ limit: 60 }).then((r) => setAudit(Array.isArray(r) ? r : [])).catch(() => {
    });
    leads.warmupStatus().then(setWarmup).catch(() => {
    });
  }, []);
  const jobs = Array.isArray(cron) ? cron : cron?.jobs ?? Object.values(cron?.jobs ?? {});
  const sup = Array.isArray(suppress) ? suppress : suppress?.entries ?? [];
  return React22.createElement(
    "div",
    null,
    React22.createElement(PageHead, { title: "\u7CFB\u7EDF\u8FD0\u7EF4", sub: "\u81EA\u52A8\u5316\u4EFB\u52A1\u3001\u6291\u5236\u540D\u5355\u3001\u76D1\u63A7\u4E0E\u5BA1\u8BA1" }),
    React22.createElement(
      "div",
      { className: "twb-toolbar" },
      React22.createElement(Segmented, {
        value: tab,
        options: [["cron", "\u5B9A\u65F6\u4EFB\u52A1"], ["suppress", "\u6291\u5236\u540D\u5355"], ["monitor", "\u5B98\u7F51\u76D1\u63A7"], ["audit", "\u5BA1\u8BA1\u65E5\u5FD7"]],
        onChange: (v) => setTab2(v)
      })
    ),
    tab === "cron" ? React22.createElement(
      "div",
      null,
      jobs.length === 0 ? React22.createElement(Empty, { title: "\u6CA1\u6709\u8FD0\u884C\u4E2D\u7684\u5B9A\u65F6\u4EFB\u52A1", desc: "\u5B9A\u65F6\u4EFB\u52A1\u8D1F\u8D23\uFF1AWhatsApp \u6536\u4EF6\u7BB1\u8F6E\u8BE2\u3001\u90AE\u4EF6\u5E8F\u5217\u6267\u884C\u3001\u56DE\u590D\u626B\u63CF\u3001\u5B98\u7F51\u76D1\u63A7\u3001\u6BCF\u65E5\u65E5\u62A5\u3002" }) : React22.createElement(
        Table,
        { head: ["\u4EFB\u52A1", "\u7528\u9014", "\u4E0A\u6B21\u8FD0\u884C", "\u7ED3\u679C"] },
        jobs.map((j, i) => React22.createElement(
          "tr",
          { key: i },
          React22.createElement("td", { className: "mono", style: { color: "var(--twb-fg)", fontWeight: 550 } }, j.name ?? j.id ?? "-"),
          React22.createElement("td", { className: "twb-muted" }, j.description ?? "\u2014"),
          React22.createElement("td", { className: "mono twb-muted" }, String(j.lastRun ?? "").slice(0, 19).replace("T", " ") || "\u672A\u8FD0\u884C"),
          React22.createElement(
            "td",
            null,
            j.lastError ? React22.createElement(Badge, { tone: "err" }, String(j.lastError).slice(0, 40)) : React22.createElement(Badge, { tone: j.lastRun ? "ok" : "warn" }, j.lastResult ? String(j.lastResult).slice(0, 40) : j.lastRun ? "\u6B63\u5E38" : "\u5F85\u8FD0\u884C")
          )
        ))
      ),
      warmup ? React22.createElement(
        Section,
        { title: "\u90AE\u7BB1\u9884\u70ED" },
        React22.createElement(KeyValue, {
          rows: [
            ["\u9884\u70ED\u72B6\u6001", warmup.enabled ? "\u5DF2\u5F00\u542F" : "\u672A\u5F00\u542F"],
            ["\u4ECA\u65E5\u989D\u5EA6", String(warmup.todayBudget ?? warmup.maxPerDay ?? "\u2014")],
            ["\u53C2\u4E0E\u90AE\u7BB1", String(warmup.partners ?? 0)]
          ]
        })
      ) : null
    ) : tab === "suppress" ? React22.createElement(
      "div",
      null,
      React22.createElement(SuppressView, { sup, onReload: () => leads.suppressList().then(setSuppress).catch(() => {
      }) })
    ) : tab === "monitor" ? React22.createElement(
      "div",
      null,
      monitor.length === 0 ? React22.createElement(Empty, { title: "\u6CA1\u6709\u76D1\u63A7\u76EE\u6807", desc: "\u76EF\u4F4F\u5BA2\u6237\u5B98\u7F51\u53D8\u5316\uFF08\u65B0\u54C1\u3001\u62DB\u8058\u3001\u6269\u5F20\uFF09\uFF0C\u547D\u4E2D\u4FE1\u53F7\u5C31\u662F\u89E6\u8FBE\u65F6\u673A\u3002\u53EF\u5728\u5BF9\u8BDD\u91CC\u8BA9 AI \u7528 monitor_watch \u6DFB\u52A0\u3002" }) : React22.createElement(
        Table,
        { head: ["\u57DF\u540D", "\u76D1\u63A7\u4FE1\u53F7", "\u4E0A\u6B21\u68C0\u67E5"] },
        monitor.map((m, i) => React22.createElement(
          "tr",
          { key: i },
          React22.createElement("td", { className: "mono", style: { color: "var(--twb-fg)" } }, m.domain ?? m.url ?? "-"),
          React22.createElement("td", { className: "twb-muted" }, (m.keywords ?? m.signals ?? []).join(", ") || "\u9ED8\u8BA4\u4FE1\u53F7\u8BCD"),
          React22.createElement("td", { className: "mono twb-muted" }, String(m.lastCheck ?? "").slice(0, 19).replace("T", " ") || "\u2014")
        ))
      )
    ) : React22.createElement(
      "div",
      null,
      audit.length === 0 ? React22.createElement(Empty, { title: "\u6682\u65E0\u5BA1\u8BA1\u8BB0\u5F55", desc: "\u6240\u6709\u53D1\u9001\u3001\u72B6\u6001\u53D8\u66F4\u3001\u914D\u7F6E\u6539\u52A8\u90FD\u4F1A\u8BB0\u5F55\u5728\u8FD9\u91CC\u3002" }) : React22.createElement(
        Table,
        { head: ["\u65F6\u95F4", "\u52A8\u4F5C", "\u64CD\u4F5C\u8005", "\u8BE6\u60C5"] },
        audit.map((a, i) => React22.createElement(
          "tr",
          { key: i },
          React22.createElement(
            "td",
            { className: "mono twb-muted", style: { whiteSpace: "nowrap" } },
            String(a.ts ?? "").slice(0, 19).replace("T", " ")
          ),
          React22.createElement("td", { className: "mono", style: { color: "var(--twb-fg)" } }, a.action ?? "-"),
          React22.createElement("td", null, React22.createElement(Badge, { plain: true }, a.actor ?? "-")),
          React22.createElement(
            "td",
            { className: "twb-muted", style: { maxWidth: 420 } },
            typeof a.detail === "string" ? a.detail : JSON.stringify(a.detail ?? {}).slice(0, 110)
          )
        ))
      )
    )
  );
}
function SuppressView(props) {
  const [val, setVal] = (0, import_react17.useState)("");
  const [reason, setReason] = (0, import_react17.useState)("");
  const [busy, setBusy] = (0, import_react17.useState)(false);
  const add = async () => {
    if (!val.trim()) {
      toasts.push("\u586B\u5199\u8981\u62E6\u622A\u7684\u90AE\u7BB1\u6216\u57DF\u540D");
      return;
    }
    setBusy(true);
    try {
      await leads.suppressAdd(val.trim(), reason);
      toasts.push("\u5DF2\u52A0\u5165\u6291\u5236\u540D\u5355", "ok");
      setVal("");
      setReason("");
      props.onReload();
    } catch (e) {
      toasts.push("\u6DFB\u52A0\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (v) => {
    try {
      await leads.suppressRemove(v);
      toasts.push("\u5DF2\u79FB\u9664", "ok");
      props.onReload();
    } catch (e) {
      toasts.push("\u79FB\u9664\u5931\u8D25\uFF1A" + e.message);
    }
  };
  const entries = props.sup.map((s) => typeof s === "string" ? { value: s, reason: "" } : s);
  return React22.createElement(
    "div",
    null,
    React22.createElement(
      "div",
      {
        style: {
          padding: 13,
          marginBottom: 16,
          border: "1px solid var(--twb-line)",
          borderRadius: "var(--twb-r)",
          background: "var(--twb-raised)"
        }
      },
      React22.createElement(
        "div",
        { className: "twb-muted", style: { marginBottom: 10, lineHeight: 1.7 } },
        "\u9000\u8BA2\uFF08STOP/ALTO/PARAR\uFF09\u4E0E\u9000\u4FE1\u4F1A\u8FDB\u8FD9\u91CC\u3002\u5730\u5740\u7EA7\u4E0E\u57DF\u540D\u7EA7\u4E24\u7EA7\u62E6\u622A\uFF0C\u53D1\u9001\u65F6\u5F3A\u5236\u6267\u884C \u2014\u2014 \u8FD9\u662F\u6CD5\u5F8B\u4E0E\u57DF\u540D\u4FE1\u8A89\u7684\u5E95\u7EBF\u3002"
      ),
      React22.createElement(
        "div",
        { style: { display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" } },
        React22.createElement(
          Field,
          { label: "\u90AE\u7BB1\u6216\u57DF\u540D" },
          React22.createElement(TextInput, {
            value: val,
            onChange: (e) => setVal(e.target.value),
            placeholder: "buyer@example.com \u6216 example.com",
            style: { minWidth: 240 }
          })
        ),
        React22.createElement(
          Field,
          { label: "\u539F\u56E0\uFF08\u53EF\u9009\uFF09" },
          React22.createElement(TextInput, {
            value: reason,
            onChange: (e) => setReason(e.target.value),
            placeholder: "\u7528\u6237\u9000\u8BA2 / \u786C\u9000\u4FE1",
            style: { minWidth: 180 }
          })
        ),
        React22.createElement(
          "div",
          { style: { marginBottom: 12 } },
          React22.createElement("button", { className: "twb-btn", onClick: add, disabled: busy }, "\u52A0\u5165\u540D\u5355")
        )
      )
    ),
    entries.length === 0 ? React22.createElement(Empty, { title: "\u6291\u5236\u540D\u5355\u4E3A\u7A7A", desc: "\u6536\u5230\u9000\u8BA2\u6216\u9000\u4FE1\u540E\u4F1A\u81EA\u52A8\u52A0\u5165\u3002\u4E5F\u53EF\u4EE5\u624B\u52A8\u6DFB\u52A0\u4E0D\u60F3\u89E6\u8FBE\u7684\u5730\u5740\u3002" }) : React22.createElement(
      Table,
      { head: ["\u5730\u5740 / \u57DF\u540D", "\u539F\u56E0", ""] },
      entries.map((s, i) => React22.createElement(
        "tr",
        { key: i },
        React22.createElement("td", { className: "mono", style: { color: "var(--twb-fg)" } }, s.value ?? s.address ?? "-"),
        React22.createElement("td", { className: "twb-muted" }, s.reason || "\u2014"),
        React22.createElement(
          "td",
          { style: { width: 60, textAlign: "right" } },
          React22.createElement("button", {
            className: "twb-btn ghost sm",
            onClick: () => remove(s.value ?? s.address)
          }, "\u79FB\u9664")
        )
      ))
    )
  );
}

// src/client/panels/Research.tsx
var React23 = __toESM(require("react"), 1);
var import_react18 = require("react");
var MARKETS2 = ["Brazil", "Mexico", "USA", "Germany", "UK", "Spain", "UAE", "India", "Vietnam", "Nigeria"];
function Research() {
  const [domain, setDomain] = (0, import_react18.useState)("");
  const [dossier, setDossier] = (0, import_react18.useState)(null);
  const [busy, setBusy] = (0, import_react18.useState)(false);
  const [product, setProduct] = (0, import_react18.useState)("");
  const [picked, setPicked] = (0, import_react18.useState)([]);
  const [scan, setScan] = (0, import_react18.useState)(null);
  const lookup = async () => {
    const d = domain.trim().replace(/^https?:\/\//, "").split("/")[0];
    if (!d) {
      toasts.push("\u586B\u5199\u57DF\u540D\uFF0C\u5982 acme.com");
      return;
    }
    setBusy(true);
    setDossier(null);
    try {
      setDossier(await leads.dossier(d));
    } catch (e) {
      toasts.push("\u80CC\u8C03\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const doScan = async () => {
    if (!product.trim()) {
      toasts.push("\u586B\u5199\u4EA7\u54C1\u8BCD");
      return;
    }
    setBusy(true);
    setScan(null);
    try {
      const r = await leads.marketScan(product.trim(), picked.length ? picked : void 0);
      setScan(Array.isArray(r) ? r : r?.markets ?? r?.results ?? []);
    } catch (e) {
      toasts.push("\u626B\u63CF\u5931\u8D25\uFF1A" + e.message);
    } finally {
      setBusy(false);
    }
  };
  const toggle = (m) => {
    setPicked(picked.includes(m) ? picked.filter((x) => x !== m) : [...picked, m]);
  };
  const age = dossier?.ageDays ?? dossier?.domainAgeDays;
  const young = typeof age === "number" && age < 365;
  return React23.createElement(
    "div",
    null,
    React23.createElement(PageHead, { title: "\u516C\u53F8\u80CC\u8C03", sub: "\u57DF\u540D\u5E74\u9F84 \xB7 \u6280\u672F\u6808 \xB7 \u4E1A\u52A1\u4FE1\u53F7\uFF0C\u5224\u65AD\u4E70\u5BB6\u53EF\u4FE1\u5EA6" }),
    React23.createElement(
      "div",
      {
        style: {
          padding: 13,
          marginBottom: 16,
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
          flexWrap: "wrap",
          border: "1px solid var(--twb-line)",
          borderRadius: "var(--twb-r)",
          background: "var(--twb-raised)"
        }
      },
      React23.createElement(
        Field,
        { label: "\u5BA2\u6237\u57DF\u540D" },
        React23.createElement(TextInput, {
          placeholder: "acme.com",
          value: domain,
          onChange: (e) => setDomain(e.target.value),
          style: { minWidth: 260 },
          onKeyDown: (e) => {
            if (e.key === "Enter") lookup();
          }
        })
      ),
      React23.createElement(
        "div",
        { style: { marginBottom: 12 } },
        React23.createElement(
          "button",
          { className: "twb-btn", onClick: lookup, disabled: busy },
          busy ? "\u67E5\u8BE2\u4E2D\u2026" : "\u5F00\u59CB\u80CC\u8C03"
        )
      )
    ),
    dossier ? React23.createElement(
      React23.Fragment,
      null,
      React23.createElement(
        "div",
        { className: "twb-cards" },
        React23.createElement(StatCard, {
          label: "\u57DF\u540D\u5E74\u9F84",
          value: typeof age === "number" ? (age / 365).toFixed(1) + " \u5E74" : "\u2014",
          tone: typeof age !== "number" ? void 0 : young ? "err" : "ok",
          sub: young ? "\u65B0\u6CE8\u518C\u57DF\u540D\uFF0C\u8C28\u614E\u5BF9\u5F85" : "\u57DF\u540D\u8F83\u8001\uFF0C\u76F8\u5BF9\u53EF\u4FE1"
        }),
        React23.createElement(StatCard, { label: "\u6CE8\u518C\u5546", value: dossier.registrar ?? "\u2014", sub: String(dossier.registrar ?? "") }),
        React23.createElement(StatCard, {
          label: "\u6280\u672F\u6808",
          value: (dossier.tech ?? []).length + " \u9879",
          sub: (dossier.tech ?? []).slice(0, 3).join(", ") || "\u672A\u8BC6\u522B"
        }),
        React23.createElement(StatCard, {
          label: "\u4E1A\u52A1\u4FE1\u53F7",
          value: (dossier.signals ?? []).length + " \u6761",
          tone: (dossier.signals ?? []).length ? "accent" : void 0,
          sub: (dossier.signals ?? [])[0] ?? "\u672A\u547D\u4E2D"
        })
      ),
      (dossier.signals ?? []).length > 0 ? React23.createElement(
        Section,
        { title: "\u4E1A\u52A1\u4FE1\u53F7" },
        React23.createElement(
          "div",
          { style: { display: "flex", gap: 7, flexWrap: "wrap" } },
          dossier.signals.map((s, i) => React23.createElement(Badge, { key: i, tone: "accent" }, s))
        )
      ) : null,
      (dossier.tech ?? []).length > 0 ? React23.createElement(
        Section,
        { title: "\u6280\u672F\u6808" },
        React23.createElement(
          "div",
          { style: { display: "flex", gap: 7, flexWrap: "wrap" } },
          dossier.tech.map((t, i) => React23.createElement(Badge, { key: i, plain: true }, t))
        )
      ) : null,
      React23.createElement(
        Section,
        { title: "Whois \u4FE1\u606F" },
        React23.createElement(KeyValue, {
          rows: [
            ["\u57DF\u540D", dossier.domain ?? domain],
            ["\u521B\u5EFA\u65F6\u95F4", String(dossier.createdAt ?? dossier.creationDate ?? "\u2014").slice(0, 10)],
            ["\u5230\u671F\u65F6\u95F4", String(dossier.expiresAt ?? dossier.expiryDate ?? "\u2014").slice(0, 10)],
            ["\u6CE8\u518C\u5546", dossier.registrar ?? "\u2014"]
          ]
        })
      )
    ) : null,
    React23.createElement(
      Section,
      { title: "\u5E02\u573A\u626B\u63CF" },
      React23.createElement(
        "div",
        {
          style: {
            padding: 13,
            marginBottom: 14,
            border: "1px solid var(--twb-line)",
            borderRadius: "var(--twb-r)",
            background: "var(--twb-raised)"
          }
        },
        React23.createElement(
          "div",
          { style: { display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" } },
          React23.createElement(
            Field,
            { label: "\u4EA7\u54C1\u8BCD" },
            React23.createElement(TextInput, {
              value: product,
              onChange: (e) => setProduct(e.target.value),
              placeholder: "hair dryer",
              style: { minWidth: 200 }
            })
          ),
          React23.createElement(
            "div",
            { style: { marginBottom: 12 } },
            React23.createElement("button", { className: "twb-btn", onClick: doScan, disabled: busy }, "\u626B\u63CF\u5E02\u573A")
          )
        ),
        React23.createElement(
          "div",
          { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 } },
          MARKETS2.map((m) => React23.createElement("button", {
            key: m,
            onClick: () => toggle(m),
            style: {
              font: "inherit",
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: 4,
              cursor: "pointer",
              border: "1px solid " + (picked.includes(m) ? "var(--twb-accent-line)" : "var(--twb-line)"),
              background: picked.includes(m) ? "var(--twb-accent-dim)" : "transparent",
              color: picked.includes(m) ? "var(--twb-accent)" : "var(--twb-fg-3)"
            }
          }, m)),
          React23.createElement(
            "span",
            { className: "twb-dim", style: { alignSelf: "center", marginLeft: 4 } },
            picked.length ? `\u5DF2\u9009 ${picked.length} \u4E2A` : "\u4E0D\u9009=\u626B\u63CF\u5168\u90E8\u9884\u8BBE\u5E02\u573A"
          )
        )
      ),
      scan ? scan.length === 0 ? React23.createElement(Empty, { title: "\u6CA1\u6709\u626B\u63CF\u5230\u6570\u636E", desc: "\u8BE5\u4EA7\u54C1\u5728\u8FD9\u4E9B\u5E02\u573A\u53EF\u80FD\u641C\u7D22\u91CF\u6781\u4F4E\uFF0C\u6216\u641C\u7D22\u5F15\u64CE\u88AB\u9650\u6D41\u3002" }) : React23.createElement(
        Table,
        { head: ["\u5E02\u573A", "\u7EBF\u7D22\u91CF", "\u7ADE\u4E89\u5EA6", "\u5EFA\u8BAE"] },
        scan.map((m, i) => React23.createElement(
          "tr",
          { key: i },
          React23.createElement("td", { style: { fontWeight: 550, color: "var(--twb-fg)" } }, m.market ?? m.marketLabel ?? "-"),
          React23.createElement("td", { className: "num" }, String(m.total ?? m.found ?? 0)),
          React23.createElement(
            "td",
            null,
            React23.createElement(
              Badge,
              { tone: (m.competition ?? 0) > 0.6 ? "err" : (m.competition ?? 0) > 0.3 ? "warn" : "ok" },
              typeof m.competition === "number" ? (m.competition * 100).toFixed(0) + "%" : "\u2014"
            )
          ),
          React23.createElement("td", { className: "twb-muted" }, m.advice ?? "\u2014")
        ))
      ) : null
    )
  );
}

// src/client/App.tsx
var GROUPS = [
  {
    label: "\u83B7\u5BA2",
    tabs: [
      ["leads", "\u7EBF\u7D22\u641C\u7D22"],
      ["pool", "\u7EBF\u7D22\u6C60"],
      ["finder", "\u90AE\u7BB1\u9A8C\u8BC1"],
      ["research", "\u516C\u53F8\u80CC\u8C03"]
    ]
  },
  {
    label: "\u8F6C\u5316",
    tabs: [
      ["sop", "SOP \u6D41\u7A0B"],
      ["mail", "\u90AE\u4EF6\u4E2D\u5FC3"],
      ["templates", "\u6A21\u677F"],
      ["review", "\u5BA2\u670D\u5BA1\u6838"]
    ]
  },
  {
    label: "\u4EA4\u4ED8",
    tabs: [
      ["inquiries", "\u8BE2\u76D8"],
      ["customers", "\u5BA2\u6237"],
      ["quotes", "\u62A5\u4EF7/PI"],
      ["orders", "\u8BA2\u5355"],
      ["logistics", "\u7269\u6D41\u5355\u8BC1"],
      ["receipts", "\u6536\u6C47\u5BF9\u8D26"]
    ]
  },
  {
    label: "\u652F\u6491",
    tabs: [
      ["kb", "\u77E5\u8BC6\u5E93"],
      ["ops", "\u7CFB\u7EDF\u8FD0\u7EF4"]
    ]
  },
  {
    label: "\u5206\u6790",
    tabs: [
      ["dashboard", "\u770B\u677F"],
      ["stats", "\u6548\u679C\u7EDF\u8BA1"],
      ["settings", "\u8BBE\u7F6E"]
    ]
  }
];
var PANELS = {
  dashboard: () => React24.createElement(Dashboard, null),
  inquiries: () => React24.createElement(Inquiries, null),
  customers: () => React24.createElement(Customers, null),
  quotes: () => React24.createElement(Quotes, null),
  orders: () => React24.createElement(Orders, null),
  logistics: () => React24.createElement(Logistics, null),
  receipts: () => React24.createElement(Receipts, null),
  settings: () => React24.createElement(Settings, null),
  leads: () => React24.createElement(Leads, null),
  pool: () => React24.createElement(LeadsPool, null),
  finder: () => React24.createElement(EmailFinder, null),
  review: () => React24.createElement(Review, null),
  templates: () => React24.createElement(Templates, null),
  sop: () => React24.createElement(Sop, null),
  mail: () => React24.createElement(Mail, null),
  kb: () => React24.createElement(Knowledge, null),
  stats: () => React24.createElement(Stats, null),
  ops: () => React24.createElement(Ops, null),
  research: () => React24.createElement(Research, null)
};
function App(props) {
  injectStyles();
  attachBridge({ handoff: props.handoff });
  useVersion();
  const [tab, setLocal] = (0, import_react19.useState)("leads");
  const [cmdkOpen, setCmdkOpen] = (0, import_react19.useState)(false);
  const active = state.tab && PANELS[state.tab] ? state.tab : tab;
  const pick = (t2) => {
    setTab(t2);
    setLocal(t2);
  };
  (0, import_react19.useEffect)(() => {
    applyThemeAttr();
  });
  (0, import_react19.useEffect)(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const allTabs = GROUPS.flatMap((g) => g.tabs);
  return React24.createElement(
    "div",
    { className: "twb-root" },
    // 顶栏：品牌标记 + 标题 + 分组导航同一行。标题定宽不滚动，
    // 菜单占用剩余宽度并可横向滚动，Tab 再多也不会把标题挤走。
    React24.createElement(
      "div",
      { className: "twb-header" },
      React24.createElement(
        "div",
        { className: "twb-brand" },
        React24.createElement(
          "span",
          { className: "twb-brand-mark" },
          React24.createElement(
            "svg",
            { width: 11, height: 11, viewBox: "0 0 24 24", fill: "none", stroke: "#1a1206", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" },
            React24.createElement("path", { d: "M4 18h16M6 18V9l6-4 6 4v9M10 18v-5h4v5" })
          )
        ),
        React24.createElement("span", { className: "twb-title" }, "\u5916\u8D38\u5DE5\u4F5C\u53F0")
      ),
      React24.createElement(
        "button",
        {
          className: "twb-cmd-trigger",
          onClick: () => setCmdkOpen(true),
          title: "\u641C\u7D22\u9875\u9762\u4E0E\u547D\u4EE4\uFF08Ctrl+K\uFF09"
        },
        React24.createElement(
          "svg",
          { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" },
          React24.createElement("circle", { cx: 11, cy: 11, r: 7 }),
          React24.createElement("path", { d: "m20 20-3.5-3.5" })
        ),
        React24.createElement("span", null, "\u641C\u7D22"),
        React24.createElement("kbd", null, "\u2318K")
      ),
      React24.createElement(
        "div",
        { className: "twb-tabs" },
        GROUPS.map((g) => React24.createElement(
          React24.Fragment,
          { key: g.label },
          React24.createElement("span", { className: "twb-group" }, g.label),
          g.tabs.map(([id, label]) => React24.createElement("button", {
            key: id,
            className: "twb-tab" + (active === id ? " active" : ""),
            onClick: () => pick(id)
          }, label))
        ))
      ),
      React24.createElement(
        "div",
        { className: "twb-header-right" },
        React24.createElement(ThemeToggle, null)
      )
    ),
    React24.createElement(
      "div",
      { className: "twb-body" },
      // 每个 Tab 套错误边界：某一页崩了不影响其他页
      React24.createElement(
        PanelBoundary,
        { tab: active },
        (PANELS[active] ?? PANELS.leads)()
      )
    ),
    React24.createElement(CommandPalette, {
      open: cmdkOpen,
      onClose: () => setCmdkOpen(false),
      tabs: allTabs
    }),
    React24.createElement(Toasts, null)
  );
}

// src/client/index.ts
var PANEL_ID = "trade-workbench";
var inject = ["slots", "layout", "uiWorkspace"];
function PanelIcon(props) {
  const s = props.size ?? 20;
  return React25.createElement(
    "svg",
    { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: props.active ? "currentColor" : "currentColor", strokeWidth: 1.8, style: { opacity: props.active ? 1 : 0.75 } },
    React25.createElement("path", { d: "M3 17h18M5 17V9l7-4 7 4v8" }),
    React25.createElement("path", { d: "M9 17v-5h6v5" })
  );
}
function apply(ctx) {
  const uiWorkspace = ctx.get("uiWorkspace");
  const handoff = (prompt) => {
    try {
      uiWorkspace?.startSession?.(void 0, { agentPreset: "cordis", prompt, whenDraftExists: "append" });
      ctx.layout?.toggleSidebar?.();
    } catch {
    }
  };
  ctx.slots.inject("main", function* () {
    yield ctx.slots.register({
      name: "main",
      key: PANEL_ID,
      inject: () => ({ handoff, setTab })
    }, App);
    yield ctx.layout.panelInfo.subscribe(() => {
      if (ctx.layout.panelInfo.getSnapshot().activePanelId !== PANEL_ID) setTab("dashboard");
    });
  });
  ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
    name: "sidebar.panellist",
    id: PANEL_ID,
    order: 40,
    label: () => "\u5916\u8D38\u5DE5\u4F5C\u53F0"
  }, PanelIcon));
}

    return module.exports;
  },
});