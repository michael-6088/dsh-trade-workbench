import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";

// 在 Node 里模拟浏览器模块加载器，验证 client 产物契约
const src = readFileSync(new URL("../../lib/client.js", import.meta.url), "utf8");
let registered = null;
globalThis.window = { __ModuleLoader__: { load(row) { registered = row; } } };

const React = {
  createElement: (type, props, ...children) => ({ type, props, children }),
  Fragment: "Fragment",
  useState: (v) => [typeof v === "function" ? v() : v, () => {}],
  useEffect: () => {},
  // 面板里用到的其余 hooks：桩件返回稳定值即可，测试只关心注册契约
  useCallback: (fn) => fn,
  useMemo: (fn) => fn(),
  useRef: (v) => ({ current: v }),
  useSyncExternalStore: () => undefined,
  // 错误边界基于 class 组件，桩件要给 Component 一个可继承的基类
  Component: class { constructor(props) { this.props = props; this.state = {}; } setState() {} },
};
const moduleObj = { exports: {} };
const fakeRequire = (name) => {
  if (name === "react") return React;
  if (name === "react/jsx-runtime") return { jsx: React.createElement, jsxs: React.createElement, Fragment: "Fragment" };
  throw new Error("unexpected external require: " + name);
};
new Function("window", src)(globalThis.window);
const exported = registered.factory(fakeRequire);
moduleObj.exports = exported;

test("ModuleLoader 外壳注册 id 与 factory", () => {
  assert.ok(registered, "未调用 __ModuleLoader__.load");
  assert.equal(registered.id, "dsh-trade-workbench");
  assert.equal(typeof registered.factory, "function");
});

test("导出 apply / inject / PANEL_ID", () => {
  const out = moduleObj.exports;
  assert.equal(typeof out.apply, "function");
  assert.deepEqual(out.inject, ["slots", "layout", "uiWorkspace"]);
  assert.equal(out.PANEL_ID, "trade-workbench");
});

test("apply 注册 main 与 sidebar.panellist，参数符合插槽契约", () => {
  const regs = [];
  const injections = [];
  const fakeCtx = {
    get: (k) => (k === "uiWorkspace" ? { startSession: () => {} } : undefined),
    slots: {
      inject(key, cb) {
        injections.push(key);
        const it = cb();
        if (it && typeof it.next === "function") { let n = it.next(); while (!n.done) n = it.next(); }
        return () => {};
      },
      register(entry, comp) { regs.push({ entry, comp }); return () => {}; },
    },
    layout: {
      toggleSidebar() {},
      panelInfo: { subscribe: () => () => {}, getSnapshot: () => ({ activePanelId: null }) },
    },
  };
  moduleObj.exports.apply(fakeCtx);
  assert.deepEqual(injections.sort(), ["main", "sidebar.panellist"]);
  const main = regs.find((r) => r.entry.name === "main");
  assert.equal(main.entry.key, "trade-workbench");
  assert.equal(typeof main.comp, "function");
  const icon = regs.find((r) => r.entry.name === "sidebar.panellist");
  assert.equal(icon.entry.id, "trade-workbench");
  assert.equal(typeof icon.entry.order, "number");
  assert.equal(typeof icon.entry.label, "function");
  assert.equal(icon.entry.label(), "外贸工作台");
});

test("产物不含宿主包 require", () => {
  assert.ok(!/require\(["']@deepseek-ai/.test(src));
});