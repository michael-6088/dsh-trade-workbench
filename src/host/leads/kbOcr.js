// 图片 OCR（tesseract.js，纯 WASM，离线可用）。
//
// 为什么用 tesseract 而不是视觉大模型：本机 76 个 provider / 504 个模型
// 全部 vision=null，没有任何模型能看图。tesseract 不依赖模型能力，
// 也不会因为换 provider 而失效。
//
// 代价是体积（core 44MB + 中文包 21MB），且首次识别要加载 WASM（约 1s）。
// worker 会被复用 —— 每次新建 worker 要 3~5s，批量导入时不可接受。
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { cleanOcrText } from './kbParse.js';

const require = createRequire(import.meta.url);

let workerPromise = null;
let workerLangs = '';
let lastUsed = 0;

/** worker 空闲超过 5 分钟自动释放，避免长期占内存（WASM 堆约 50MB）。 */
const IDLE_MS = 5 * 60 * 1000;

/** 定位语言包与 core：优先包内 node_modules，其次环境变量覆盖。 */
function resolvePaths() {
  const env = process.env.DSH_TWB_TESSDATA;
  if (env && existsSync(env)) {
    return { langPath: env, cachePath: join(env, '..', '.tess-cache') };
  }
  try {
    // @tesseract.js-data/chi_sim 的 4.0.0 目录里是 chi_sim.traineddata.gz
    const pkg = require.resolve('@tesseract.js-data/chi_sim/package.json');
    const base = dirname(pkg);
    const v4 = join(base, '4.0.0');
    const langPath = existsSync(join(v4, 'chi_sim.traineddata.gz')) ? v4 : base;
    return { langPath, cachePath: join(base, '.cache') };
  } catch {
    return { langPath: null, cachePath: null };
  }
}

/** OCR 是否可用：依赖装没装、语言包在不在。 */
export function ocrAvailable() {
  try {
    require.resolve('tesseract.js');
  } catch {
    return { ok: false, reason: '未安装 tesseract.js' };
  }
  const { langPath } = resolvePaths();
  if (!langPath) {
    return { ok: false, reason: '未找到中文语言包（@tesseract.js-data/chi_sim）' };
  }
  return { ok: true, langPath };
}

async function getWorker() {
  const now = Date.now();
  if (workerPromise && (now - lastUsed) < IDLE_MS) {
    lastUsed = now;
    return workerPromise;
  }
  if (workerPromise) {
    // 空闲超时：释放旧 worker 再建新的
    try {
      const old = await workerPromise;
      await old.terminate();
    } catch { /* 忽略 */ }
    workerPromise = null;
  }

  const avail = ocrAvailable();
  if (!avail.ok) {
    const e = new Error(`OCR 不可用：${avail.reason}`);
    e.code = 'OCR_UNAVAILABLE';
    throw e;
  }

  workerPromise = (async () => {
    const { createWorker } = await import('tesseract.js');
    const { langPath, cachePath } = resolvePaths();
    // 只用 chi_sim：@tesseract.js-data 只带 chi_sim.traineddata 一个文件，
    // 写成 'chi_sim+eng' 会让 worker 去找不存在的 eng.traineddata.gz 而整体失败。
    // 中文包自带拉丁字符集，中英混排照样能识别。
    const w = await createWorker('chi_sim', 1, {
      langPath,
      cachePath,
      gzip: true,
      logger: () => {},
    });
    workerLangs = 'chi_sim';
    return w;
  })();

  lastUsed = now;
  return workerPromise;
}

/**
 * 识别一张图片。
 * @returns {{ text: string, confidence: number, ms: number }}
 */
export async function ocrImage(buffer, { signal } = {}) {
  if (signal?.aborted) {
    const e = new Error('已取消');
    e.code = 'ABORTED';
    throw e;
  }
  const t0 = Date.now();
  const w = await getWorker();
  const { data } = await w.recognize(Buffer.from(buffer));
  const text = cleanOcrText(data.text ?? '');
  lastUsed = Date.now();
  return {
    text,
    confidence: typeof data.confidence === 'number' ? Math.round(data.confidence) : 0,
    ms: Date.now() - t0,
  };
}

/** 进程退出或插件卸载时调用，释放 WASM 堆。 */
export async function terminateOcr() {
  if (!workerPromise) return;
  try {
    const w = await workerPromise;
    await w.terminate();
  } catch { /* 忽略 */ }
  workerPromise = null;
}
