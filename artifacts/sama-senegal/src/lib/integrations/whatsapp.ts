import { supabase } from "@/lib/supabase";

export type WhatsappStatus = "queued" | "sent" | "delivered" | "failed";
export type WhatsappTemplateKey =
  | "booking_confirmed" | "booking_cancelled"
  | "reminder_departure" | "reminder_payment";

function renderTemplate(body: string, vars: Record<string, string>): string {
  let result = body;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

export async function queueWhatsappMessage(
  templateKey: WhatsappTemplateKey,
  phone: string,
  vars: Record<string, string>,
  bookingRef?: string,
  clientId?: string
): Promise<boolean> {
  try {
    const { data: template, error: tplError } = await supabase
      .from("whatsapp_templates")
      .select("body_fr")
      .eq("key", templateKey)
      .single();

    if (tplError || !template) return false;

    const renderedMessage = renderTemplate(template.body_fr, vars);

    const { error } = await supabase.from("whatsapp_queue").insert({
      template_key: templateKey,
      phone,
      rendered_message: renderedMessage,
      booking_ref: bookingRef || null,
      client_id: clientId || null,
      status: "queued" as WhatsappStatus,
      scheduled_at: new Date().toISOString(),
    });

    return !error;
  } catch {
    return false;
  }
}

// NOTE : aucun envoi reel n'est effectue ici. L'envoi reel se fera via une Edge Function
// Supabase qui consommera la table whatsapp_queue avec l'API WhatsApp Business reelle,
// une fois les acces obtenus. Pour l'instant, on prepare uniquement la file d'attente.

export async function getWhatsappHistory(bookingRef?: string): Promise<any[]> {
  try {
    let query = supabase.from("whatsapp_queue").select("*").order("created_at", { ascending: false });
    if (bookingRef) query = query.eq("booking_ref", bookingRef);
    const { data, error } = await query;
    if (!error && data) return data;
  } catch {}
  return [];
}

export async function markWhatsappSent(queueId: number): Promise<void> {
  try {
    await supabase.from("whatsapp_queue").update({
      status: "sent" as WhatsappStatus,
      sent_at: new Date().toISOString(),
    }).eq("id", queueId);
  } catch {}
}
