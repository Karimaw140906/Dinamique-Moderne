import { supabase } from "@/lib/supabase";

export type PaymentStatus =
  | "pending" | "processing" | "completed" | "failed"
  | "cancelled" | "refunded" | "expired";

export type PaymentProvider = "paytech" | "orange_money" | "wave" | "card" | "stripe";
export type PaymentType = "full" | "deposit" | "partial";

export interface PaymentRequest {
  bookingRef: string;
  amount: number;
  provider: PaymentProvider;
  paymentType?: PaymentType;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  itemName: string;
}

export interface PaymentRecord {
  id: number;
  booking_ref: string;
  amount: number;
  provider: string;
  status: PaymentStatus;
  payment_type: string;
  created_at: string;
  paid_at?: string;
}

// Interface commune : chaque fournisseur branche sa propre implementation reelle ici plus tard.
// Pour l'instant aucun appel reseau reel n'est fait hors PayTech (deja existant et fonctionnel).
const PROVIDER_HANDLERS: Record<PaymentProvider, (req: PaymentRequest) => Promise<{ url: string; token: string } | null>> = {
  paytech: async (req) => {
    const { createPaytechPayment } = await import("@/lib/usePaytech");
    return createPaytechPayment({
      bookingRef: req.bookingRef,
      amount: req.amount,
      clientName: req.clientName,
      clientEmail: req.clientEmail || "",
      clientPhone: req.clientPhone,
      itemName: req.itemName,
    });
  },
  orange_money: async () => {
    // TODO: brancher l'API Orange Money quand les cles seront disponibles
    console.warn("[Paiements] Orange Money pas encore branche - cles API requises");
    return null;
  },
  wave: async () => {
    // TODO: brancher l'API Wave quand les cles seront disponibles
    console.warn("[Paiements] Wave pas encore branche - cles API requises");
    return null;
  },
  card: async () => {
    // TODO: brancher le fournisseur carte bancaire (PayTech le supporte aussi en mode test)
    console.warn("[Paiements] Carte bancaire pas encore branchee");
    return null;
  },
  stripe: async () => {
    // TODO: brancher Stripe quand les cles seront disponibles
    console.warn("[Paiements] Stripe pas encore branche - cles API requises");
    return null;
  },
};

export async function initiatePayment(req: PaymentRequest): Promise<{ url: string; token: string } | null> {
  try {
    await supabase.from("payments").insert({
      booking_ref: req.bookingRef,
      amount: req.amount,
      method: req.provider,
      provider: req.provider,
      payment_type: req.paymentType || "full",
      client_id: req.clientId || null,
      status: "pending" as PaymentStatus,
      phone: req.clientPhone,
      created_at: new Date().toISOString(),
    });
  } catch {}

  const handler = PROVIDER_HANDLERS[req.provider];
  return handler(req);
}

export async function getPaymentHistory(bookingRef?: string, clientId?: string): Promise<PaymentRecord[]> {
  try {
    let query = supabase.from("payments").select("*").order("created_at", { ascending: false });
    if (bookingRef) query = query.eq("booking_ref", bookingRef);
    if (clientId) query = query.eq("client_id", clientId);
    const { data, error } = await query;
    if (!error && data) return data;
  } catch {}
  return [];
}

export async function requestRefund(paymentId: number, amount: number, reason: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("payments").update({
      status: "refunded" as PaymentStatus,
      refund_amount: amount,
      refund_reason: reason,
      refunded_at: new Date().toISOString(),
    }).eq("id", paymentId);
    return !error;
  } catch { return false; }
}

export async function openDispute(paymentId: number, reason: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("payments").update({
      dispute_status: "open",
      dispute_reason: reason,
    }).eq("id", paymentId);
    return !error;
  } catch { return false; }
}

export async function recordPartialPayment(bookingRef: string, totalAmount: number, paidAmount: number, provider: PaymentProvider, clientPhone: string): Promise<void> {
  const paymentType: PaymentType = paidAmount < totalAmount ? "deposit" : "full";
  try {
    await supabase.from("payments").insert({
      booking_ref: bookingRef,
      amount: paidAmount,
      method: provider,
      provider,
      payment_type: paymentType,
      status: "completed" as PaymentStatus,
      phone: clientPhone,
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
  } catch {}
}
