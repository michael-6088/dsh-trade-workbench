import * as React from "react";

/**
 * 面板级错误边界。
 *
 * 单个面板抛错（接口返回畸形数据、某字段为 undefined 时访问深层属性等）
 * 不应该让整个工作台白屏 —— 用户会以为插件坏了，实际只是某一页出问题。
 * 这里兜住异常，保留导航可用，把错误原文和重试按钮就地给出来。
 */
export class PanelBoundary extends React.Component<
  { tab: string; children?: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // 控制台留一份完整栈，方便排查；界面只展示摘要。
    console.error("[trade-workbench] panel crashed:", this.props.tab, error, info);
  }

  componentDidUpdate(prev: any) {
    // 切换 Tab 时自动复位，避免一个面板的错误持续挡住其他页面。
    if (prev.tab !== this.props.tab && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return React.createElement("div", { className: "twb-empty", style: { borderStyle: "solid" } },
        React.createElement("div", { className: "t" }, "这个页面出错了"),
        React.createElement("div", { className: "d", style: { fontFamily: "var(--twb-mono)", fontSize: 11.5 } },
          String(this.state.error.message ?? this.state.error)),
        React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 6 } },
          React.createElement("button", {
            className: "twb-btn secondary sm",
            onClick: () => this.setState({ error: null }),
          }, "重试"),
          React.createElement("span", { className: "twb-dim", style: { alignSelf: "center" } },
            "其他页面仍可正常使用")));
    }
    return this.props.children;
  }
}
