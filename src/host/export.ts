// PI/箱单导出：纯 HTML，供浏览器打印成 PDF
export function renderPi(quote: any, customer: any, settings: Record<string, string>): string {
  const esc = (s: any) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const rows = (quote.items ?? []).map((it: any, i: number) =>
    `<tr><td>${i + 1}</td><td>${esc(it.name)}</td><td>${esc(it.qty)}</td><td>${esc(it.price)}</td><td>${(it.qty * it.price).toFixed(2)}</td></tr>`).join("");
  const total = (quote.items ?? []).reduce((a: number, it: any) => a + it.qty * it.price, 0);
  return `<!doctype html><html><head><meta charset="utf-8"><title>PI ${esc(quote.no)}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;margin:40px;color:#1a1a1a}h1{font-size:22px}table{border-collapse:collapse;width:100%;margin-top:16px}th,td{border:1px solid #999;padding:6px 10px;font-size:13px}th{background:#f2f2f2}.meta td{border:none;padding:2px 0;font-size:13px}.right{text-align:right}.total{font-weight:bold}</style></head><body>
<h1>PROFORMA INVOICE</h1>
<table class="meta"><tr><td>Exporter: <b>${esc(settings.company ?? "")}</b><br>${esc(settings.company_address ?? "")}<br>Tel: ${esc(settings.company_tel ?? "")} E-mail: ${esc(settings.company_email ?? "")}</td>
<td class="right">PI No.: <b>${esc(quote.no)}</b><br>Date: ${esc(quote.created_at ?? "").slice(0, 10)}<br>Currency: ${esc(quote.currency)}<br>Validity: ${esc(quote.validity_days)} days</td></tr></table>
<table class="meta" style="margin-top:12px"><tr><td colspan="2"><b>Bill To:</b> ${esc(customer?.name ?? "")} (${esc(customer?.country ?? "")})<br>${esc(customer?.contact ?? "")} &lt;${esc(customer?.email ?? "")}&gt;</td></tr></table>
<table><thead><tr><th>No.</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>${rows}<tr><td colspan="4" class="right total">TOTAL</td><td class="right total">${esc(quote.currency)} ${total.toFixed(2)}</td></tr></tbody></table>
<p style="font-size:12px;margin-top:18px">${esc(quote.note ?? "")}<br>Terms: ${esc(settings.incoterms ?? "FOB")}. Bank: ${esc(settings.bank_info ?? "")}</p>
<script>window.print && setTimeout(() => window.print(), 300)</script></body></html>`;
}
