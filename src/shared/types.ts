// 共享类型：Host/Client 两侧的领域模型与阶段状态机
export const STAGES = ["inquiry", "quote", "pi", "production", "booking", "customs", "shipped", "receipt", "closed"] as const;
export type Stage = (typeof STAGES)[number];

export const INQUIRY_STATUS = ["new", "following", "quoted", "invalid"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUS)[number];

export interface Customer {
  id: number; name: string; country: string; source: string;
  contact: string; email: string; whatsapp: string; tags: string;
  note: string; created_at: string;
}
export interface Followup { id: number; customer_id: number; at: string; channel: string; content: string; next_at: string }
export interface Inquiry {
  id: number; customer_id: number | null; product: string; qty: number;
  channel: string; content: string; status: InquiryStatus;
  received_at: string; created_at: string;
}
export interface QuoteItem { name: string; qty: number; price: number; cost: number }
export interface Quote {
  id: number; no: string; customer_id: number; inquiry_id: number | null;
  currency: string; fx_rate: number; items: QuoteItem[];
  validity_days: number; status: string; note: string; created_at: string;
}
export interface OrderNode { stage: Stage; done: boolean; at: string }
export interface Order {
  id: number; no: string; quote_id: number | null; customer_id: number;
  amount_cents: number; currency: string; sign_date: string; delivery_date: string;
  stage: Stage; progress: OrderNode[]; note: string; created_at: string;
}
export interface Shipment {
  id: number; order_id: number; booking_no: string; vessel: string;
  etd: string; ata: string; container: string; bl_no: string; customs_status: string; note: string;
}
export interface Receipt {
  id: number; order_id: number; type: string; amount_cents: number;
  currency: string; date: string; bank_ref: string; note: string;
}
export interface DocRow {
  id: number; order_id: number; kind: string; file: string; note: string; created_at: string;
}
export interface Dashboard {
  inquiriesThisMonth: number; inquiryToOrderRate: number;
  openOrderCents: number; unpaidCents: number; overdueCount: number;
  revenueByStage: { stage: Stage; cents: number }[];
  marginByMonth: { month: string; revenueCents: number; costCents: number }[];
  totalCustomers: number; totalOrders: number;
}
export interface QuoteTotal {
  totalCents: number; costCents: number; marginCents: number; marginRate: number;
}
export function quoteTotal(q: Pick<Quote, "items">): QuoteTotal {
  let total = 0, cost = 0;
  for (const it of q.items) { total += it.qty * it.price * 100; cost += it.qty * it.cost * 100; }
  total = Math.round(total); cost = Math.round(cost);
  const margin = total - cost;
  return { totalCents: total, costCents: cost, marginCents: margin, marginRate: total ? margin / total : 0 };
}
export function receiptBalance(orderAmountCents: number, receipts: Receipt[]): number {
  let paid = 0;
  for (const r of receipts) if (r.type !== "费用") paid += r.amount_cents;
  return orderAmountCents - paid;
}
