// 获客子系统的 RPC 分派器。
//
// 上游 dsh-waimao 用 ctx.webServer 前缀路由承载网页与 API（绕过认证）。
// 并入工作台后统一收敛到 Connection 的 /api/trade-workbench/rpc 单端点，
// 优点：载体无关（Web 与 Electron 同一份 handler）、自带认证围栏、
// 只对 owner Peer 开放。
//
// 路由粒度：op 用 "模块/动作" 两段式（leads/search、crm/update），
// 便于前端按模块聚拢，也方便后续加白名单与权限。
import { readConfig, writeConfig, configSummary } from './config.js';
import * as crmMod from './crm.js';
import * as kbMod from './kb.js';
import * as leadsMod from './leads.js';
import * as auditMod from './audit.js';
import * as cronMod from './cron.js';
import * as sopMod from './sop.js';
import * as statsMod from './stats.js';
import * as storeMod from './store.js';
import * as monitorMod from './monitor.js';
import * as templatesMod from './templates.js';
import * as suppressMod from './suppress.js';
import * as trackMod from './track.js';
import * as warmupMod from './warmup.js';
import { runLeadSearch } from './leads.js';
import { findEmail, verifyEmail } from './enrich/emailfind.js';
import { companyDossier } from './enrich/dossier.js';
import { harvestSiteContacts } from './harvest.js';
import { scanMarkets } from './market.js';
import { deliverabilityCheck } from './deliverability.js';
import { scoreLead } from './score.js';
import { calcPrice } from './pricing.js';
import { videoScript } from './content.js';
import * as seqMod from './mail/sequence.js';
import * as composeMod from './mail/compose.js';
import * as smtpMod from './mail/smtp.js';
import * as evoMod from './evolution.js';

/** 参数校验：缺必填字段时抛 400。 */
function need(args, ...keys) {
  for (const key of keys) {
    const value = args?.[key];
    if (value === undefined || value === null || value === '') {
      const error = new Error(`missing required argument: ${key}`);
      error.status = 400;
      throw error;
    }
  }
}

/** 把工具实现统一包装成 RPC 处理器：args 就是请求 body 里的 args。 */

/**
 * 线索 → 客户档案。
 *
 * 线索池（leads 表）与客户（customers 表）本是两套数据：线索有评分和来源，
 * 客户挂报价与订单。这里把已评估的线索落成正式客户档案，并回写 lead_id
 * 建立关联，避免两边各存一份联系人。落库动作由 Host 主入口通过 deps
 * 注入（leads/ 拿不到主库的 repo 层，也不该反向依赖）。
 */
function buildCustomerPayload(lead, options) {
  const emails = lead.contacts?.emails ?? [];
  const whatsapps = lead.contacts?.whatsapps ?? [];
  return {
    name: options?.name || lead.company || lead.domain || lead.id,
    country: options?.country ?? '',
    source: lead.market ? `线索池·${lead.market}` : '线索池',
    contact: options?.contact ?? '',
    email: emails[0] ?? '',
    whatsapp: whatsapps[0] ?? '',
    tags: [lead.tier, lead.fit].filter(Boolean).join(','),
    note: [lead.advice, lead.title].filter(Boolean).join('\n'),
    lead_id: lead.id,
    domain: lead.domain ?? '',
    lead_status: lead.status ?? '',
    score: Number(lead.score ?? 0),
    tier: lead.tier ?? '',
  };
}

