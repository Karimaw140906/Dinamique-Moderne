import { supabase } from "@/lib/supabase";

export type NotificationRecipientType = "client" | "prestataire" | "admin";
export type NotificationChannel = "in_app" | "email" | "whatsapp" | "push";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface NotificationInput {
  recipientType: NotificationRecipientType;
  recipientId: string;
  title: string;
  body: string;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
}

export async function sendNotification(input: NotificationInput): Promise<boolean> {
  try {
    const { error } = await supabase.from("notifications").insert({
      recipient_type: input.recipientType,
      recipient_id: input.recipientId,
      title: input.title,
      body: input.body,
      channel: input.channel || "in_app",
      priority: input.priority || "normal",
      is_read: false,
      is_archived: false,
      created_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function getNotifications(recipientType: NotificationRecipientType, recipientId: string, includeArchived = false): Promise<any[]> {
  try {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("recipient_type", recipientType)
      .eq("recipient_id", recipientId)
      .order("created_at", { ascending: false });
    if (!includeArchived) query = query.eq("is_archived", false);
    const { data, error } = await query;
    if (!error && data) return data;
  } catch {}
  return [];
}

export async function markAsRead(notificationId: number): Promise<void> {
  try {
    await supabase.from("notifications").update({
      is_read: true,
      read_at: new Date().toISOString(),
    }).eq("id", notificationId);
  } catch {}
}

export async function archiveNotification(notificationId: number): Promise<void> {
  try {
    await supabase.from("notifications").update({ is_archived: true }).eq("id", notificationId);
  } catch {}
}

export async function getUnreadCount(recipientType: NotificationRecipientType, recipientId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_type", recipientType)
      .eq("recipient_id", recipientId)
      .eq("is_read", false);
    if (!error && count !== null) return count;
  } catch {}
  return 0;
}
