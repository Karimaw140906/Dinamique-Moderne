import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const DEFAULT_RESTAURANTS = [];

export const DEFAULT_HOTELS = [];

export const DEFAULT_ACTIVITIES = [];

export const DEFAULT_TRANSPORT = [];

export const DEFAULT_MENU = [];

export const DEFAULT_DESTINATIONS = [];

export const DEFAULT_EVENTS = [];

function normalize(item: any): any {
  return {
    ...item,
    name_fr: item.name_fr || item.nameFR || item.name || "",
    name_en: item.name_en || item.nameEN || item.name || "",
    name_es: item.name_es || item.nameES || item.name || "",
    desc_fr: item.desc_fr || item.descFR || "",
    desc_en: item.desc_en || item.descEN || "",
    desc_es: item.desc_es || item.descES || "",
    driver_included: item.driver_included ?? item.driverIncluded ?? true,
    driverIncluded:  item.driver_included ?? item.driverIncluded ?? true,
    price_night:  item.price_night  ?? item.priceNight  ?? 0,
    priceNight:   item.price_night  ?? item.priceNight  ?? 0,
    price_range:  item.price_range  ?? item.priceRange  ?? "€€",
    priceRange:   item.price_range  ?? item.priceRange  ?? "€€",
    booking_link: item.booking_link ?? item.bookingLink ?? "",
    bookingLink:  item.booking_link ?? item.bookingLink ?? "",
    prep_time:    item.prep_time    ?? item.prepTime    ?? 0,
    prepTime:     item.prep_time    ?? item.prepTime    ?? 0,
    spice_level:  item.spice_level  ?? item.spiceLevel  ?? "Doux",
    spiceLevel:   item.spice_level  ?? item.spiceLevel  ?? "Doux",
    min_participants: item.min_participants ?? item.minParticipants ?? 1,
    minParticipants:  item.min_participants ?? item.minParticipants ?? 1,
  };
}

const LS_MAP: Record<string, { key: string; event: string }> = {
  hotels:      { key: "hotelsData",      event: "hotelsDataUpdated" },
  restaurants: { key: "restaurantsData", event: "restaurantsDataUpdated" },
  transport:   { key: "transportData",   event: "transportDataUpdated" },
  activities:  { key: "activitiesData",  event: "activitiesDataUpdated" },
  menu:        { key: "menuData",        event: "menuDataUpdated" },
  tours:       { key: "toursData",       event: "toursDataUpdated" },
  guides:      { key: "guidesData",      event: "guidesDataUpdated" },
  destinations:{ key: "destinationsData",event: "destinationsDataUpdated" },
  events:      { key: "eventsData",      event: "eventsDataUpdated" },
};

function readLocalStorage<T>(
  table: string,
  defaults: T[],
  filter?: { column: string; value: any }
): T[] | null {
  const entry = LS_MAP[table];
  if (!entry) return null;
  try {
    const raw = localStorage.getItem(entry.key);
    if (!raw) return null;
    const parsed: T[] = JSON.parse(raw);
    if (!parsed || parsed.length === 0) return null;
    const normalized = parsed.map(normalize) as T[];
    if (filter) {
      const filtered = normalized.filter((r: any) => r[filter.column] === filter.value);
      return filtered.length > 0 ? filtered : null;
    }
    return normalized;
  } catch {
    return null;
  }
}

function writeLocalStorage(table: string, rows: any[]) {
  const entry = LS_MAP[table];
  if (!entry) return;
  try { localStorage.setItem(entry.key, JSON.stringify(rows)); } catch {}
}

/**
 * Hook de données PUBLIQUES : lit désormais Supabase en priorité (source de vérité),
 * garde localStorage comme cache d'affichage instantané et fallback hors-ligne,
 * et s'abonne au realtime Supabase pour refléter les changements admin sans rechargement.
 */
export function useSupabaseData<T>(
  table: string,
  defaults: T[],
  filter?: { column: string; value: any }
) {
  const getInitial = (): T[] => readLocalStorage(table, defaults, filter) ?? defaults;

  const [data, setData] = useState<T[]>(getInitial);
  const [loading, setLoading] = useState(true);

  const fetchFromSupabase = async () => {
    try {
      let query = supabase.from(table).select("*");
      if (filter) query = query.eq(filter.column, filter.value);
      const { data: rows, error } = await query;
      if (!error && rows) {
        const normalized = rows.map(normalize) as T[];
        setData(normalized);
        writeLocalStorage(table, rows);
      }
      // si erreur ou table vide -> on garde ce qui est déjà affiché (cache/défauts)
    } catch {
      // réseau KO -> on garde le fallback déjà en state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFromSupabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  // Realtime Supabase : tout changement admin (insert/update/delete) est reflété
  // pour TOUS les visiteurs, pas seulement dans l'onglet où l'admin a agi.
  useEffect(() => {
    const channel = supabase
      .channel(`public-data-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => { fetchFromSupabase(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  // Compat rétro : reflète aussi les events localStorage émis par les Admin*.tsx
  // (utile pour un retour visuel immédiat dans le même onglet, avant confirmation du realtime)
  useEffect(() => {
    const entry = LS_MAP[table];
    if (!entry) return;
    const handler = () => {
      const fromLS = readLocalStorage(table, defaults, filter);
      if (fromLS) setData(fromLS);
    };
    window.addEventListener(entry.event, handler);
    return () => window.removeEventListener(entry.event, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  return { data, loading };
}
