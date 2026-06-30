import { supabase } from "@/lib/supabase";

export type CalendarOwnerType = "guide" | "chauffeur" | "hotel" | "restaurant" | "activity" | "vehicle";
export type SyncStatus = "pending" | "synced" | "conflict" | "error";

export interface CalendarEventInput {
  ownerType: CalendarOwnerType;
  ownerId: string;
  bookingRef?: string;
  title: string;
  startTime: string; // ISO
  endTime: string;   // ISO
}

// NOTE : aucune connexion Google reelle n'est faite ici. Les fonctions ci-dessous
// preparent uniquement la structure locale (Supabase) pour la sync future.
// Quand les acces Google OAuth seront disponibles, brancher createGoogleEvent() reel.

export async function getOrCreateConnection(ownerType: CalendarOwnerType, ownerId: string): Promise<number | null> {
  try {
    const { data: existing } = await supabase
      .from("calendar_connections")
      .select("id")
      .eq("owner_type", ownerType)
      .eq("owner_id", ownerId)
      .single();

    if (existing) return existing.id;

    const { data: created, error } = await supabase
      .from("calendar_connections")
      .insert({ owner_type: ownerType, owner_id: ownerId, sync_enabled: false })
      .select("id")
      .single();

    if (!error && created) return created.id;
  } catch {}
  return null;
}

export async function checkConflict(startTime: string, endTime: string, ownerType: CalendarOwnerType, ownerId: string): Promise<boolean> {
  try {
    const connectionId = await getOrCreateConnection(ownerType, ownerId);
    if (!connectionId) return false;

    const { data, error } = await supabase
      .from("calendar_events")
      .select("id")
      .eq("calendar_connection_id", connectionId)
      .lte("start_time", endTime)
      .gte("end_time", startTime);

    return !error && !!data && data.length > 0;
  } catch {
    return false;
  }
}

export async function createLocalEvent(input: CalendarEventInput): Promise<number | null> {
  try {
    const connectionId = await getOrCreateConnection(input.ownerType, input.ownerId);
    if (!connectionId) return null;

    const hasConflict = await checkConflict(input.startTime, input.endTime, input.ownerType, input.ownerId);

    const { data, error } = await supabase.from("calendar_events").insert({
      calendar_connection_id: connectionId,
      booking_ref: input.bookingRef || null,
      title: input.title,
      start_time: input.startTime,
      end_time: input.endTime,
      source: "site",
      sync_status: (hasConflict ? "conflict" : "pending") as SyncStatus,
    }).select("id").single();

    if (!error && data) return data.id;
  } catch {}
  return null;
}

export async function getEventsForOwner(ownerType: CalendarOwnerType, ownerId: string): Promise<any[]> {
  try {
    const connectionId = await getOrCreateConnection(ownerType, ownerId);
    if (!connectionId) return [];
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("calendar_connection_id", connectionId)
      .order("start_time", { ascending: true });
    if (!error && data) return data;
  } catch {}
  return [];
}
