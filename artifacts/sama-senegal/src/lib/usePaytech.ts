import { supabase } from "@/lib/supabase";

const API_KEY = import.meta.env.VITE_PAYTECH_API_KEY;
const SECRET_KEY = import.meta.env.VITE_PAYTECH_SECRET_KEY;
const ENV = import.meta.env.VITE_PAYTECH_ENV || "test";
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

export interface PaytechPaymentParams {
  bookingRef: string;
  amount: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  itemName: string;
}

export async function createPaytechPayment(params: PaytechPaymentParams): Promise<{ url: string; token: string } | null> {
  try {
    const body = new URLSearchParams({
      item_name: params.itemName,
      item_price: params.amount.toString(),
      currency: "XOF",
      ref_command: params.bookingRef,
      command_name: "Reservation Sama Senegal " + params.itemName,
      env: ENV,
      ipn_url: SITE_URL + "/api/paytech-webhook",
      success_url: SITE_URL + "/paiement-succes?ref=" + params.bookingRef,
      cancel_url: SITE_URL + "/paiement-annule?ref=" + params.bookingRef,
      custom_field: JSON.stringify({
        booking_ref: params.bookingRef,
        client_name: params.clientName,
        client_email: params.clientEmail,
      }),
    });

    const response = await fetch("https://paytech.sn/api/payment/request-payment", {
      method: "POST",
      headers: {
        "API_KEY": API_KEY,
        "API_SECRET": SECRET_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (data.success === 1 && data.redirect_url) {
      await supabase.from("payments").upsert({
        booking_ref: params.bookingRef,
        amount: params.amount,
        method: "paytech",
        status: "pending",
        token: data.token,
        created_at: new Date().toISOString(),
      }, { onConflict: "booking_ref" });

      return { url: data.redirect_url, token: data.token };
    }

    console.error("PayTech error:", data);
    return null;
  } catch (e) {
    console.error("PayTech fetch error:", e);
    return null;
  }
}

export async function checkPaytechStatus(token: string): Promise<"pending" | "completed" | "cancelled" | "error"> {
  try {
    const response = await fetch("https://paytech.sn/api/payment/check-payment-status/" + token, {
      headers: {
        "API_KEY": API_KEY,
        "API_SECRET": SECRET_KEY,
      },
    });
    const data = await response.json();
    if (data.success === 1) return "completed";
    if (data.success === 0 && data.error === "cancelled") return "cancelled";
    return "pending";
  } catch {
    return "error";
  }
}