export function createLeadsRpc(deps = {}) {
  const handlers = {
    // ---- 获客检索 ----
    'leads/search': async (args) => {
      need(args, 'product');
      return runLeadSearch({
        product: String(args.product),
        market: args.market ?? '',
        layers: args.layers,
        perLayer: args.perLayer,
        engine: args.engine,
        signal: args.signal,
        source: args.source,
      });
    },
    'leads/runs': async (args) => leadsMod.loadRuns(Number(args?.limit ?? 20)),
    'leads/run': async (args) => {
      need(args, 'id');
      return leadsMod.findRun(String(args.id));
    },
    'leads/enrich': async (args) => {
      need(args, 'urls');
      const urls = Array.isArray(args.urls) ? args.urls : [args.urls];
      return harvestSiteContacts({ urls, market: args.market ?? '' });
    },
    'leads/score': async (args) => {
      need(args, 'lead');
      return scoreLead(args.lead);
    },

    // ---- 邮箱 ----
    'email/find': async (args) => {
      need(args, 'domain');
      return findEmail({
        domain: String(args.domain),
        first: args.first ?? '',
        last: args.last ?? '',
        known: args.known ?? [],
      });
    },
    'email/verify': async (args) => {
      need(args, 'email');
      return verifyEmail(String(args.email), args);
    },

    // ---- CRM ----
    'crm/list': async (args) => crmMod.listLeads(args ?? {}),
    'crm/get': async (args) => {
      need(args, 'id');
      return crmMod.getLead(String(args.id));
    },
    'crm/update': async (args) => {
      need(args, 'id');
      const { id, actor, activityNote, ...patch } = args;
      return crmMod.updateLead(String(id), patch, { actor: actor ?? 'web', activityNote });
    },
    'crm/stats': async () => crmMod.crmStats(),
    'crm/dupes': async () => crmMod.findDuplicateGroups(),
    'crm/activities': async (args) => {
      need(args, 'id');
      const lead = crmMod.getLead(String(args.id));
      return lead?.activities ?? [];
    },
    'crm/merge': async (args) => {
      need(args, 'keep', 'drop');
      return crmMod.mergeLeads(String(args.keep), Array.isArray(args.drop) ? args.drop : [args.drop], { actor: args.actor ?? 'web' });
    },
    'crm/import': async (args) => {
      need(args, 'rows');
      return crmMod.importLeads(args.rows, { actor: args.actor ?? 'web' });
    },

    // ---- SOP 阶段机 ----
    'sop/create': async (args) => sopMod.createTask(args ?? {}),
    'sop/next': async (args) => {
      need(args, 'id');
      return sopMod.nextStep(String(args.id), { actor: args.actor ?? 'web' });
    },
    'sop/review': async (args) => {
      need(args, 'id');
      return sopMod.reviewDraft(String(args.id));
    },
    'sop/approve': async (args) => {
      need(args, 'id');
      return sopMod.assertApproved(String(args.id), args.hash, { actor: args.actor ?? 'web' });
    },
    'sop/status': async (args) => {
      need(args, 'id');
      return sopMod.getTaskFull(String(args.id));
    },
    'sop/list': async () => sopMod.listTasks(),
    'sop/close': async (args) => {
      need(args, 'id');
      return sopMod.closeTask(String(args.id), args ?? {});
    },
    'sop/removeDraft': async (args) => {
      need(args, 'id');
      return sopMod.removeDraft(String(args.id), args?.index);
    },

    // ---- 跟进序列 ----
    'sequence/start': async (args) => {
      need(args, 'leadId');
      const cfg = readConfig();
      return seqMod.newSequence(String(args.leadId), {
        template: args.template,
        language: args.language ?? 'en',
        dryRun: cfg.smtp?.dryRun !== false,
      });
    },
    'sequence/status': async (args) => {
      need(args, 'leadId');
      return seqMod.sequenceSummary(String(args.leadId));
    },
    'sequence/stop': async (args) => {
      need(args, 'leadId');
      return seqMod.stopSequence(String(args.leadId));
    },

    // ---- 邮件撰写与发送 ----
    'email/compose': async (args) => {
      need(args, 'leadId');
      return composeMod.composeEmail({
        leadId: String(args.leadId),
        contactName: args.contactName,
        language: args.language,
        useAi: args.useAi !== false,
        kind: args.kind ?? 'first',
      });
    },
    'email/send': async (args) => {
      need(args, 'to');
      const cfg = readConfig();
      // 网页端发送属人工通道：dryRun 由配置总闸决定；
      // 首触审批门只约束智能体自主发起，网页手动发送放行。
      return smtpMod.sendMail({
        to: args.to,
        subject: args.subject ?? '',
        text: args.text ?? '',
        html: args.html,
        from: args.from ?? cfg.smtp?.from,
        dryRun: args.dryRun ?? (cfg.smtp?.dryRun !== false),
      });
    },

    // ---- WhatsApp 同步 ----
    'wa/sync': async (args) => {
      const cfg = readConfig();
      const limit = Number(args?.limit ?? 50);
      // findMessages 按实例拉取最近消息并归一化后入审核队列
      const messages = await evoMod.findMessages(cfg.evolution ?? {}, { limit });
      const stored = storeMod.upsertIncoming(
        (Array.isArray(messages) ? messages : []).map((m) => ({
          id: m.id,
          from: m.from,
          text: m.text,
          ts: m.ts,
          chatId: m.chatId,
        })),
      );
      return { fetched: Array.isArray(messages) ? messages.length : 0, ...stored };
    },

    // ---- WhatsApp 广播 ----
    // 两段式：先 preview 返回将发给谁、受什么限额约束；用户确认后再 execute。
    // 上游 wa_broadcast 是一步到底的，网页端必须拆开，否则误点就群发。
    'wa/broadcast/preview': async (args) => {
      need(args, 'text');
      const cfg = readConfig();
      const leadsList = crmMod.listLeads(args.filters ?? {});
      const arr = Array.isArray(leadsList) ? leadsList : (leadsList?.leads ?? []);
      const targets = [];
      for (const lead of arr) {
        const nums = lead.contacts?.whatsapps ?? [];
        if (!nums.length) continue;
        if (args.status && lead.status !== args.status) continue;
        for (const number of nums) {
          targets.push({ number, company: lead.company ?? '', leadId: lead.id });
        }
      }
      const capped = Number(args.limit ?? 50);
      const state = evoMod.broadcastBudget?.() ?? null;
      return {
        text: String(args.text),
        targets: targets.slice(0, capped),
        total: targets.length,
        skippedNoNumber: arr.length - targets.length,
        cap: cfg.wa?.dailyBroadcastCap ?? 200,
        sentToday: state?.sentToday ?? 0,
        minDelaySec: cfg.wa?.minDelaySec ?? 20,
        maxDelaySec: cfg.wa?.maxDelaySec ?? 90,
        dryRun: true,
      };
    },
    'wa/broadcast/execute': async (args) => {
      need(args, 'text', 'targets');
      const list = Array.isArray(args.targets) ? args.targets : [];
      if (list.length === 0) {
        const error = new Error('no targets');
        error.status = 400;
        throw error;
      }
      // 硬闸：一次最多 100 条，避免手滑把全库发出去
      if (list.length > 100) {
        const error = new Error('单次广播上限 100 条，请分批');
        error.status = 400;
        throw error;
      }
      const cfg = readConfig();
      if (cfg.evolution?.apiKey === '' || !cfg.evolution?.apiKey) {
        const error = new Error('Evolution 未配置，无法发送 WhatsApp');
        error.status = 400;
        throw error;
      }
      const result = await evoMod.broadcast(list.map((t) => ({
        number: t.number,
        text: String(args.text),
      })));
      auditMod.audit('wa.broadcast', { count: list.length }, args?.actor ?? 'web');
      return result;
    },

    // ---- 线索转客户 ----
    'crm/to-customer': async (args) => {
      need(args, 'id');
      const lead = crmMod.getLead(String(args.id));
      if (!lead) {
        const error = new Error('lead not found: ' + args.id);
        error.status = 404;
        throw error;
      }
      const payload = buildCustomerPayload(lead, args);
      if (typeof deps.createCustomer === 'function') {
        const row = await deps.createCustomer(payload);
        auditMod.audit('crm.toCustomer', { lead_id: lead.id, customer_id: row?.id }, args?.actor ?? 'web');
        return { customer: row, leadId: lead.id };
      }
      return { customer: payload, leadId: lead.id, dryRun: true };
    },

    // ---- 知识库 ----
    'kb/search': async (args) => {
      need(args, 'q');
      return kbMod.search(String(args.q));
    },
    'kb/upsert': async (args) => kbMod.upsert(args ?? {}, { actor: args?.actor ?? 'web' }),
    'kb/list': async () => kbMod.list(),

    // ---- 抑制列表 / 模板 ----
    'suppress/list': async () => suppressMod.loadSuppress(),
    'suppress/stats': async () => suppressMod.suppressStats(),
    'suppress/add': async (args) => {
      need(args, 'value');
      return suppressMod.suppress(String(args.value), args?.reason ?? '', { actor: args?.actor ?? 'web' });
    },
    'suppress/remove': async (args) => {
      need(args, 'value');
      return suppressMod.unsuppress(String(args.value), { actor: args?.actor ?? 'web' });
    },
    'templates/list': async () => templatesMod.listTemplates(),
    'templates/save': async (args) => templatesMod.saveTemplate(args ?? {}, args?.actor ?? 'web'),
    'templates/delete': async (args) => {
      need(args, 'id');
      return templatesMod.removeTemplate(String(args.id), args?.actor ?? 'web');
    },

    // ---- WhatsApp 审核台 ----
    'wa/messages': async (args) => storeMod.loadMessages().slice(0, Number(args?.limit ?? 100)),
    'wa/queue': async () => storeMod.pendingQueue(),
    'wa/stats': async () => storeMod.stats(),

    // ---- 运维与报表 ----
    'stats/report': async (args) => statsMod.report(args ?? {}),
    'audit/query': async (args) => auditMod.queryAudit(args ?? {}),
    'cron/status': async () => cronMod.status(),
    'monitor/list': async () => monitorMod.listWatched(),
    'warmup/status': async () => warmupMod.warmupStatus(),
    'deliverability/check': async (args) => {
      need(args, 'domain');
      return deliverabilityCheck(String(args.domain));
    },
    'dossier/company': async (args) => {
      need(args, 'domain');
      return companyDossier(String(args.domain));
    },
    'market/scan': async (args) => {
      need(args, 'product');
      return scanMarkets({ product: String(args.product), markets: args.markets });
    },
    'pricing/calc': async (args) => calcPrice(args ?? {}),
    'content/video-script': async (args) => videoScript(args ?? {}),
    'track/summary': async () => trackMod.trackStats(),

    // ---- 配置 ----
    'config/summary': async () => configSummary(),
    'config/read': async () => configSummary(),
    'config/write': async (args) => {
      need(args, 'patch');
      const saved = writeConfig(args.patch);
      auditMod.audit('config.write', { keys: Object.keys(args.patch ?? {}) }, args?.actor ?? 'web');
      return { saved: true, config: configSummary(), _raw: saved ? undefined : undefined };
    },
    'config/raw': async () => readConfig(),
  };

  return {
    has: (op) => Object.prototype.hasOwnProperty.call(handlers, op),
    run: (op, args) => handlers[op](args),
    ops: Object.keys(handlers),
  };
}
