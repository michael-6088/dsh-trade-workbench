/**
 * 传输层：所有读写收敛到 Connection 共享通道上的单一 RPC 端点
 *   POST /api/trade-workbench/rpc
 * 用同源 fetch（桌面载体的页面同样由 webServer 的 authenticatedUrl 提供，
 * 并已由 shell 注入认证 cookie），因此不依赖 webServer 前缀路由。
 */
const RPC = "/api/trade-workbench/rpc";

type Op =
  | { op: "dashboard" } | { op: "settings"; body?: Record<string, string> }
  | { op: "ai"; messages: { role: string; content: string }[] }
  | { op: "list"; domain: string; q?: string } | { op: "get"; domain: string; id: number }
  | { op: "create"; domain: string; body: any } | { op: "update"; domain: string; id: number; body: any }
  | { op: "delete"; domain: string; id: number }
  | { op: "to-order"; id: number } | { op: "balance"; id: number };

/** 获客子系统 op 统一走 "模块/动作" 两段式，参数放在 args 里。 */
export async function leadsCall<T = any>(op: string, args: Record<string, any> = {}): Promise<T> {
  return call<T>({ op, args } as any);
}

async function call<T = any>(payload: Op | Record<string, any>): Promise<T> {
  const res = await fetch(RPC, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error(data?.error?.message ?? "HTTP " + res.status);
  return data as T;
}

export const api = {
  dashboard: () => call({ op: "dashboard" }),
  getSettings: () => call<Record<string, string>>({ op: "settings" }),
  putSettings: (body: Record<string, string>) => call({ op: "settings", body }),
  aiChat: (messages: { role: string; content: string }[]) => call({ op: "ai", messages }),

  list: (domain: string, q = "") => call<any[]>({ op: "list", domain, q }),
  get: (domain: string, id: number) => call<any>({ op: "get", domain, id }),
  create: (domain: string, body: any) => call<any>({ op: "create", domain, body }),
  update: (domain: string, id: number, body: any) => call<any>({ op: "update", domain, id, body }),
  remove: (domain: string, id: number) => call<any>({ op: "delete", domain, id }),
  toOrder: (quoteId: number) => call<any>({ op: "to-order", id: quoteId }),
  balance: (orderId: number) => call<any>({ op: "balance", id: orderId }),

  /** 单证上传（multipart，独立 exact 路由）。 */
  async upload(form: FormData): Promise<any> {
    const res = await fetch("/api/trade-workbench/upload", { method: "POST", body: form, credentials: "same-origin" });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error?.message ?? "HTTP " + res.status);
    return data;
  },
  piUrl: (quoteId: number) => "/api/trade-workbench/export/pi/" + quoteId,
  fileUrl: (name: string) => "/api/trade-workbench/files/" + encodeURIComponent(name),
};

