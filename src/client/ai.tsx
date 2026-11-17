import * as React from "react";
import { useState } from "react";
import { api } from "./api.ts";
import { Select } from "./ui.tsx";

// AI 起草：宿主模型走会话交接（prompt → 新会话草稿）；直连走 host 代理
export function attachBridge(bridge: { handoff: (prompt: string) => void }) { _bridge = bridge; }
let _bridge: { handoff: (prompt: string) => void } | null = null;

export const AI_KINDS: { id: string; label: string; build: (ctxText: string) => string }[] = [
  { id: "dev-mail", label: "开发信", build: (c) => "我是中国的外贸业务员，请根据以下客户与产品背景，用英文写一封专业、简短（150 词内）的开发信，突出可靠交付与差异化，包含邮件主题行。背景：\n" + c },
  { id: "follow-mail", label: "跟进信", build: (c) => "以下是一个外贸询盘的跟进记录，请写一封英文跟进邮件：礼貌催促、给出一个回复钩子（如样品/新价格/交期提前），120 词内。记录：\n" + c },
  { id: "translate", label: "翻译润色", build: (c) => "把下面的中文翻译成地道的商务英语（或把英文润色为规范商务表达），保持数据与术语不变：\n" + c },
  { id: "doc-check", label: "单证要素核对", build: (c) => "这是外贸单证要素清单，请检查缺项与逻辑冲突（唛头、件重尺、HS 编码、收发货人一致性），输出问题列表：\n" + c },
];

export function AiDraft(props: { context: string; title: string }) {
  const [kind, setKind] = useState("dev-mail");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const def = AI_KINDS.find((k) => k.id === kind)!;
  const prompt = def.build(props.context);
  const handoff = () => _bridge?.handoff(prompt);
  const direct = async () => {
    setBusy(true); setOut("");
    try { const r: any = await api.aiChat([{ role: "user", content: prompt }]); setOut(r.content); }
    catch (e: any) { setOut("直连失败：" + e.message + "\n（可改用「交给 AI 会话」）"); }
    finally { setBusy(false); }
  };
  return React.createElement("div", { className: "twb-section" },
    React.createElement("div", { className: "twb-toolbar" },
      React.createElement("strong", null, "AI 起草 · " + props.title),
      React.createElement(Select, { value: kind, onChange: (e: any) => setKind(e.target.value) },
        AI_KINDS.map((k) => React.createElement("option", { key: k.id, value: k.id }, k.label))),
      React.createElement("button", { className: "twb-btn", onClick: handoff, title: "把提示词注入新会话草稿，由你发送" }, "交给 AI 会话"),
      React.createElement("button", { className: "twb-btn secondary", onClick: direct, disabled: busy }, busy ? "生成中…" : "面板直连生成")),
    out ? React.createElement("pre", { style: { whiteSpace: "pre-wrap", fontSize: 13 } }, out) : null);
}