const CSS = `
/* ── 设计令牌 ───────────────────────────────────────────── */
/*
 * 三层结构：色板 → 表面 → 语义。
 *
 * 表面用「冷调深灰 + 微蓝」而不是纯黑：纯黑背景下的白色文字对比度过高，
 * 长时间阅读会累；带一点蓝相能压住刺眼感，同时和琥珀强调色形成冷暖对比，
 * 这是现代科技感界面的常见做法。
 *
 * 每个表面都配一个渐变版本（--twb-*-grad），用在卡片、顶栏等大面积区域，
 * 让平面色块产生微妙的深度，而不是死板的单色填充。
 */
.twb-root {
  /* ── 表面：5 级明度 ─────────────────────────────── */
  --twb-base: var(--dshe-background, #0a0c10);
  --twb-raised: var(--dshe-surface, #111419);
  --twb-overlay: var(--dshe-surface-raised, #181c23);
  --twb-elevated: #1f242d;
  --twb-sunken: rgba(0, 0, 0, .26);

  /* 渐变表面：大面积区域用，产生细微方向性 */
  --twb-base-grad: linear-gradient(180deg, #0b0e13 0%, #090b0f 100%);
  --twb-raised-grad: linear-gradient(180deg, #13161c 0%, #101318 100%);
  --twb-overlay-grad: linear-gradient(180deg, #1a1f27 0%, #151920 100%);

  /* ── 交互态 ──────────────────────────────────────── */
  --twb-hover: rgba(255, 255, 255, .04);
  --twb-active: rgba(255, 255, 255, .07);
  --twb-selected: rgba(240, 161, 58, .10);

  /* ── 线条：3 级强度 ──────────────────────────────── */
  --twb-line: var(--dshe-border, rgba(255, 255, 255, .075));
  --twb-line-strong: rgba(255, 255, 255, .14);
  --twb-hairline: rgba(255, 255, 255, .05);
  /* 顶部高光：模拟金属/玻璃边缘，是"精致感"的关键细节 */
  --twb-edge-light: rgba(255, 255, 255, .09);

  /* ── 文字：4 级 + 等宽数字 ───────────────────────── */
  --twb-fg: var(--dshe-foreground, #eef1f5);
  --twb-fg-2: rgba(238, 241, 245, .78);
  --twb-fg-3: rgba(238, 241, 245, .56);
  --twb-fg-4: rgba(238, 241, 245, .38);

  /* ── 强调色：琥珀主调 + 冷色辅助 ─────────────────── */
  --twb-accent: var(--dshe-accent, #f5a623);
  --twb-accent-dim: rgba(245, 166, 35, .12);
  --twb-accent-line: rgba(245, 166, 35, .36);
  --twb-accent-glow: rgba(245, 166, 35, .04);

  --twb-ok: #34d399;
  --twb-ok-dim: rgba(52, 211, 153, .12);
  --twb-warn: #fbbf24;
  --twb-warn-dim: rgba(251, 191, 36, .12);
  --twb-err: #fb7185;
  --twb-err-dim: rgba(251, 113, 133, .12);
  --twb-info: #60a5fa;
  --twb-info-dim: rgba(96, 165, 250, .12);
  --twb-violet: #a78bfa;
  --twb-cyan: #22d3ee;

  /* ── 字体刻度 ────────────────────────────────────── */
  --twb-fs-xs: 11.5px;   /* 上标、分组标签 */
  --twb-fs-sm: 12.5px;   /* 辅助说明 */
  --twb-fs-base: 14px;   /* 正文 */
  --twb-fs-md: 15px;     /* 强调正文、输入框 */
  --twb-fs-lg: 17.5px;   /* 页面标题 */
  --twb-fs-xl: 24px;     /* 统计数值 */
  --twb-fs-2xl: 30px;    /* 大号指标 */

  --twb-font: inherit;
  --twb-mono: ui-monospace, "SF Mono", "Cascadia Mono", "Consolas", monospace;

  /* ── 间距刻度：4px 基准 ──────────────────────────── */
  --twb-sp-1: 4px;
  --twb-sp-2: 8px;
  --twb-sp-3: 12px;
  --twb-sp-4: 16px;
  --twb-sp-5: 20px;
  --twb-sp-6: 24px;
  --twb-sp-8: 32px;

  /* ── 几何 ────────────────────────────────────────── */
  --twb-r-sm: 6px;
  --twb-r: 10px;
  --twb-r-lg: 14px;
  --twb-gap: 4px;

  /* ── 阴影：分层，越高的表面阴影越深 ──────────────── */
  --twb-shadow-sm: 0 1px 2px rgba(0, 0, 0, .3);
  --twb-shadow: 0 1px 3px rgba(0, 0, 0, .4), 0 6px 16px rgba(0, 0, 0, .22);
  --twb-shadow-lg: 0 4px 12px rgba(0, 0, 0, .45), 0 20px 56px rgba(0, 0, 0, .38);
  /* 强调色的柔和外发光：用于聚焦态与主按钮 */
  --twb-glow: 0 0 0 3px var(--twb-accent-dim);

  /* ── 动效 ────────────────────────────────────────── */
  --twb-ease: cubic-bezier(.32, .72, 0, 1);
  --twb-dur: 150ms;
  --twb-dur-slow: 260ms;
}

/* 页面底部氛围光：极淡的径向渐变，让大片留白不空 */
/* ── 背景光影：三层叠加，全部在内容之下且极低对比 ────────
 * 第 1 层：极光色晕（琥珀 + 青蓝 + 紫），营造深度与方向感
 * 第 2 层：细微网格，暗示"工作台/工程图"的秩序感
 * 第 3 层：顶部光带，模拟光源从上方打下来
 *
 * 关键约束：所有光晕的不透明度控制在 .05~.10，且远离文字密集区；
 * 任一效果单独看不明显，叠起来才有氛围。禁止用高饱和度色块，
 * 那会直接吃掉文字对比度。
 */
.twb-root::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    /* 左上琥珀主光：范围收窄到角落，中心区保持纯净 */
    radial-gradient(620px 320px at 2% -14%, var(--twb-accent-glow), transparent 66%),
    /* 右上青蓝辅光，与主光形成冷暖对比 */
    radial-gradient(560px 300px at 100% -8%, rgba(96, 165, 250, .030), transparent 64%),
    /* 底部紫色反光：也只贴边 */
    radial-gradient(760px 260px at 50% 112%, rgba(167, 139, 250, .022), transparent 68%);
}

/* 网格纹理：24px 细线，仅在深色下可见，提供秩序感 */
.twb-root::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(to right, var(--twb-grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--twb-grid-line) 1px, transparent 1px);
  background-size: 24px 24px;
  /* 向外径向淡出：中心清晰、边缘消失，不会形成"表格"压迫感 */
  mask-image: radial-gradient(ellipse 85% 70% at 50% 32%, #000 8%, transparent 78%);
  -webkit-mask-image: radial-gradient(ellipse 85% 70% at 50% 32%, #000 8%, transparent 78%);
}

.twb-root > * { position: relative; z-index: 1; }

/* 顶栏下方光带：模拟顶灯，让页面顶部更亮、更有立体感 */
.twb-body::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; height: 180px;
  pointer-events: none;
  background: linear-gradient(180deg, var(--twb-top-light), transparent);
  z-index: 0;
}
.twb-body { position: relative; }
.twb-body > * { position: relative; z-index: 1; }

/* 浅色令牌：显式 data-theme=light 与系统跟随共用同一组值 */
/* 浅色令牌：显式 data-theme=light 与系统跟随共用同一组值。
   注意这是两份独立的变量块 —— CSS 变量不能跨选择器复用，
   改动其中一份必须同步另一份。 */
.twb-root[data-theme="light"] {
  color-scheme: light;

  /* 表面 */
  --twb-base: var(--dshe-background, #f6f7f9);
  --twb-raised: var(--dshe-surface, #ffffff);
  --twb-overlay: var(--dshe-surface-raised, #ffffff);
  --twb-elevated: #ffffff;
  --twb-sunken: rgba(15, 23, 42, .035);
  --twb-base-grad: linear-gradient(180deg, #f8f9fb 0%, #f2f4f7 100%);
  --twb-raised-grad: linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%);
  --twb-overlay-grad: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);

  /* 交互态 */
  --twb-hover: rgba(15, 23, 42, .035);
  --twb-active: rgba(15, 23, 42, .06);
  --twb-selected: rgba(180, 100, 0, .08);
  /* 浅色下网格线用深色，不透明度更低 */
  --twb-grid-line: rgba(15, 23, 42, .010);
  --twb-top-light: rgba(15, 23, 42, .008);

  /* 线条 */
  --twb-line: var(--dshe-border, rgba(15, 23, 42, .10));
  --twb-line-strong: rgba(15, 23, 42, .18);
  --twb-hairline: rgba(15, 23, 42, .06);
  --twb-edge-light: rgba(255, 255, 255, .9);

  /* 文字 */
  --twb-fg: var(--dshe-foreground, #0f172a);
  --twb-fg-2: rgba(15, 23, 42, .78);
  --twb-fg-3: rgba(15, 23, 42, .62);
  --twb-fg-4: rgba(15, 23, 42, .52);

  /* 强调色 */
  --twb-accent: var(--dshe-accent, #b45309);
  --twb-accent-dim: rgba(180, 83, 9, .09);
  --twb-accent-line: rgba(180, 83, 9, .28);
  --twb-accent-glow: rgba(180, 83, 9, .035);

  --twb-ok: #047857;
  --twb-ok-dim: rgba(4, 120, 87, .09);
  --twb-warn: #a16207;
  --twb-warn-dim: rgba(161, 98, 7, .10);
  --twb-err: #be123c;
  --twb-err-dim: rgba(190, 18, 60, .09);
  --twb-info: #1d4ed8;
  --twb-info-dim: rgba(29, 78, 216, .08);
  --twb-violet: #6d28d9;
  --twb-cyan: #0e7490;

  /* 浅色下关闭 antialiased：它会让笔画变细发灰 */
  --twb-smoothing: auto;

  /* 阴影 */
  --twb-shadow-sm: 0 1px 2px rgba(15, 23, 42, .05);
  --twb-shadow: 0 1px 3px rgba(15, 23, 42, .06), 0 6px 16px rgba(15, 23, 42, .05);
  --twb-shadow-lg: 0 4px 12px rgba(15, 23, 42, .08), 0 20px 56px rgba(15, 23, 42, .10);
  --twb-glow: 0 0 0 3px var(--twb-accent-dim);
}

/* 跟随系统：仅在用户没有显式选择深色/浅色时生效 */
@media (prefers-color-scheme: light) {
  .twb-root:not([data-theme="dark"]):not([data-theme="light"]) {
    color-scheme: light;

    --twb-base: var(--dshe-background, #f6f7f9);
    --twb-raised: var(--dshe-surface, #ffffff);
    --twb-overlay: var(--dshe-surface-raised, #ffffff);
    --twb-elevated: #ffffff;
    --twb-sunken: rgba(15, 23, 42, .035);
    --twb-base-grad: linear-gradient(180deg, #f8f9fb 0%, #f2f4f7 100%);
    --twb-raised-grad: linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%);
    --twb-overlay-grad: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);

    --twb-hover: rgba(15, 23, 42, .035);
    --twb-active: rgba(15, 23, 42, .06);
    --twb-selected: rgba(180, 100, 0, .08);
  /* 浅色下网格线用深色，不透明度更低 */
  --twb-grid-line: rgba(15, 23, 42, .010);
  --twb-top-light: rgba(15, 23, 42, .008);
    /* 浅色下网格线用深色，不透明度更低 —— 白底对纹理更敏感 */
    --twb-grid-line: rgba(15, 23, 42, .010);
    --twb-top-light: rgba(15, 23, 42, .008);

    --twb-line: var(--dshe-border, rgba(15, 23, 42, .10));
    --twb-line-strong: rgba(15, 23, 42, .18);
    --twb-hairline: rgba(15, 23, 42, .06);
    --twb-edge-light: rgba(255, 255, 255, .9);

    --twb-fg: var(--dshe-foreground, #0f172a);
    --twb-fg-2: rgba(15, 23, 42, .78);
    --twb-fg-3: rgba(15, 23, 42, .62);
    --twb-fg-4: rgba(15, 23, 42, .52);

    --twb-accent: var(--dshe-accent, #b45309);
    --twb-accent-dim: rgba(180, 83, 9, .09);
    --twb-accent-line: rgba(180, 83, 9, .28);
    --twb-accent-glow: rgba(180, 83, 9, .035);

    --twb-ok: #047857;
    --twb-ok-dim: rgba(4, 120, 87, .09);
    --twb-warn: #a16207;
    --twb-warn-dim: rgba(161, 98, 7, .10);
    --twb-err: #be123c;
    --twb-err-dim: rgba(190, 18, 60, .09);
    --twb-info: #1d4ed8;
    --twb-info-dim: rgba(29, 78, 216, .08);
    --twb-violet: #6d28d9;
    --twb-cyan: #0e7490;

    --twb-smoothing: auto;

    --twb-shadow-sm: 0 1px 2px rgba(15, 23, 42, .05);
    --twb-shadow: 0 1px 3px rgba(15, 23, 42, .06), 0 6px 16px rgba(15, 23, 42, .05);
    --twb-shadow-lg: 0 4px 12px rgba(15, 23, 42, .08), 0 20px 56px rgba(15, 23, 42, .10);
    --twb-glow: 0 0 0 3px var(--twb-accent-dim);
  }
}

/* ── 骨架 ───────────────────────────────────────────────── */
/*
 * box-sizing 必须在根上统一声明。
 *
 * 不加的话，任何 border/padding 都会在 width:100% 之外额外撑大元素；
 * 再叠加 .twb-root 的 overflow:hidden，超出部分直接被裁掉 ——
 * 表现就是窗口一窄右侧内容消失、且没有滚动条可找回。
 * 限定在 .twb-root 内，避免影响宿主自己的其它面板。
 */
.twb-root,
.twb-root *,
.twb-root *::before,
.twb-root *::after { box-sizing: border-box; }

.twb-root {
  display: flex; flex-direction: column; height: 100%;
  /* 容器本身不滚动：滚动交给 .twb-body，这样顶栏保持固定 */
  overflow: hidden;
  color: var(--twb-fg); font-family: var(--twb-font); font-size: var(--twb-fs-md);
  background: var(--twb-base-grad);
  -webkit-font-smoothing: var(--twb-smoothing, antialiased);
  -moz-osx-font-smoothing: grayscale;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
  line-height: 1.55;
  /* 防止 flex 子项被内容撑破（min-width 默认 auto 会阻止收缩） */
  min-width: 0;
}

/* 顶栏：毛玻璃 + 渐变底。sticky 让长页面滚动时导航常驻。 */
.twb-header {
  display: flex; align-items: stretch; gap: 0;
  padding: 0 var(--twb-sp-5); flex: 0 0 auto;
  background: var(--twb-raised-grad);
  backdrop-filter: saturate(140%) blur(12px);
  border-bottom: 1px solid var(--twb-line);
  box-shadow: var(--twb-shadow-sm);
  position: relative; z-index: 10;
}
/* 顶栏底部琥珀微光：从中间向两侧衰减，暗示当前所在分区 */
.twb-header::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--twb-accent-line) 22%, transparent 65%);
  opacity: .55; pointer-events: none;
}

.twb-brand { display: flex; align-items: center; gap: var(--twb-sp-2); padding-right: var(--twb-sp-4); flex: 0 0 auto; }
.twb-brand-mark {
  width: 22px; height: 22px; border-radius: 6px; flex: 0 0 auto;
  background: linear-gradient(140deg, var(--twb-accent), color-mix(in srgb, var(--twb-accent) 52%, #000));
  display: grid; place-items: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .3),
    0 1px 4px rgba(0, 0, 0, .4),
    0 0 12px var(--twb-accent-glow);
}
.twb-brand-mark svg { display: block; }
.twb-title {
  font-size: var(--twb-fs-md); font-weight: 650;
  white-space: nowrap; letter-spacing: -.012em;
}

.twb-tabs {
  display: flex; align-items: stretch; gap: 2px;
  overflow-x: auto; flex: 1 1 auto; min-width: 0;
  scrollbar-width: none; -ms-overflow-style: none;
}
.twb-tabs::-webkit-scrollbar { height: 0; }

.twb-group {
  display: flex; align-items: center; flex: 0 0 auto;
  font-size: var(--twb-fs-xs); font-weight: 650;
  letter-spacing: .12em; text-transform: uppercase;
  color: var(--twb-fg-4);
  padding: 0 var(--twb-sp-2) 0 var(--twb-sp-4);
  border-left: 1px solid var(--twb-hairline);
  margin-left: var(--twb-sp-1);
}
.twb-group:first-child { border-left: none; margin-left: 0; padding-left: var(--twb-sp-1); }

.twb-tab {
  position: relative; flex: 0 0 auto;
  border: none; background: none; cursor: pointer;
  padding: calc(var(--twb-sp-3) + 2px) var(--twb-sp-2);
  font: inherit; font-size: var(--twb-fs-base); font-weight: 500;
  color: var(--twb-fg-3); white-space: nowrap;
  border-radius: var(--twb-r-sm) var(--twb-r-sm) 0 0;
  transition: color var(--twb-dur) var(--twb-ease), background var(--twb-dur) var(--twb-ease);
}
.twb-tab:hover { color: var(--twb-fg-2); background: var(--twb-hover); }
.twb-tab.active { color: var(--twb-fg); font-weight: 650; background: var(--twb-selected); }
/* 激活指示：2px 琥珀短横 + 柔和外发光 */
.twb-tab.active::after {
  content: ""; position: absolute; left: var(--twb-sp-2); right: var(--twb-sp-2); bottom: 0; height: 2px;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(90deg, transparent, var(--twb-accent) 25%, var(--twb-accent) 75%, transparent);
  box-shadow: 0 -2px 10px var(--twb-accent-glow);
}

/* ── 主体 ───────────────────────────────────────────────── */
/*
 * 横向滚动条的关键：flex 子项默认 min-width:auto，会被内容顶到最小需求宽度，
 * 于是容器不再收缩、超出的部分被 .twb-root 的 overflow:hidden 裁掉且无法滚动。
 * 显式 min-width:0 让 .twb-body 能缩到比内容更窄，从而由自己的 overflow:auto
 * 接管横向滚动。
 */
.twb-body {
  flex: 1 1 auto;
  overflow: auto;
  min-width: 0;
  overscroll-behavior: contain;
  padding: var(--twb-sp-6) var(--twb-sp-6) var(--twb-sp-8);
  scrollbar-width: thin;
  scrollbar-color: var(--twb-line-strong) transparent;
}
.twb-body::-webkit-scrollbar { width: 10px; height: 10px; }
.twb-body::-webkit-scrollbar-thumb {
  background: var(--twb-line-strong); border-radius: 6px;
  border: 3px solid transparent; background-clip: content-box;
}
.twb-body::-webkit-scrollbar-thumb:hover { background: var(--twb-fg-4); background-clip: content-box; }
.twb-body::-webkit-scrollbar-track { background: transparent; }

/* 页面标题区：左侧琥珀竖条 + 大号标题 + 灰色副标题，形成明确的视觉起点 */
.twb-page-head {
  display: flex; align-items: flex-end; gap: var(--twb-sp-4);
  margin-bottom: var(--twb-sp-5); flex-wrap: wrap;
  padding-bottom: var(--twb-sp-4);
  border-bottom: 1px solid var(--twb-hairline);
}
.twb-page-title {
  position: relative;
  font-size: var(--twb-fs-lg); font-weight: 680;
  letter-spacing: -.025em; line-height: 1.25;
  padding-left: var(--twb-sp-3);
}
.twb-page-title::before {
  content: ""; position: absolute; left: 0; top: .18em; bottom: .18em; width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--twb-accent), color-mix(in srgb, var(--twb-accent) 40%, transparent));
  box-shadow: 0 0 8px var(--twb-accent-glow);
}
.twb-page-sub {
  color: var(--twb-fg-3); font-size: var(--twb-fs-sm);
  padding-bottom: 3px; line-height: 1.5;
}

/* ── 工具栏 ─────────────────────────────────────────────── */
.twb-toolbar {
  display: flex; gap: 8px; align-items: center;
  margin-bottom: 14px; flex-wrap: wrap;
}
.twb-toolbar .spacer { flex: 1 1 auto; }

/* ── 控件 ───────────────────────────────────────────────── */
.twb-input, .twb-select {
  font: inherit; font-size: var(--twb-fs-base);
  background: var(--twb-base);
  color: var(--twb-fg);
  border: 1px solid var(--twb-line); border-radius: var(--twb-r-sm);
  padding: 8px var(--twb-sp-3); min-width: 0;
  transition:
    border-color var(--twb-dur) var(--twb-ease),
    background var(--twb-dur) var(--twb-ease),
    box-shadow var(--twb-dur) var(--twb-ease);
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, .12);
}
.twb-input { min-width: 170px; }
.twb-input::placeholder { color: var(--twb-fg-4); }
.twb-input:hover, .twb-select:hover { border-color: var(--twb-line-strong); }
.twb-input:focus, .twb-select:focus {
  border-color: var(--twb-accent-line);
  background: var(--twb-raised);
  box-shadow: var(--twb-glow), inset 0 1px 2px rgba(0, 0, 0, .08);
}
.twb-select {
  cursor: pointer; padding-right: 30px; appearance: none;
  background-image:
    linear-gradient(45deg, transparent 49%, var(--twb-fg-3) 50%),
    linear-gradient(-45deg, transparent 49%, var(--twb-fg-3) 50%);
  background-position: calc(100% - 15px) 52%, calc(100% - 10px) 52%;
  background-size: 5px 5px, 5px 5px; background-repeat: no-repeat;
}
textarea.twb-input { resize: vertical; line-height: 1.65; min-height: 64px; font-family: inherit; }
.twb-input[type="number"] { font-family: var(--twb-mono); }

/* 文件选择控件统一外观 */
.twb-input[type="file"] {
  padding: var(--twb-sp-2); font-size: var(--twb-fs-sm);
  color: var(--twb-fg-3); cursor: pointer;
}
.twb-input[type="file"]::file-selector-button {
  font: inherit; font-size: var(--twb-fs-sm);
  margin-right: var(--twb-sp-2);
  padding: 5px var(--twb-sp-3); border-radius: 4px; cursor: pointer;
  border: 1px solid var(--twb-line); background: var(--twb-overlay);
  color: var(--twb-fg-2);
}

/* 复选框：默认样式太原始，换成品牌色 */
.twb-input[type="checkbox"], input[type="checkbox"] {
  accent-color: var(--twb-accent);
  width: 14px; height: 14px; cursor: pointer;
  vertical-align: middle;
}

/* ── 按钮 ───────────────────────────────────────────────── */
.twb-btn {
  font: inherit; font-size: var(--twb-fs-base); font-weight: 600;
  cursor: pointer; white-space: nowrap;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px var(--twb-sp-4); border-radius: var(--twb-r-sm);
  border: 1px solid transparent;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--twb-accent) 90%, #fff),
    color-mix(in srgb, var(--twb-accent) 88%, #000)
  );
  color: #1a1206;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, .3),
    inset 0 1px 0 rgba(255, 255, 255, .26);
  transition:
    filter var(--twb-dur) var(--twb-ease),
    transform var(--twb-dur) var(--twb-ease),
    box-shadow var(--twb-dur) var(--twb-ease);
}
.twb-btn:hover:not(:disabled) {
  filter: brightness(1.08);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, .32),
    0 0 14px var(--twb-accent-glow),
    inset 0 1px 0 rgba(255, 255, 255, .3);
}
.twb-btn:active:not(:disabled) { transform: translateY(1px); filter: brightness(.97); }

.twb-btn.secondary {
  background: var(--twb-raised-grad); color: var(--twb-fg-2);
  border-color: var(--twb-line); box-shadow: var(--twb-shadow-sm);
}
.twb-btn.secondary:hover:not(:disabled) {
  color: var(--twb-fg); border-color: var(--twb-line-strong);
  background: var(--twb-overlay-grad); filter: none;
}

.twb-btn.ghost {
  background: transparent; color: var(--twb-fg-3);
  border-color: transparent; box-shadow: none;
}
.twb-btn.ghost:hover:not(:disabled) {
  color: var(--twb-fg); background: var(--twb-hover); filter: none;
}

.twb-btn.danger {
  background: linear-gradient(180deg, var(--twb-err), color-mix(in srgb, var(--twb-err) 84%, #000));
  color: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, .3);
}
.twb-btn.danger:hover:not(:disabled) { filter: brightness(1.08); }

.twb-btn:disabled { opacity: .42; cursor: not-allowed; }
.twb-btn.sm { padding: 5px var(--twb-sp-2); font-size: var(--twb-fs-sm); font-weight: 550; }
.twb-btn.icon { padding: 7px; width: 32px; height: 32px; }

/* ── 表格：数据展示核心资产 ─────────────────────────────── */
.twb-table-wrap {
  border: 1px solid var(--twb-line); border-radius: var(--twb-r);
  /* 列多时横向可滚，而不是被裁掉。圆角靠 border-radius 而非 overflow:hidden，
     否则会把滚动条一起裁掉。 */
  overflow-x: auto;
  overflow-y: visible;
  background: var(--twb-raised-grad);
  box-shadow: var(--twb-shadow-sm);
  min-width: 0;
}
/* 表格自身保证最小可读宽度：低于此值就交给外层滚动条 */
.twb-table { min-width: 420px; }
.twb-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.twb-table th {
  text-align: left; font-size: var(--twb-fs-xs); font-weight: 680;
  letter-spacing: .09em; text-transform: uppercase;
  color: var(--twb-fg-3);
  padding: var(--twb-sp-3) var(--twb-sp-3);
  white-space: nowrap;
  background: var(--twb-sunken);
  border-bottom: 1px solid var(--twb-line);
  position: sticky; top: 0; z-index: 2;
  backdrop-filter: blur(8px);
}
.twb-table td {
  padding: var(--twb-sp-3);
  font-size: var(--twb-fs-base);
  color: var(--twb-fg);
  border-bottom: 1px solid var(--twb-hairline);
  vertical-align: middle;
  line-height: 1.5;
}
.twb-table tbody tr:last-child td { border-bottom: none; }
.twb-table tr.row {
  cursor: pointer;
  transition: background var(--twb-dur) var(--twb-ease);
}
.twb-table tr.row:hover { background: var(--twb-hover); }
/* hover 时左缘亮起琥珀条：明确指示当前行 */
.twb-table tr.row:hover td:first-child {
  box-shadow: inset 3px 0 0 var(--twb-accent);
}
/* 数字列等宽右对齐，便于纵向比对 */
.twb-table td.num, .twb-table th.num {
  text-align: right;
  font-family: var(--twb-mono);
  font-size: var(--twb-fs-base);
  font-variant-numeric: tabular-nums;
}
.twb-table td.mono { font-family: var(--twb-mono); font-size: var(--twb-fs-base); }
/* 次要列：弱化但不低于 fg-3 */
.twb-table td .twb-muted, .twb-table td.muted {
  color: var(--twb-fg-3); font-size: var(--twb-fs-sm);
}

/* ── 徽章：状态与分类 ───────────────────────────────────── */
.twb-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 9px; border-radius: 5px;
  font-size: var(--twb-fs-sm); font-weight: 600; line-height: 1.6;
  background: var(--twb-sunken); color: var(--twb-fg-2);
  border: 1px solid var(--twb-line);
  white-space: nowrap;
  letter-spacing: .01em;
}
.twb-badge::before {
  content: ""; width: 5px; height: 5px; border-radius: 50%;
  background: currentColor; opacity: .8; flex: 0 0 auto;
  box-shadow: 0 0 5px currentColor;
}
.twb-badge.plain::before { display: none; }
.twb-badge.ok {
  color: var(--twb-ok); background: var(--twb-ok-dim);
  border-color: color-mix(in srgb, var(--twb-ok) 32%, transparent);
}
.twb-badge.warn {
  color: var(--twb-warn); background: var(--twb-warn-dim);
  border-color: color-mix(in srgb, var(--twb-warn) 32%, transparent);
}
.twb-badge.err {
  color: var(--twb-err); background: var(--twb-err-dim);
  border-color: color-mix(in srgb, var(--twb-err) 32%, transparent);
}
.twb-badge.info {
  color: var(--twb-info); background: var(--twb-info-dim);
  border-color: color-mix(in srgb, var(--twb-info) 32%, transparent);
}
.twb-badge.accent {
  color: var(--twb-accent); background: var(--twb-accent-dim);
  border-color: var(--twb-accent-line);
}

/* ── 统计卡：数据看板的核心视觉单元 ──────────────────────── */
.twb-cards {
  display: grid; gap: var(--twb-sp-3); margin-bottom: var(--twb-sp-5);
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
.twb-card {
  position: relative; overflow: hidden;
  border: 1px solid var(--twb-line); border-radius: var(--twb-r);
  padding: var(--twb-sp-4);
  background: var(--twb-raised-grad);
  box-shadow: var(--twb-shadow-sm);
  transition:
    border-color var(--twb-dur) var(--twb-ease),
    transform var(--twb-dur) var(--twb-ease),
    box-shadow var(--twb-dur) var(--twb-ease);
}
/* 顶部 1px 高光：模拟玻璃/金属边缘，制造精致度 */
.twb-card::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--twb-edge-light), transparent);
  pointer-events: none;
}
/* 左上角径向光晕：让色块不平，暗示光源方向 */
.twb-card::after {
  content: ""; position: absolute; top: -40%; left: -20%; width: 70%; height: 140%;
  background: radial-gradient(closest-side, var(--twb-accent-glow), transparent 72%);
  opacity: 0; pointer-events: none;
  transition: opacity var(--twb-dur-slow) var(--twb-ease);
}
.twb-card:hover {
  border-color: var(--twb-line-strong);
  transform: translateY(-1px);
  box-shadow: var(--twb-shadow);
}
.twb-card:hover::after { opacity: .5; }

.twb-card .k {
  position: relative; z-index: 1;
  font-size: var(--twb-fs-xs); font-weight: 650;
  letter-spacing: .09em; text-transform: uppercase;
  color: var(--twb-fg-4); margin-bottom: var(--twb-sp-2);
}
.twb-card .v {
  position: relative; z-index: 1;
  font-size: var(--twb-fs-xl); font-weight: 640; line-height: 1.15;
  font-family: var(--twb-mono); letter-spacing: -.03em;
  color: var(--twb-fg);
}
.twb-card .sub {
  position: relative; z-index: 1;
  font-size: var(--twb-fs-sm); color: var(--twb-fg-3); margin-top: var(--twb-sp-1);
  line-height: 1.45;
}
.twb-card.tone-ok { border-color: color-mix(in srgb, var(--twb-ok) 28%, var(--twb-line)); }
.twb-card.tone-ok .v { color: var(--twb-ok); }
.twb-card.tone-ok::after { background: radial-gradient(closest-side, var(--twb-ok-dim), transparent 72%); }
.twb-card.tone-warn { border-color: color-mix(in srgb, var(--twb-warn) 28%, var(--twb-line)); }
.twb-card.tone-warn .v { color: var(--twb-warn); }
.twb-card.tone-warn::after { background: radial-gradient(closest-side, var(--twb-warn-dim), transparent 72%); }
.twb-card.tone-err { border-color: color-mix(in srgb, var(--twb-err) 32%, var(--twb-line)); }
.twb-card.tone-err .v { color: var(--twb-err); }
.twb-card.tone-err::after { background: radial-gradient(closest-side, var(--twb-err-dim), transparent 72%); }
.twb-card.tone-accent { border-color: var(--twb-accent-line); }
.twb-card.tone-accent .v { color: var(--twb-accent); }

/* ── 分节标题：内容分组的视觉锚点 ────────────────────────── */
.twb-section {
  display: flex; align-items: center; gap: var(--twb-sp-2);
  margin: var(--twb-sp-6) 0 var(--twb-sp-3);
  font-size: var(--twb-fs-base); font-weight: 640;
  color: var(--twb-fg-2); letter-spacing: -.005em;
}
.twb-section::before {
  content: ""; width: 3px; height: 13px; border-radius: 2px;
  background: linear-gradient(180deg, var(--twb-accent), color-mix(in srgb, var(--twb-accent) 45%, transparent));
  box-shadow: 0 0 6px var(--twb-accent-glow);
  flex: 0 0 auto;
}
.twb-section::after {
  content: ""; flex: 1 1 auto; height: 1px;
  background: linear-gradient(90deg, var(--twb-line-strong), transparent 78%);
}
.twb-section:first-child { margin-top: 0; }

/* ── 抽屉 ───────────────────────────────────────────────── */
.twb-drawer-mask {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0, 0, 0, .55);
  backdrop-filter: blur(3px);
  animation: twbFade var(--twb-dur) var(--twb-ease);
}
.twb-drawer {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: min(760px, 94vw);
  display: flex; flex-direction: column; z-index: 1001;
  background: var(--twb-base-grad); color: var(--twb-fg);
  border-left: 1px solid var(--twb-line-strong);
  box-shadow: var(--twb-shadow-lg);
  animation: twbSlide 220ms var(--twb-ease);
}
.twb-drawer header {
  display: flex; align-items: center; justify-content: space-between; gap: var(--twb-sp-3);
  padding: var(--twb-sp-4) var(--twb-sp-5); flex: 0 0 auto;
  background: var(--twb-raised-grad);
  border-bottom: 1px solid var(--twb-line);
  position: relative;
}
.twb-drawer header::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
  background: linear-gradient(90deg, var(--twb-accent-line), transparent 70%);
  opacity: .6;
}
.twb-drawer header .h {
  font-size: var(--twb-fs-md); font-weight: 660; letter-spacing: -.015em;
}
.twb-drawer header .s {
  font-size: var(--twb-fs-sm); color: var(--twb-fg-3); margin-top: 2px;
}
.twb-drawer .content {
  flex: 1 1 auto; overflow: auto;
  padding: var(--twb-sp-5);
}

@keyframes twbFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes twbSlide { from { transform: translateX(28px); opacity: .5 } to { transform: none; opacity: 1 } }

/* ── 表单 ───────────────────────────────────────────────── */
.twb-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: var(--twb-sp-3); }
.twb-field > label {
  font-size: var(--twb-fs-xs); font-weight: 660;
  letter-spacing: .07em; text-transform: uppercase;
  color: var(--twb-fg-3);
}
.twb-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--twb-sp-3); }
.twb-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--twb-sp-3); }
@media (max-width: 760px) { .twb-grid2, .twb-grid3 { grid-template-columns: 1fr; } }

/* ── 空态 ───────────────────────────────────────────────── */
.twb-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--twb-sp-3); padding: 56px var(--twb-sp-6); text-align: center;
  border: 1px dashed var(--twb-line-strong); border-radius: var(--twb-r);
  background: var(--twb-sunken);
}
.twb-empty .ico {
  color: var(--twb-fg-4);
  width: 46px; height: 46px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--twb-raised);
  border: 1px solid var(--twb-line);
  box-shadow: var(--twb-shadow-sm);
}
.twb-empty .t {
  font-size: var(--twb-fs-md); font-weight: 620; color: var(--twb-fg-2);
  letter-spacing: -.01em;
}
.twb-empty .d {
  font-size: var(--twb-fs-sm); color: var(--twb-fg-3);
  max-width: 400px; line-height: 1.65;
}

/* ── Toast ──────────────────────────────────────────────── */
.twb-toast-stack {
  position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; gap: 8px; z-index: 1100;
  pointer-events: none; align-items: center;
}
.twb-toast {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 15px; border-radius: var(--twb-r);
  font-size: var(--twb-fs-base); font-weight: 500;
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
.twb-steps { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: var(--twb-sp-4); }
.twb-step {
  position: relative;
  padding: 6px var(--twb-sp-3); border-radius: var(--twb-r-sm);
  font-size: var(--twb-fs-sm); font-weight: 550;
  border: 1px solid var(--twb-line);
  background: var(--twb-sunken);
  color: var(--twb-fg-3); cursor: pointer;
  transition: all var(--twb-dur) var(--twb-ease);
}
.twb-step:hover {
  border-color: var(--twb-line-strong); color: var(--twb-fg-2);
  background: var(--twb-hover);
}
.twb-step.done {
  background: var(--twb-accent-dim); color: var(--twb-accent);
  border-color: var(--twb-accent-line); font-weight: 650;
  box-shadow: 0 0 10px var(--twb-accent-glow);
}

/* ── 进度条 ─────────────────────────────────────────────── */
.twb-bar-track {
  height: 7px; border-radius: 4px;
  background: var(--twb-sunken);
  border: 1px solid var(--twb-hairline);
  overflow: hidden;
}
.twb-bar {
  height: 100%; border-radius: 4px; min-width: 3px;
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--twb-accent) 60%, transparent),
    var(--twb-accent));
  box-shadow: 0 0 8px var(--twb-accent-glow);
  transition: width var(--twb-dur-slow) var(--twb-ease);
}

/* ── 文本工具 ───────────────────────────────────────────── */
.twb-muted { color: var(--twb-fg-3); font-size: var(--twb-fs-base); }
.twb-dim { color: var(--twb-fg-4); font-size: var(--twb-fs-sm); }
.twb-mono { font-family: var(--twb-mono); font-variant-numeric: tabular-nums; }

/* KV 列表：左侧标签定宽，右侧值弹性，行间用发丝线分隔 */
.twb-kv { display: flex; flex-direction: column; }
.twb-kv .r {
  display: flex; gap: var(--twb-sp-3); align-items: baseline;
  font-size: var(--twb-fs-base);
  padding: 7px 0;
  border-bottom: 1px solid var(--twb-hairline);
}
.twb-kv .r:last-child { border-bottom: none; }
.twb-kv .r .k {
  color: var(--twb-fg-4); min-width: 96px; flex: 0 0 auto;
  font-size: var(--twb-fs-sm); font-weight: 550;
}
.twb-kv .r .v { color: var(--twb-fg); word-break: break-word; }

/* ── 分段控件 ───────────────────────────────────────────── */
.twb-seg {
  display: inline-flex; gap: 2px; padding: 2px;
  background: var(--twb-sunken); border: 1px solid var(--twb-line);
  border-radius: var(--twb-r-sm);
}
.twb-seg button {
  font: inherit; font-size: var(--twb-fs-sm); font-weight: 500;
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
  display: grid; gap: var(--twb-sp-3); padding-bottom: 6px;
  /* 列宽收窄到 150px：7 列总宽 7*150+6*12≈1122px，1440 屏可完整放下；
     更窄时由外层 .twb-body 的统一横向滚动条接管，不在这里再套一层 */
  grid-auto-flow: column; grid-auto-columns: minmax(150px, 1fr);
  min-width: 0;
}
.twb-col-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 9px; margin-bottom: 9px;
  border-radius: var(--twb-r-sm);
  background: var(--twb-sunken);
  border-top: 2px solid var(--twb-fg-4);
  font-size: var(--twb-fs-sm); font-weight: 600; letter-spacing: .03em;
}
.twb-col-head .n {
  font-family: var(--twb-mono); font-size: var(--twb-fs-sm);
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
.twb-tile .t { font-size: var(--twb-fs-sm); font-weight: 600; color: var(--twb-fg); margin-bottom: 3px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.twb-tile .m { font-size: var(--twb-fs-xs); color: var(--twb-fg-4); margin-bottom: 7px; }
.twb-tile .acts { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 7px; }
.twb-tile .acts button {
  font: inherit; font-size: var(--twb-fs-xs); padding: 1px 6px; border-radius: 3px;
  border: 1px solid var(--twb-line); background: transparent;
  color: var(--twb-fg-4); cursor: pointer;
  transition: all var(--twb-dur) var(--twb-ease);
}
.twb-tile .acts button:hover { color: var(--twb-accent); border-color: var(--twb-accent-line); }

/* ── 代码/日志块 ────────────────────────────────────────── */
.twb-pre {
  font-family: var(--twb-mono); font-size: var(--twb-fs-sm); line-height: 1.7;
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
  font-size: var(--twb-fs-xs); font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: var(--twb-fg-4); padding: 8px 10px 4px;
}
.twb-cmdk-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 11px; border-radius: var(--twb-r-sm);
  cursor: pointer; font-size: var(--twb-fs-base); color: var(--twb-fg-2);
}
.twb-cmdk-item.on { background: var(--twb-accent-dim); color: var(--twb-fg); }
.twb-cmdk-item .hint { margin-left: auto; font-size: var(--twb-fs-xs); color: var(--twb-fg-4); }
.twb-cmdk-foot {
  display: flex; gap: 14px; padding: 8px 14px;
  border-top: 1px solid var(--twb-line);
  background: var(--twb-sunken);
  font-size: var(--twb-fs-xs); color: var(--twb-fg-4);
}
.twb-cmdk-foot kbd {
  font-family: var(--twb-mono); font-size: var(--twb-fs-xs);
  padding: 1px 5px; border-radius: 3px;
  border: 1px solid var(--twb-line); background: var(--twb-raised);
}
.twb-cmdk-empty { padding: 28px; text-align: center; color: var(--twb-fg-4); font-size: var(--twb-fs-base); }

/* ── 顶栏搜索触发与右侧工具 ─────────────────────────────── */
.twb-cmd-trigger {
  display: inline-flex; align-items: center; gap: 7px;
  margin: 0 0 0 14px; padding: 5px 9px;
  border: 1px solid var(--twb-line); border-radius: var(--twb-r-sm);
  background: var(--twb-sunken); color: var(--twb-fg-4);
  font: inherit; font-size: var(--twb-fs-sm); cursor: pointer;
  transition: color var(--twb-dur) var(--twb-ease), border-color var(--twb-dur) var(--twb-ease);
  flex: 0 0 auto;
}
.twb-cmd-trigger:hover {
  color: var(--twb-fg-2); border-color: var(--twb-line-strong);
}
.twb-cmd-trigger kbd {
  font-family: var(--twb-mono); font-size: var(--twb-fs-xs);
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

/* ── 通用布局工具：替代各面板的重复内联样式 ─────────────── */
/* 双栏主体：左侧列表定宽，右侧详情自适应 */
.twb-split {
  display: grid; gap: var(--twb-sp-4); align-items: start;
  /* 右侧用 minmax(0,1fr)：1fr 的最小值默认是 auto，会被内容顶宽 */
  grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
  min-width: 0;
}
@media (max-width: 1080px) {
  .twb-split { grid-template-columns: minmax(0, 1fr); }
}

/* 面板容器：统一表面、边框、留白 */
.twb-panel {
  border: 1px solid var(--twb-line); border-radius: var(--twb-r);
  background: var(--twb-raised-grad); box-shadow: var(--twb-shadow-sm);
  overflow: hidden;
}
.twb-panel-pad { padding: var(--twb-sp-4); }
/* 面板小标题：用于列表头部、区块标签 */
.twb-panel-head {
  display: flex; align-items: center; justify-content: space-between; gap: var(--twb-sp-2);
  padding: var(--twb-sp-3) var(--twb-sp-4);
  border-bottom: 1px solid var(--twb-line);
  background: var(--twb-sunken);
  font-size: var(--twb-fs-sm); font-weight: 640;
  color: var(--twb-fg-2); letter-spacing: .02em;
}

/* 可点击行：列表项统一交互 */
.twb-row {
  display: flex; align-items: center; gap: var(--twb-sp-2);
  padding: var(--twb-sp-3) var(--twb-sp-4);
  border-bottom: 1px solid var(--twb-hairline);
  border-left: 2px solid transparent;
  cursor: pointer; font-size: var(--twb-fs-base);
  transition: background var(--twb-dur) var(--twb-ease),
              border-color var(--twb-dur) var(--twb-ease);
}
.twb-row:last-child { border-bottom: none; }
.twb-row:hover { background: var(--twb-hover); }
.twb-row.on {
  background: var(--twb-selected);
  border-left-color: var(--twb-accent);
}
.twb-row .t {
  font-weight: 580; color: var(--twb-fg);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.twb-row .m { font-size: var(--twb-fs-sm); color: var(--twb-fg-4); }

/* 拖放区：虚线边框 + 悬停高亮 */
.twb-drop {
  border: 1px dashed var(--twb-line-strong);
  border-radius: var(--twb-r);
  background: var(--twb-sunken);
  padding: var(--twb-sp-5) var(--twb-sp-4);
  text-align: center; cursor: pointer;
  transition: all var(--twb-dur) var(--twb-ease);
}
.twb-drop:hover, .twb-drop.over {
  border-color: var(--twb-accent);
  background: var(--twb-accent-dim);
}
.twb-drop .t { font-size: var(--twb-fs-base); color: var(--twb-fg-2); margin-bottom: var(--twb-sp-1); }
.twb-drop .d { font-size: var(--twb-fs-sm); color: var(--twb-fg-4); line-height: 1.55; }

/* 警示条：用于错误说明、权限提示 */
.twb-alert {
  display: flex; align-items: flex-start; gap: var(--twb-sp-2);
  padding: var(--twb-sp-3) var(--twb-sp-4);
  border-radius: var(--twb-r-sm);
  font-size: var(--twb-fs-base); line-height: 1.6;
  border: 1px solid var(--twb-line);
  background: var(--twb-sunken); color: var(--twb-fg-2);
}
.twb-alert.warn {
  color: var(--twb-warn); background: var(--twb-warn-dim);
  border-color: color-mix(in srgb, var(--twb-warn) 32%, transparent);
}
.twb-alert.err {
  color: var(--twb-err); background: var(--twb-err-dim);
  border-color: color-mix(in srgb, var(--twb-err) 32%, transparent);
}
.twb-alert.info {
  color: var(--twb-info); background: var(--twb-info-dim);
  border-color: color-mix(in srgb, var(--twb-info) 32%, transparent);
}

/* 消息气泡：客服审核台用 */
.twb-bubble {
  max-width: 560px;
  padding: var(--twb-sp-3) var(--twb-sp-4);
  border-radius: 14px 14px 14px 4px;
  background: var(--twb-sunken);
  border: 1px solid var(--twb-line);
  font-size: var(--twb-fs-base); line-height: 1.7;
  color: var(--twb-fg-2); white-space: pre-wrap;
}

/* 分段卡：Mail 页面的左右选用 */
.twb-scroll { max-height: 480px; overflow-y: auto; }

/* 内联网格工具 */
.twb-flex { display: flex; gap: var(--twb-sp-2); align-items: center; }
.twb-flex-wrap { flex-wrap: wrap; }
.twb-grow { flex: 1 1 auto; min-width: 0; }
.twb-right { margin-left: auto; }
.twb-mt-2 { margin-top: var(--twb-sp-2); }
.twb-mt-4 { margin-top: var(--twb-sp-4); }
.twb-mb-2 { margin-bottom: var(--twb-sp-2); }
.twb-mb-4 { margin-bottom: var(--twb-sp-4); }

`;

export function injectStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("twb-styles")) return;
  const el = document.createElement("style");
  el.id = "twb-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}