/** 获客子系统：与 call() 同一端点，只是 op 带 "模块/动作"。 */
export const leads = {
  search: (args: { product: string; market?: string; layers?: number; perLayer?: number; engine?: string }) =>
    leadsCall<any>("leads/search", args),
  runs: (limit = 20) => leadsCall<any[]>("leads/runs", { limit }),
  run: (id: string) => leadsCall<any>("leads/run", { id }),
  enrich: (urls: string[], market = "") => leadsCall<any>("leads/enrich", { urls, market }),
  score: (lead: any) => leadsCall<any>("leads/score", { lead }),

  emailFind: (args: { domain: string; first?: string; last?: string }) =>
    leadsCall<any>("email/find", args),
  emailVerify: (email: string) => leadsCall<any>("email/verify", { email }),

  crmList: (q = "") => leadsCall<any>("crm/list", { q }),
  crmGet: (id: string) => leadsCall<any>("crm/get", { id }),
  crmUpdate: (id: string, patch: any, activityNote?: string) =>
    leadsCall<any>("crm/update", { id, ...patch, activityNote }),
  crmStats: () => leadsCall<any>("crm/stats"),
  crmDupes: () => leadsCall<any>("crm/dupes"),
  crmActivities: (id: string) => leadsCall<any[]>("crm/activities", { id }),
  crmMerge: (keep: string, drop: string[]) => leadsCall<any>("crm/merge", { keep, drop }),

  sopList: () => leadsCall<any[]>("sop/list"),
  sopCreate: (args: any) => leadsCall<any>("sop/create", args),
  sopNext: (id: string) => leadsCall<any>("sop/next", { id }),
  sopReview: (id: string) => leadsCall<any>("sop/review", { id }),
  sopApprove: (id: string, hash: string) => leadsCall<any>("sop/approve", { id, hash }),
  sopStatus: (id: string) => leadsCall<any>("sop/status", { id }),

  kbList: () => leadsCall<any[]>("kb/list"),
  kbSearch: (q: string) => leadsCall<any>("kb/search", { q }),
  kbUpsert: (entry: any) => leadsCall<any>("kb/upsert", entry),

  suppressList: () => leadsCall<any>("suppress/list"),
  suppressAdd: (value: string, reason = "") => leadsCall<any>("suppress/add", { value, reason }),
  suppressRemove: (value: string) => leadsCall<any>("suppress/remove", { value }),

  templatesList: () => leadsCall<any[]>("templates/list"),
  templatesSave: (tpl: any) => leadsCall<any>("templates/save", tpl),
  templatesDelete: (id: string) => leadsCall<any>("templates/delete", { id }),

  waQueue: () => leadsCall<any[]>("wa/queue"),
  waMessages: (limit = 100) => leadsCall<any[]>("wa/messages", { limit }),

  statsReport: (args: any = {}) => leadsCall<any>("stats/report", args),
  auditQuery: (args: any = {}) => leadsCall<any[]>("audit/query", args),
  cronStatus: () => leadsCall<any>("cron/status"),
  monitorList: () => leadsCall<any[]>("monitor/list"),
  warmupStatus: () => leadsCall<any>("warmup/status"),
  deliverability: (domain: string) => leadsCall<any>("deliverability/check", { domain }),
  dossier: (domain: string) => leadsCall<any>("dossier/company", { domain }),
  marketScan: (product: string, markets?: string[]) =>
    leadsCall<any>("market/scan", { product, markets }),

  configSummary: () => leadsCall<any>("config/summary"),
  configWrite: (patch: any) => leadsCall<any>("config/write", { patch }),
  configRaw: () => leadsCall<any>("config/raw"),

  // ---- SOP 阶段机 ----
  sopClose: (id: string) => leadsCall<any>("sop/close", { id }),
  sopRemoveDraft: (id: string, index?: number) => leadsCall<any>("sop/removeDraft", { id, index }),

  // ---- 跟进序列 ----
  seqStart: (leadId: string, template?: string, language?: string) =>
    leadsCall<any>("sequence/start", { leadId, template, language }),
  seqStatus: (leadId: string) => leadsCall<any>("sequence/status", { leadId }),
  seqStop: (leadId: string) => leadsCall<any>("sequence/stop", { leadId }),

  // ---- 邮件 ----
  emailCompose: (leadId: string, opts: any = {}) =>
    leadsCall<any>("email/compose", { leadId, ...opts }),
  emailSend: (args: { to: string; subject?: string; text?: string; html?: string; dryRun?: boolean }) =>
    leadsCall<any>("email/send", args),

  // ---- WhatsApp ----
  waSync: (limit = 50) => leadsCall<any>("wa/sync", { limit }),

  // ---- WhatsApp 广播 ----
  waBroadcastPreview: (text: string, opts: any = {}) =>
    leadsCall<any>("wa/broadcast/preview", { text, ...opts }),
  waBroadcastExecute: (text: string, targets: any[]) =>
    leadsCall<any>("wa/broadcast/execute", { text, targets }),

  // ---- 线索转客户 ----
  toCustomer: (id: string, opts: any = {}) => leadsCall<any>("crm/to-customer", { id, ...opts }),
};
