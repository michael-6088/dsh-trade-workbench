/**
 * 知识库：条目列表 + 附件管理。
 *
 * 左栏是条目（含检索），右栏是详情与附件。
 * 上传支持三种落点（对应后端 uploadFile 的三种模式）：
 *   拖到右栏某个条目 → 挂到该条目，正文追加进去
 *   拖到左栏顶部上传区 → 自动建条目（source=file）
 *   勾「只存档」后再拖 → 只存文件不建条目，稍后归类
 *
 * 附件状态直接暴露给用户：已抽取 / 无文字 / 需 OCR / 失败（含原因），
 * 因为「文件传上去了但检索不到」是最容易让人困惑的情况。
 */
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toasts, PageHead, Section, Empty, Table, TextInput, TextArea, Select, Badge, Field, KeyValue, TableSkeleton, Segmented } from "../ui.tsx";
import { api, leadsCall } from "../api.ts";

const TYPES: [string, string][] = [
  ["product", "产品资料"], ["policy", "报价政策"], ["case", "案例"],
  ["market", "市场规则"], ["brand", "品牌"], ["other", "其他"],
];
const typeLabel = (k?: string) => (TYPES.find(([v]) => v === k) ?? [, k ?? "其他"])[1];

const STATUS_BADGE: Record<string, { tone: any; label: string }> = {
  done: { tone: "ok", label: "已抽取" },
  empty: { tone: "warn", label: "无文字" },
  failed: { tone: "err", label: "解析失败" },
  image: { tone: "info", label: "需 OCR" },
  pending: { tone: undefined, label: "待处理" },
};

function humanSize(n: number): string {
  if (!n) return "0 B";
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / 1024 / 1024).toFixed(1) + " MB";
}

