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
if (errors.length) { console.error("check FAILED:\n" + errors.join("\n")); process.exit(1); }
console.log("check ok");
