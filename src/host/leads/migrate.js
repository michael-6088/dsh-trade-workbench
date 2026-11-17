// 旧 dsh-waimao 数据导入。
//
// 上游把状态散在 ~/.waimao/data/ 下：
//   crm.json      线索档案（{leads:[...]}）
//   leads.jsonl   每次搜索的 run 记录（一行一条）
//   audit.jsonl   审计日志
//   config.json   SERP/SMTP/IMAP/Evolution 等配置
// 并入工作台后线索进 SQLite，run 记录进 lead_runs 表，配置合并进新目录的
// config.json，审计追加进新目录的 audit.jsonl。
//
// 安全前提：整个过程只读旧目录，写入一律落在新目录；不再需要旧目录时
// 由用户自己删，插件不主动清理（数据无价，宁可占空间）。
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR, CONFIG_PATH, DEFAULT_CONFIG, LEGACY_WAIMAO_DIR, readConfig, writeConfig } from './config.js';
import { getLeadsDb } from './db.js';

/** 迁移在库上留的标记，避免重复导入。 */
const MARKER = 'legacy_waimao_imported';

function readJsonSafe(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    return null;
  }
}

function readJsonlSafe(path) {
  const out = [];
  let raw = '';
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    return out;
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    try {
      out.push(JSON.parse(trimmed));
    } catch {
      // 跳过损坏行
    }
  }
  return out;
}

/** 旧目录是否可导入：存在且至少有一个已知文件。 */
export function detectLegacyWaimao() {
  const dir = LEGACY_WAIMAO_DIR;
  if (!existsSync(dir)) return { present: false, dir, files: [] };
  const dataDir = join(dir, 'data');
  const files = [];
  for (const candidate of [
    join(dir, 'config.json'),
    join(dataDir, 'crm.json'),
    join(dataDir, 'leads.jsonl'),
    join(dataDir, 'audit.jsonl'),
    join(dataDir, 'kb.json'),
    join(dataDir, 'templates.json'),
    join(dataDir, 'messages.json'),
  ]) {
    try {
      if (statSync(candidate).isFile()) files.push(candidate);
    } catch {
      // 不存在就跳过
    }
  }
  return { present: files.length > 0, dir, files };
}

/** 备份旧目录到 <旧目录>.backup-<时间戳>，返回备份路径（失败返回 null）。 */
export function backupLegacy() {
  const dir = LEGACY_WAIMAO_DIR;
  if (!existsSync(dir)) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = `${dir}.backup-${stamp}`;
  try {
    mkdirSync(target, { recursive: true });
    const walk = (from, to) => {
      for (const name of readdirSync(from)) {
        const src = join(from, name);
        const dst = join(to, name);
        const st = statSync(src);
        if (st.isDirectory()) {
          mkdirSync(dst, { recursive: true });
          walk(src, dst);
        } else if (st.isFile()) {
          copyFileSync(src, dst);
        }
      }
    };
    walk(dir, target);
    return target;
  } catch (error) {
    return null;
  }
}

/**
 * 执行导入。返回 { imported, skipped, backup, errors }。
 * 幂等：同一条线索按 dedup_key 合并，run 按 id 覆盖，可安全重跑。
 */
