// 可选直连 OpenAI 兼容端点；key 只留在 host 侧
export async function aiChat(settings: Record<string, string>, messages: any[]): Promise<any> {
  const base = (settings.ai_base ?? "").replace(/\/+$/, "");
  const key = settings.ai_key ?? "";
  const model = settings.ai_model ?? "";
  if (!base || !key || !model) { const e: any = new Error("AI 直连未配置：请在设置页填写 ai_base / ai_key / ai_model"); e.status = 501; throw e; }
  const res = await fetch(base + "/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer " + key },
    body: JSON.stringify({ model, messages, temperature: 0.7 }),
  });
  if (!res.ok) { const e: any = new Error("AI 上游 " + res.status + " " + (await res.text()).slice(0, 200)); e.status = 502; throw e; }
  const data: any = await res.json();
  return { content: data?.choices?.[0]?.message?.content ?? "" };
}