const kb = {
  list: (type?: string) => leadsCall<any[]>("kb/list", { type, limit: 200 }),
  get: (id: string) => leadsCall<any>("kb/get", { id }),
  search: (q: string) => leadsCall<any>("kb/search", { q }),
  upsert: (e: any) => leadsCall<any>("kb/upsert", e),
  remove: (id: string) => leadsCall<any>("kb/remove", { id }),
  files: (entryId?: string | null) => leadsCall<any[]>("kb/files", { entryId, limit: 200 }),
  fileStats: () => leadsCall<any>("kb/file/stats", {}),
  fileDelete: (id: string) => leadsCall<any>("kb/file/delete", { id }),
  fileReparse: (id: string) => leadsCall<any>("kb/file/reparse", { id }),
  fileAttach: (id: string, entryId: string | null) => leadsCall<any>("kb/file/attach", { id, entryId }),
  async upload(file: File, opts: { entryId?: string; fileOnly?: boolean; type?: string } = {}) {
    const form = new FormData();
    form.append("file", file, file.name);
    if (opts.entryId) form.append("entryId", opts.entryId);
    if (opts.fileOnly) form.append("fileOnly", "1");
    if (opts.type) form.append("type", opts.type);
    const res = await fetch("/api/trade-workbench/kb-upload", {
      method: "POST", body: form, credentials: "same-origin",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error?.message ?? "HTTP " + res.status);
    return data;
  },
};

export function Knowledge() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<any[] | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileOnly, setFileOnly] = useState(false);
  const fileInput = useRef<any>(null);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([kb.list(), kb.fileStats()])
      .then(([list, st]) => { setEntries(Array.isArray(list) ? list : []); setStats(st); })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const loadFiles = useCallback((entryId: string | null) => {
    kb.files(entryId).then((r) => setFiles(Array.isArray(r) ? r : [])).catch(() => setFiles([]));
  }, []);

  const openEntry = async (id: string) => {
    try {
      const e = await kb.get(id);
      setSelected(e);
      setEditing(e);
      loadFiles(id);
    } catch (err: any) { toasts.push("加载失败：" + err.message); }
  };

  const doSearch = async () => {
    if (!q.trim()) { setHits(null); return; }
    try {
      const r = await kb.search(q.trim());
      setHits(Array.isArray(r) ? r : []);
    } catch (e: any) { toasts.push("检索失败：" + e.message); }
  };

  const save = async () => {
    if (!editing?.title?.trim()) { toasts.push("标题必填"); return; }
    setBusy(true);
    try {
      const saved = await kb.upsert(editing);
      toasts.push("已保存", "ok");
      setEditing(saved);
      setSelected(saved);
      reload();
    } catch (e: any) { toasts.push("保存失败：" + e.message); }
    finally { setBusy(false); }
  };

  const handleFiles = async (list: FileList | null, targetEntryId?: string) => {
    if (!list || list.length === 0) return;
    setBusy(true);
    let ok = 0;
    let failed = 0;
    for (const f of Array.from(list)) {
      try {
        const r = await kb.upload(f, {
          entryId: targetEntryId,
          fileOnly: fileOnly && !targetEntryId,
          type: editing?.type && editing?.id ? undefined : "product",
        });
        ok += 1;
        if (r?.file?.extractStatus === 'empty' && r?.file?.extractError) {
          toasts.push(`${f.name}：${r.file.extractError}`);
        }
      } catch (e: any) {
        failed += 1;
        toasts.push(`${f.name} 上传失败：${e.message}`);
      }
    }
    setBusy(false);
    if (ok) toasts.push(`已上传 ${ok} 个文件${failed ? `，${failed} 个失败` : ""}`, "ok");
    reload();
    if (selected?.id) {
      loadFiles(selected.id);
      // 挂到条目后正文被追加，重新拉一次
      kb.get(selected.id).then((e2) => { setSelected(e2); setEditing(e2); }).catch(() => {});
    }
  };

  const reparse = async (id: string) => {
    setBusy(true);
    try {
      const r = await kb.fileReparse(id);
      toasts.push(r?.file?.extractStatus === 'done' ? "解析成功" : `解析结果：${r?.file?.extractError || r?.file?.extractStatus}`, "ok");
      if (selected?.id) { loadFiles(selected.id); kb.get(selected.id).then((e2) => { setSelected(e2); setEditing(e2); }); }
      reload();
    } catch (e: any) { toasts.push("重新解析失败：" + e.message); }
    finally { setBusy(false); }
  };

  const delFile = async (id: string) => {
    try {
      await kb.fileDelete(id);
      toasts.push("已删除", "ok");
      if (selected?.id) loadFiles(selected.id);
      reload();
    } catch (e: any) { toasts.push("删除失败：" + e.message); }
  };

  const shown = hits ?? entries;

  /* ── 附件区 ── */
  const fileRows = (list: any[]) => list.map((f) => {
    const badge = STATUS_BADGE[f.extractStatus] ?? STATUS_BADGE.pending;
    return React.createElement("div", {
      key: f.id,
      style: {
        display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
        borderBottom: "1px solid var(--twb-hairline)", fontSize: 12,
      },
    },
      React.createElement("span", { style: { flex: "0 0 auto", opacity: .6, fontSize: 14 } },
        f.mime?.startsWith("image/") ? "🖼" : f.mime === "application/pdf" ? "📄" : "📎"),
      React.createElement("a", {
        href: api.kbFileUrl(f.id), target: "_blank", rel: "noreferrer",
        style: { flex: "1 1 auto", color: "var(--twb-fg)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
      }, f.name),
      React.createElement("span", { className: "twb-dim", style: { flex: "0 0 auto" } }, humanSize(f.size)),
      React.createElement(Badge, {
        tone: badge.tone,
        title: f.extractError || undefined,
      }, f.ocrUsed ? badge.label + "·OCR" : badge.label),
      f.extractStatus !== 'done' ? React.createElement("button", {
        className: "twb-btn ghost sm", title: "重新解析", disabled: busy, onClick: () => reparse(f.id),
      }, "重解析") : null,
      React.createElement("button", {
        className: "twb-btn ghost sm", title: "删除", onClick: () => delFile(f.id),
      }, "删除"),
      f.extractError ? React.createElement("span", {
        className: "twb-dim", title: f.extractError,
        style: { flex: "1 1 100%", marginTop: 2, color: "var(--twb-warn)" },
      }, f.extractError.slice(0, 80)) : null);
  });

  const uploadZone = (target?: string) => React.createElement("div", {
    onDragOver: (e: any) => { e.preventDefault(); setDragOver(true); },
    onDragLeave: () => setDragOver(false),
    onDrop: (e: any) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer?.files, target); },
    onClick: () => { fileInput.current = fileInput.current || null; fileInput.current?.click?.(); },
    className: "twb-drop" + (dragOver ? " over" : ""),
  },
    React.createElement("div", { className: "t" }, "拖文件到这里，或点击选择"),
    React.createElement("div", { className: "d" },
      "支持 PDF / Word / Excel / 图片 / 文本；图片自动 OCR，PDF 需有文本层"));

  /* ── 右栏详情 ── */
  const renderDetail = () => {
    if (!editing) {
      return React.createElement("div", null,
        React.createElement(Empty, {
          title: "从左侧选一个条目",
          desc: "或直接把文件拖到左侧上传区，系统会自动抽取正文并建条目。",
        }),
        stats && stats.unattached > 0
          ? React.createElement("div", { style: { marginTop: 16 } },
              React.createElement(Section, { title: `未归类文件 (${stats.unattached})` },
                React.createElement("div", { className: "twb-panel" },
                  fileRows(files.filter((f) => !f.entryId)))))
          : null);
    }

    const dropProps = {
      onDragOver: (e: any) => { e.preventDefault(); setDragOver(true); },
      onDragLeave: () => setDragOver(false),
      onDrop: (e: any) => {
        e.preventDefault();
        setDragOver(false);
        if (editing.id) handleFiles(e.dataTransfer?.files, editing.id);
        else toasts.push("先保存条目，再拖文件挂载");
      },
      className: "twb-panel twb-panel-pad" + (dragOver ? " over" : ""),
    };

    const editor = React.createElement("div", dropProps,
      React.createElement("div", { className: "twb-grid2" },
        React.createElement(Field, { label: "标题" },
          React.createElement(TextInput, {
            value: editing.title ?? "",
            onChange: (e: any) => setEditing({ ...editing, title: e.target.value }),
          })),
        React.createElement(Field, { label: "类型" },
          React.createElement(Select, {
            value: editing.type ?? "product",
            onChange: (e: any) => setEditing({ ...editing, type: e.target.value }),
          }, TYPES.map(([v, l]) => React.createElement("option", { key: v, value: v }, l))))),
      React.createElement(Field, { label: "正文", hint: "AI 检索的就是这里；上传文件的抽取结果也会追加进来" },
        React.createElement(TextArea, {
          rows: 14, value: editing.content ?? "",
          style: { minHeight: 280, fontFamily: "inherit" },
          onChange: (e: any) => setEditing({ ...editing, content: e.target.value }),
        })),
      React.createElement("div", { className: "twb-toolbar", style: { marginBottom: 0 } },
        React.createElement("button", { className: "twb-btn", onClick: save, disabled: busy },
          busy ? "保存中…" : "保存"),
        editing.id ? React.createElement("button", {
          className: "twb-btn secondary",
          onClick: async () => {
            try {
              await kb.remove(editing.id);
              toasts.push("已删除条目（附件保留为未归类）", "ok");
              setEditing(null); setSelected(null); setFiles([]); reload();
            } catch (e: any) { toasts.push("删除失败：" + e.message); }
          },
        }, "删除条目") : null,
        editing.id ? React.createElement("span", { className: "twb-dim" }, `ID ${editing.id}`) : null));

    const attachments = editing.id
      ? React.createElement(Section, { title: `附件 (${files.length})` },
          React.createElement("div", { className: "twb-panel" },
            files.length === 0
              ? React.createElement("div", { className: "twb-muted", style: { padding: 14 } },
                  "还没有附件。把文件拖到上方编辑区即可挂载。")
              : fileRows(files)))
      : null;

    return React.createElement(React.Fragment, null, editor, attachments);
  };

  /* ── 左栏列表 ── */
  const renderList = () => {
    if (loading) return React.createElement(TableSkeleton, { rows: 6, cols: 2 });
    if (shown.length === 0) {
      return React.createElement("div", { className: "twb-muted", style: { padding: 16 } },
        hits ? "没有匹配的条目" : "知识库还是空的，先上传文件或手写一条。");
    }
    return React.createElement("div", { className: "twb-panel" },
      shown.map((r: any) => React.createElement("div", {
        key: r.id,
        onClick: () => openEntry(r.id),
        className: "twb-row" + (selected?.id === r.id ? " on" : ""),
      },
        React.createElement("div", { className: "twb-grow" },
          React.createElement("div", { className: "t" }, r.title ?? "-"),
          React.createElement("div", { className: "m" },
            `${typeLabel(r.type)} · v${r.version ?? 1}`)))));
  };

  const leftPane = React.createElement("div", null,
    React.createElement("div", { className: "twb-toolbar", style: { marginBottom: 10 } },
      React.createElement(TextInput, {
        placeholder: "检索…", value: q,
        onChange: (e: any) => setQ(e.target.value),
        onKeyDown: (e: any) => { if (e.key === "Enter") doSearch(); },
        style: { minWidth: 0, flex: "1 1 auto" },
      }),
      React.createElement("button", { className: "twb-btn secondary sm", onClick: doSearch }, "搜索")),

    hits ? React.createElement("div", { className: "twb-toolbar", style: { marginBottom: 8 } },
      React.createElement(Badge, { plain: true }, `命中 ${hits.length}`),
      React.createElement("button", { className: "twb-btn ghost sm", onClick: () => { setHits(null); setQ(""); } }, "清除")) : null,

    React.createElement("div", { style: { marginBottom: 12 } },
      uploadZone(undefined),
      React.createElement("input", {
        ref: fileInput, type: "file", multiple: true, style: { display: "none" },
        onChange: (e: any) => { handleFiles(e.target.files); e.target.value = ""; },
      }),
      React.createElement("label", {
        className: "twb-dim",
        style: { display: "flex", gap: 6, alignItems: "center", marginTop: 8, cursor: "pointer" },
      },
        React.createElement("input", {
          type: "checkbox", checked: fileOnly,
          onChange: (e: any) => setFileOnly(e.target.checked),
        }),
        "只存档，不自动建条目")),

    React.createElement("div", { className: "twb-toolbar", style: { marginBottom: 8 } },
      React.createElement("button", {
        className: "twb-btn sm",
        onClick: () => {
          setEditing({ type: "product", title: "", content: "", tags: [] });
          setSelected(null); setFiles([]);
        },
      }, "+ 手写条目"),
      React.createElement("span", { className: "spacer" }),
      stats ? React.createElement("span", { className: "twb-dim" },
        `${stats.total} 文件 · ${humanSize(stats.bytes)}`) : null),

    renderList());

  const statsPane = stats ? React.createElement(Section, { title: "存储概览" },
    React.createElement(KeyValue, {
      rows: [
        ["文件总数", String(stats.total)],
        ["占用空间", humanSize(stats.bytes)],
        ["已抽取", String(stats.byStatus?.done ?? 0)],
        ["无文字 / 需 OCR", String((stats.byStatus?.empty ?? 0) + (stats.byStatus?.image ?? 0))],
        ["解析失败", String(stats.byStatus?.failed ?? 0)],
        ["未归类", String(stats.unattached)],
      ],
    })) : null;

  return React.createElement("div", null,
    React.createElement(PageHead, {
      title: "知识库",
      sub: "产品 · 政策 · 案例 · 市场规则 —— AI 回信时的事实依据",
    }),
    React.createElement("div", { className: "twb-split" },
      leftPane, React.createElement("div", null, renderDetail(), statsPane)));
}