export function migrateLegacyWaimao() {
  const detect = detectLegacyWaimao();
  if (!detect.present) {
    return { imported: 0, skipped: true, reason: 'legacy not found', backup: null, errors: [] };
  }
  const backup = backupLegacy();
  const errors = [];
  let imported = 0;

  mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });

  // 1) 配置合并：旧配置里「用户实际填过的值」应当保留。
  //    注意 readConfig() 会把 DEFAULT_CONFIG 深合并进来，因此不能简单地
  //    用新值的非空与否来判断 —— DEFAULT_CONFIG 的 serp.engine 恒为 'ddg'，
  //    直接覆盖会让用户原本配的 serpapi 丢失。这里逐层判断：
  //    新目录等于默认值而旧目录不是默认值时，以旧目录为准。
  const legacyConfig = readJsonSafe(join(LEGACY_WAIMAO_DIR, 'config.json'));
  if (legacyConfig && typeof legacyConfig === 'object') {
    try {
      const current = readConfig();
      const defaults = DEFAULT_CONFIG;
      const mergePreferLegacy = (base, legacy, def) => {
        const out = { ...base };
        for (const [key, legacyValue] of Object.entries(legacy ?? {})) {
          const baseValue = base?.[key];
          const defValue = def?.[key];
          const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
          if (isObj(legacyValue) && isObj(baseValue)) {
            out[key] = mergePreferLegacy(baseValue, legacyValue, isObj(defValue) ? defValue : {});
            continue;
          }
          // base 未设置或仍是默认值 → 用旧值（旧值才是用户真的填过的）
          const baseIsDefault = JSON.stringify(baseValue) === JSON.stringify(defValue);
          const baseEmpty = baseValue === undefined || baseValue === '' || baseValue === null;
          if (baseEmpty || baseIsDefault) {
            out[key] = legacyValue;
          }
        }
        return out;
      };
      writeConfig(mergePreferLegacy(current, legacyConfig, defaults));
      imported += 1;
    } catch (e) {
      errors.push('config: ' + String(e?.message ?? e));
    }
  }

  // 2) CRM 线索：旧格式直接入 SQLite leads 表
  const legacyCrm = readJsonSafe(join(LEGACY_WAIMAO_DIR, 'data', 'crm.json'));
  const legacyLeads = Array.isArray(legacyCrm?.leads) ? legacyCrm.leads : [];
  if (legacyLeads.length > 0) {
    try {
      const db = getLeadsDb();
      const upsert = db.prepare(`
INSERT INTO leads (id, dedup_key, company, domain, status, score, tier, fit, created_at, updated_at, payload)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
`);
      db.exec('BEGIN');
      try {
        for (const lead of legacyLeads) {
          upsert.run(
            lead.id ?? cryptoId(),
            lead.dedupKey ?? null,
            lead.company ?? '',
            lead.domain ?? '',
            lead.status ?? 'new',
            Number(lead.score ?? 0),
            lead.tier ?? '',
            lead.fit ?? null,
            lead.createdAt ?? new Date().toISOString(),
            lead.updatedAt ?? new Date().toISOString(),
            JSON.stringify(lead),
          );
          imported += 1;
        }
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    } catch (e) {
      errors.push('crm: ' + String(e?.message ?? e));
    }
  }

  // 3) 搜索 run 记录
  const runs = readJsonlSafe(join(LEGACY_WAIMAO_DIR, 'data', 'leads.jsonl'));
  if (runs.length > 0) {
    try {
      const db = getLeadsDb();
      const upsert = db.prepare(`
INSERT INTO lead_runs (id, product, market, engine, total, created_at, payload)
VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET payload = excluded.payload
`);
      for (const run of runs) {
        const id = run.id ?? cryptoId();
        upsert.run(
          id,
          run.product ?? '',
          run.market ?? '',
          run.engine ?? '',
          Number(run.results?.length ?? run.leads?.length ?? 0),
          run.ts ?? run.createdAt ?? new Date().toISOString(),
          JSON.stringify(run),
        );
        imported += 1;
      }
    } catch (e) {
      errors.push('runs: ' + String(e?.message ?? e));
    }
  }

  // 4) 审计日志：追加进新目录，保留原时间戳
  const legacyAudit = join(LEGACY_WAIMAO_DIR, 'data', 'audit.jsonl');
  if (existsSync(legacyAudit)) {
    try {
      const target = join(DATA_DIR, 'audit.jsonl');
      const exists = existsSync(target);
      const content = readFileSync(legacyAudit, 'utf8');
      writeFileSync(target, (exists ? '\n' : '') + content, { flag: 'a', mode: 0o600 });
      imported += 1;
    } catch (e) {
      errors.push('audit: ' + String(e?.message ?? e));
    }
  }

  // 5) 知识库 / 模板 / 消息队列：直接拷文件（结构未变）
  for (const name of ['kb.json', 'templates.json', 'messages.json', 'suppress.json', 'monitor.json']) {
    const src = join(LEGACY_WAIMAO_DIR, 'data', name);
    if (!existsSync(src)) continue;
    try {
      const dst = join(DATA_DIR, name);
      if (!existsSync(dst)) {
        copyFileSync(src, dst);
        imported += 1;
      }
    } catch (e) {
      errors.push(`${name}: ${String(e?.message ?? e)}`);
    }
  }

  return {
    imported,
    skipped: false,
    backup,
    legacyDir: LEGACY_WAIMAO_DIR,
    errors,
    marker: MARKER,
  };
}

function cryptoId() {
  return 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
