/**
 * 设计系统：现代工业风。
 *
 * 三条原则：
 * 1. 精密感 —— 极细边框（1px / .5px 描边）、等宽数字、严格对齐的栅格、
 *    统一 4px 基准间距。工业界面的高级感来自"对齐"而非装饰。
 * 2. 层次靠明度不靠颜色 —— 表面分 4 级（base / raised / overlay / sunken），
 *    强调色只用于焦点、数据高亮和状态，绝不铺满。
 * 3. 动效克制 —— 只有 120-180ms 的位移与透明度过渡，无弹跳、无旋转，
 *    减少动效噪音让数据本身成为视觉焦点。
 *
 * 色板跟随宿主主题：所有 --twb-* 都以宿主 --dshe-* 变量为首选，
 * 宿主没有该变量时用工业风默认值兜底。这样既保证与 DSH 主题一致，
 * 又能独立成体系。
 */
const CSS = `
/* ── 设计令牌 ───────────────────────────────────────────── */
.twb-root {
  /* 表面层级 */
  --twb-base: var(--dshe-background, #0b0c0e);
  --twb-raised: var(--dshe-surface, #131519);
  --twb-overlay: var(--dshe-surface-raised, #1a1d22);
  --twb-sunken: rgba(0, 0, 0, .22);
  --twb-hover: rgba(255, 255, 255, .035);
  --twb-active: rgba(255, 255, 255, .06);

  /* 线条 */
  --twb-line: var(--dshe-border, rgba(255, 255, 255, .07));
  --twb-line-strong: rgba(255, 255, 255, .13);
  --twb-hairline: rgba(255, 255, 255, .045);

  /* 文字 */
  --twb-fg: var(--dshe-foreground, #e8eaed);
  --twb-fg-2: rgba(232, 234, 237, .78);
  --twb-fg-3: rgba(232, 234, 237, .56);
  --twb-fg-4: rgba(232, 234, 237, .40);

  /* 工业强调色：琥珀（仪表/警示）+ 青绿（通过）+ 朱红（异常） */
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
  /* 看板状态辅助色：深色用亮调 */
  --twb-violet: #a78bfa;
  --twb-cyan: #38bdf8;

  /* 几何 */
  --twb-r-sm: 5px;
  --twb-r: 8px;
  --twb-r-lg: 12px;
  --twb-gap: 4px;

  /* 阴影：极短扩散，模拟实体面板而非发光 */
  --twb-shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 4px 12px rgba(0, 0, 0, .18);
  --twb-shadow-lg: 0 2px 8px rgba(0, 0, 0, .45), 0 16px 48px rgba(0, 0, 0, .32);

  /* 字体 */
  --twb-font: inherit;
  --twb-mono: ui-monospace, "SF Mono", "Cascadia Mono", "Consolas", monospace;

  /* 动效 */
  --twb-ease: cubic-bezier(.32, .72, 0, 1);
  --twb-dur: 140ms;
}

/* 浅色令牌。抽成一组变量，供「显式 data-theme=light」与「跟随系统」两处复用，
   避免同一份色值维护两遍。 */
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
  /* 浅色下紫/青需压深才达 4.5:1 */
  --twb-violet: #6d3fc4;
  --twb-cyan: #0e7490;
  --twb-smoothing: auto;
  --twb-shadow: 0 1px 2px rgba(0, 0, 0, .06), 0 4px 12px rgba(0, 0, 0, .05);
  --twb-shadow-lg: 0 2px 8px rgba(0, 0, 0, .08), 0 16px 48px rgba(0, 0, 0, .12);
}
/* 显式深色：覆盖系统偏好，保证用户手选优先 */
.twb-root[data-theme="dark"] {
  color-scheme: dark;
}
/* 跟随系统：仅在未显式指定时生效 */
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
    /* 浅色下紫/青需压深才达 4.5:1 */
    --twb-violet: #6d3fc4;
    --twb-cyan: #0e7490;
    --twb-smoothing: auto;
  --twb-shadow: 0 1px 2px rgba(0, 0, 0, .06), 0 4px 12px rgba(0, 0, 0, .05);
    --twb-shadow-lg: 0 2px 8px rgba(0, 0, 0, .08), 0 16px 48px rgba(0, 0, 0, .12);
  }
}

/* ── 骨架 ───────────────────────────────────────────────── */
.twb-root {
  display: flex; flex-direction: column; height: 100%; overflow: hidden;
  color: var(--twb-fg); font-family: var(--twb-font); font-size: 14px;
  background: var(--twb-base);
  /* 深色背景下 antialiased 让细字更锐利；浅色背景则相反 —— 亚像素抗锯齿
     被关掉后笔画变细发灰。用变量按主题切换，默认（深色）保持 antialiased。 */
  -webkit-font-smoothing: var(--twb-smoothing, antialiased);
  -moz-osx-font-smoothing: grayscale;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
}

/* 顶栏：标题 + 分组导航同一行；标题定宽，菜单占用余量并横向滚动 */
.twb-header {
  display: flex; align-items: stretch; gap: 0;
  padding: 0 18px; flex: 0 0 auto;
  background: var(--twb-raised);
  border-bottom: 1px solid var(--twb-line);
  position: relative; z-index: 10;
}
/* 顶栏底部的微光分隔线，替代厚重边框 */
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
/* 激活指示：2px 琥珀短横，两端收窄 */
.twb-tab.active::after {
  content: ""; position: absolute; left: 8px; right: 8px; bottom: 0; height: 2px;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(90deg, transparent, var(--twb-accent) 22%, var(--twb-accent) 78%, transparent);
}

/* ── 主体 ───────────────────────────────────────────────── */
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

/* 页面标题区 */
.twb-page-head { display: flex; align-items: flex-end; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
.twb-page-title { font-size: 17px; font-weight: 600; letter-spacing: -.018em; }
.twb-page-sub { color: var(--twb-fg-3); font-size: 12px; padding-bottom: 2px; }

/* ── 工具栏 ─────────────────────────────────────────────── */
.twb-toolbar {
  display: flex; gap: 8px; align-items: center;
  margin-bottom: 14px; flex-wrap: wrap;
}
.twb-toolbar .spacer { flex: 1 1 auto; }

/* ── 控件 ───────────────────────────────────────────────── */
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

/* ── 按钮 ───────────────────────────────────────────────── */
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

/* ── 表格：工业风核心资产 ──────────────────────────────── */
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
  /* 表格是主要数据面，正文用主文字色而非二级色 ——
     二级色在浅色下只有 10:1，但偏灰仍不够"实" */
  padding: 10px 12px; font-size: 13px; color: var(--twb-fg);
  border-bottom: 1px solid var(--twb-hairline);
  vertical-align: middle;
}
/* 次要列仍可弱化，但不低于 fg-2 */
.twb-table td .twb-muted, .twb-table td.muted { color: var(--twb-fg-3); font-size: 12px; }
.twb-table tbody tr:last-child td { border-bottom: none; }
.twb-table tr.row { cursor: pointer; transition: background var(--twb-dur) var(--twb-ease); }
.twb-table tr.row:hover { background: var(--twb-hover); }
.twb-table tr.row:hover td:first-child { box-shadow: inset 2px 0 0 var(--twb-accent); }
/* 数字列等宽对齐 */
.twb-table td.num, .twb-table th.num { text-align: right; font-family: var(--twb-mono); font-size: 12px; }
.twb-table td.mono { font-family: var(--twb-mono); font-size: 12px; }

/* ── 徽章 ───────────────────────────────────────────────── */
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

/* ── 统计卡 ─────────────────────────────────────────────── */
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
/* 顶部 1px 高光：模拟金属边缘 */
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

/* ── 分节标题 ───────────────────────────────────────────── */
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

/* ── 抽屉 ───────────────────────────────────────────────── */
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

/* ── 表单 ───────────────────────────────────────────────── */
.twb-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
.twb-field > label {
  font-size: 10.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
  color: var(--twb-fg-4);
}
.twb-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.twb-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
@media (max-width: 720px) { .twb-grid2, .twb-grid3 { grid-template-columns: 1fr; } }

/* ── 空态 ───────────────────────────────────────────────── */
.twb-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 9px; padding: 52px 24px; text-align: center;
  border: 1px dashed var(--twb-line); border-radius: var(--twb-r);
  background: var(--twb-sunken);
}
.twb-empty .t { font-size: 13px; font-weight: 600; color: var(--twb-fg-2); }
.twb-empty .d { font-size: 12px; color: var(--twb-fg-3); max-width: 380px; line-height: 1.6; }
.twb-empty .ico { color: var(--twb-fg-4); margin-bottom: 2px; }

/* ── Toast ──────────────────────────────────────────────── */
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

/* ── 阶段步骤条 ─────────────────────────────────────────── */
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

/* ── 进度条 ─────────────────────────────────────────────── */
.twb-bar-track { height: 6px; border-radius: 3px; background: var(--twb-sunken); overflow: hidden; }
.twb-bar {
  height: 6px; border-radius: 3px; min-width: 3px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--twb-accent) 70%, transparent), var(--twb-accent));
  transition: width 320ms var(--twb-ease);
}

/* ── 文本工具 ───────────────────────────────────────────── */
.twb-muted { color: var(--twb-fg-3); font-size: 12px; }
.twb-dim { color: var(--twb-fg-4); font-size: 11.5px; }
.twb-mono { font-family: var(--twb-mono); font-variant-numeric: tabular-nums; }
.twb-kv { display: flex; flex-direction: column; gap: 7px; }
.twb-kv .r { display: flex; gap: 12px; font-size: 12.5px; }
.twb-kv .r .k { color: var(--twb-fg-4); min-width: 84px; flex: 0 0 auto; font-size: 11.5px; }
.twb-kv .r .v { color: var(--twb-fg-2); word-break: break-all; }

/* ── 分段控件 ───────────────────────────────────────────── */
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

/* ── 看板 ───────────────────────────────────────────────── */
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

/* ── 代码/日志块 ────────────────────────────────────────── */
.twb-pre {
  font-family: var(--twb-mono); font-size: 11.5px; line-height: 1.7;
  padding: 11px 13px; border-radius: var(--twb-r-sm);
  background: var(--twb-sunken); border: 1px solid var(--twb-line);
  color: var(--twb-fg-2); overflow: auto; white-space: pre-wrap; word-break: break-all;
}
/* ── 骨架屏 ─────────────────────────────────────────────── */
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
/* 尊重系统的"减少动态效果"偏好 */
@media (prefers-reduced-motion: reduce) {
  .twb-skel { animation: none; }
  .twb-tab, .twb-btn, .twb-card, .twb-tile, .twb-step { transition: none; }
}

/* ── 命令面板 ───────────────────────────────────────────── */
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

/* ── 顶栏搜索触发与右侧工具 ─────────────────────────────── */
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
/* 窄屏时收起搜索按钮的文字，只留图标 */
@media (max-width: 900px) {
  .twb-cmd-trigger span, .twb-cmd-trigger kbd { display: none; }
  .twb-cmd-trigger { margin-left: 8px; }
}
`;

export function injectStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("twb-styles")) return;
  const el = document.createElement("style");
  el.id = "twb-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}
