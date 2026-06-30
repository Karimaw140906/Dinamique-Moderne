import { supabase } from "@/lib/supabase";

export type EmailTemplateKey = "booking_confirmation" | "payment_receipt" | "booking_cancelled";
export type EmailStatus = "queued" | "sent" | "failed" | "bounced";

function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

export async function queueEmail(
  templateKey: EmailTemplateKey,
  recipientEmail: string,
  vars: Record<string, string>,
  bookingRef?: string
): Promise<boolean> {
  try {
    const { data: template, error: tplError } = await supabase
      .from("email_templates")
      .select("subject_fr, body_html_fr")
      .eq("key", templateKey)
      .single();

    if (tplError || !template) return false;

    const renderedSubject = renderTemplate(template.subject_fr, vars);
    const renderedBody = renderTemplate(template.body_html_fr, vars);

    const { error } = await supabase.from("email_queue").insert({
      template_key: templateKey,
      recipient_email: recipientEmail,
      rendered_subject: renderedSubject,
      rendered_body: renderedBody,
      booking_ref: bookingRef || null,
      status: "queued" as EmailStatus,
    });

    return !error;
  } catch {
    return false;
  }
}

// NOTE : aucun envoi reel n'est effectue ici. L'envoi se fera via une Edge Function
// Supabase consommant email_queue avec un fournisseur SMTP/API (ex: Resend, SendGrid)
// une fois les cles disponibles.

export async function getEmailHistory(bookingRef?: string): Promise<any[]> {
  try {
    let query = supabase.from("email_queue").select("*").order("created_at", { ascending: false });
    if (bookingRef) query = query.eq("booking_ref", bookingRef);
    const { data, error } = await query;
    if (!error && data) return data;
  } catch {}
  return [];
}
