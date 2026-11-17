import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const errors = [];
const need = ["package.json", "cordis.patch.yml", "icon.svg", "lib/index.js", "lib/client.js", "locale/zh.json", "locale/en.json"];
for (const f of need) if (!existsSync(join(root, f))) errors.push("缺少文件 " + f);

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.dsh?.client?.platform !== "web") errors.push("dsh.client.platform 必须是 web");
if (!pkg.exports?.["./client"]) errors.push("exports['./client'] 缺失");
if (pkg.dsh?.bundle?.patch !== "./cordis.patch.yml") errors.push("dsh.bundle.patch 未指向 cordis.patch.yml");

const client = readFileSync(join(root, "lib/client.js"), "utf8");
if (!client.startsWith("window.__ModuleLoader__.load(")) errors.push("client.js 外壳缺失");
if (/require\(["']@deepseek-ai/.test(client)) errors.push("client.js 非法 require 宿主包");
if (!/return module\.exports;/.test(client)) errors.push("client.js 工厂未返回 exports");

const host = readFileSync(join(root, "lib/index.js"), "utf8");
if (!/export \{[^}]*apply/.test(host) && !/export \{ apply/.test(host)) {
  if (!host.includes("export {") || !host.includes("apply")) errors.push("host index.js 未导出 apply");
}
for (const l of ["locale/zh.json", "locale/en.json"]) {
  const j = JSON.parse(readFileSync(join(root, l), "utf8"));
  if (!j.title || !j.description) errors.push(l + " 需要 title/description");
}
/* ── 客户端 CSS 完整性 ────────────────────────────────────
 * 校验产物中真正的 CSS，而不是源码字符串。
 *
 * 背景：曾因脚本替换失误导致 injectStyles 导出丢失、CSS 大括号少 2 个，
 * 界面直接裸奔成浏览器默认样式。这类问题 tsc 与单元测试都发现不了
 * （类型正确、逻辑正确，只是样式没生效），必须在产物层面断言。
 *
 * esbuild 会把模板字符串转成普通字符串，所以这里提取包含 .twb-root 的
 * 最长字符串字面量作为 CSS 载体，再用括号平衡与关键选择器兜底。
 */
function extractInjectedCss(source) {
  // 简单可靠：CSS 在产物里是一个反引号字符串。从 ".twb-root {" 往前找到
  // 起始反引号，再往后找下一个未转义反引号，中间就是完整 CSS。
  // 不用正则扫全文 —— 样式表几十 KB，回溯会直接卡死。
  const anchor = source.indexOf(".twb-root {");
  if (anchor === -1) return "";
  let begin = anchor;
  while (begin > 0 && source[begin - 1] !== "`") begin -= 1;
  if (begin === 0) return "";
  let end = begin;
  while (end < source.length) {
    end += 1;
    if (source[end] === "\\") { end += 1; continue; }
    if (source[end] === "`") break;
  }
  return source.slice(begin, end);
}

const css = extractInjectedCss(client);
if (!css) {
  errors.push("产物中找不到 CSS 内容（styles.ts 可能被破坏或未注入）");
} else {
  const open = (css.match(/{/g) || []).length;
  const close = (css.match(/}/g) || []).length;
  if (open !== close) errors.push(`CSS 大括号不平衡：${open} 个 { / ${close} 个 }`);
  if (css.length < 5000) errors.push(`CSS 体积异常偏小（${css.length} 字节），可能被截断`);
  if (css.includes("%SEL%")) errors.push("CSS 残留未替换的 %SEL% 占位符");
  let depth = 0;
  for (const line of css.split("\n")) {
    if (/^\s*--twb-[a-z0-9-]+:/.test(line) && depth === 0) {
      errors.push("CSS 变量声明在规则块外（会被浏览器丢弃）: " + line.trim().slice(0, 40));
      break;
    }
    depth += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
  }
  for (const sel of [".twb-root", ".twb-header", ".twb-card", ".twb-table"]) {
    if (!css.includes(sel)) errors.push("CSS 缺少基础选择器 " + sel);
  }
}
// 必须同时存在定义与调用：只查子串会被 "injectStylesBROKEN" 这类改名骗过
if (!/function injectStyles\(/.test(client) && !/const injectStyles\s*=/.test(client)) {
  errors.push("client.js 缺少 injectStyles 函数定义（样式不会注入）");
}
if (!/injectStyles\(/.test(client.replace(/function injectStyles\(/g, ""))) {
  errors.push("client.js 从未调用 injectStyles（样式不会注入）");
}

if (errors.length) { console.error("check FAILED:\n" + errors.join("\n")); process.exit(1); }
console.log("check ok");
