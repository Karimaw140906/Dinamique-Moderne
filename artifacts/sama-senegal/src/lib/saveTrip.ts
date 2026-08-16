import { supabase } from "@/lib/supabase";
import { SimulatorState } from "@/lib/simulator";

const SESSION_TOKEN_KEY = "sama_simulator_session_token";

export function getOrCreateSessionToken(): string {
  try {
    let token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return "anon-session";
  }
}

export async function saveItinerary(
  state: SimulatorState,
  opts: { clientId?: string | null; status?: "draft" | "saved" | "requested" } = {}
): Promise<{ ok: boolean; itineraryId?: string }> {
  const sessionToken = getOrCreateSessionToken();

  try {
    const { data: existing } = await supabase
      .from("itineraries")
      .select("id")
      .eq("session_token", sessionToken)
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const payload = {
      client_id: opts.clientId || null,
      session_token: sessionToken,
      adults: state.adults,
      children: state.children,
      has_own_vehicle: state.hasOwnVehicle,
      start_date: state.startDate,
      status: opts.status || "draft",
      updated_at: new Date().toISOString(),
    };

    let itineraryId: string;
    if (existing?.id) {
      await supabase.from("itineraries").update(payload).eq("id", existing.id);
      itineraryId = existing.id;
      await supabase.from("itinerary_destinations").delete().eq("itinerary_id", itineraryId);
    } else {
      const { data: inserted, error } = await supabase.from("itineraries").insert(payload).select().single();
      if (error || !inserted) return { ok: false };
      itineraryId = inserted.id;
    }

    for (let i = 0; i < state.destinations.length; i++) {
      const d = state.destinations[i];
      await supabase.from("itinerary_destinations").insert({
        itinerary_id: itineraryId,
        destination_id: d.destinationId,
        position: i,
        nights: d.nights,
      });
    }

    return { ok: true, itineraryId };
  } catch {
    return { ok: false };
  }
}
