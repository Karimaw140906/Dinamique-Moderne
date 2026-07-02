import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const DEFAULT_RESTAURANTS = [
  { id:1, name:"Le Petit Baobab", cuisine:"Sénégalaise", desc_fr:"Cuisine traditionnelle sénégalaise au cœur de Dakar", desc_en:"Traditional Senegalese cuisine in the heart of Dakar", desc_es:"Cocina tradicional senegalesa", photo:"", price_range:"€€", rating:5, address:"Plateau, Dakar", hours:"12h-23h", whatsapp:"+221774188107", active:true },
  { id:2, name:"Chez Lamine", cuisine:"Grillades", desc_fr:"Grillades et fruits de mer frais", desc_en:"Fresh grilled seafood", desc_es:"Mariscos y parrillas frescas", photo:"", price_range:"€€€", rating:5, address:"Île de Gorée", hours:"11h-22h", whatsapp:"+221774188107", active:true },
];

export const DEFAULT_HOTELS = [
  { id:1, name:"Hôtel Gorée Saly", type:"Hôtel", desc_fr:"Vue panoramique sur l'océan Atlantique", desc_en:"Panoramic view of the Atlantic Ocean", desc_es:"Vista panorámica del Océano Atlántico", photo:"", rating:5, rooms:24, price_night:85000, address:"Saly, Thiès", amenities:["WiFi","Piscine","Clim"], whatsapp:"+221774188107", booking_link:"", active:true },
  { id:2, name:"Villa Baobab", type:"Villa", desc_fr:"Villa de luxe au coeur de Dakar", desc_en:"Luxury villa in the heart of Dakar", desc_es:"Villa de lujo en el corazón de Dakar", photo:"", rating:5, rooms:8, price_night:120000, address:"Almadies, Dakar", amenities:["WiFi","Piscine","Clim","Parking"], whatsapp:"+221774188107", booking_link:"", active:true },
];

export const DEFAULT_ACTIVITIES = [
  { id:1, nameFR:"Balade en Pirogue", nameEN:"Pirogue Ride", nameES:"Paseo en Piragua", name_fr:"Balade en Pirogue", name_en:"Pirogue Ride", name_es:"Paseo en Piragua", category:"Sport nautique", descFR:"Exploration des côtes en pirogue traditionnelle", desc_fr:"Exploration des côtes en pirogue traditionnelle", desc_en:"Coastal exploration by traditional pirogue", desc_es:"Exploración costera en piragua tradicional", photo:"", duration:"2h", price:8000, minParticipants:2, min_participants:2, location:"Île de Gorée", active:true },
  { id:2, nameFR:"Cours de Cuisine Sénégalaise", nameEN:"Senegalese Cooking Class", nameES:"Clase de Cocina Senegalesa", name_fr:"Cours de Cuisine Sénégalaise", name_en:"Senegalese Cooking Class", name_es:"Clase de Cocina Senegalesa", category:"Culturel", descFR:"Apprenez à cuisiner le thiéboudienne", desc_fr:"Apprenez à cuisiner le thiéboudienne", desc_en:"Learn to cook thiéboudienne", desc_es:"Aprende a cocinar thiéboudienne", photo:"", duration:"3h", price:12000, minParticipants:1, min_participants:1, location:"Gorée", active:true },
  { id:3, nameFR:"Visite Île de Gorée", nameEN:"Gorée Island Tour", nameES:"Visita a Gorée", name_fr:"Visite Île de Gorée", name_en:"Gorée Island Tour", name_es:"Visita a Gorée", category:"Culturel", descFR:"Découverte de l'île historique de Gorée", desc_fr:"Découverte de l'île historique de Gorée", desc_en:"Discover the historic island of Gorée", desc_es:"Descubre la histórica isla de Gorée", photo:"", duration:"4h", price:15000, minParticipants:1, min_participants:1, location:"Île de Gorée", active:true },
];

export const DEFAULT_TRANSPORT = [
  { id:1, name:"Toyota HiAce", category:"Minibus", desc_fr:"Minibus climatisé 12 places", desc_en:"Air-conditioned 12-seat minibus", desc_es:"Minibús climatizado de 12 plazas", photo:"", seats:12, aircon:true, driver_included:true, driverIncluded:true, price_day:80000, price_half:45000, whatsapp:"+221774188107", active:true },
  { id:2, name:"4x4 Land Cruiser", category:"SUV", desc_fr:"Véhicule tout-terrain pour les aventures", desc_en:"Off-road vehicle for adventures", desc_es:"Vehículo todoterreno para aventuras", photo:"", seats:7, aircon:true, driver_included:true, driverIncluded:true, price_day:120000, price_half:65000, whatsapp:"+221774188107", active:true },
];

export const DEFAULT_MENU = [
  { id:1, nameFR:"Thiéboudienne", nameEN:"Rice & Fish", nameES:"Arroz con Pescado", name_fr:"Thiéboudienne", name_en:"Rice & Fish", name_es:"Arroz con Pescado", category:"Plat principal", descFR:"Le plat national sénégalais", desc_fr:"Le plat national sénégalais", desc_en:"The Senegalese national dish", desc_es:"El plato nacional senegalés", photo:"", price:3500, prepTime:30, prep_time:30, spiceLevel:"Moyen", spice_level:"Moyen", available:true },
  { id:2, nameFR:"Yassa Poulet", nameEN:"Chicken Yassa", nameES:"Pollo Yassa", name_fr:"Yassa Poulet", name_en:"Chicken Yassa", name_es:"Pollo Yassa", category:"Plat principal", descFR:"Poulet mariné au citron et oignons", desc_fr:"Poulet mariné au citron et oignons", desc_en:"Chicken marinated in lemon and onions", desc_es:"Pollo marinado en limón y cebollas", photo:"", price:3000, prepTime:25, prep_time:25, spiceLevel:"Moyen", spice_level:"Moyen", available:true },
  { id:3, nameFR:"Bissap", nameEN:"Bissap Juice", nameES:"Jugo de Bissap", name_fr:"Bissap", name_en:"Bissap Juice", name_es:"Jugo de Bissap", category:"Boisson", descFR:"Jus d'hibiscus frais", desc_fr:"Jus d'hibiscus frais", desc_en:"Fresh hibiscus juice", desc_es:"Jugo fresco de hibisco", photo:"", price:700, prepTime:2, prep_time:2, spiceLevel:"Doux", spice_level:"Doux", available:true },
];

export const DEFAULT_DESTINATIONS = [
  { id:1, name:"Île de Gorée", desc_fr:"Île historique classée UNESCO, mémoire de la traite négrière", desc_en:"UNESCO-listed historic island, memory of the slave trade", desc_es:"Isla histórica declarada Patrimonio de la UNESCO", region:"Dakar", photo:"", gallery:[], rating:5, highlights:["Maison des Esclaves","Vue sur Dakar","Plages"], active:true },
  { id:2, name:"Lac Rose", desc_fr:"Lac aux eaux roses, célèbre étape du rallye Paris-Dakar", desc_en:"Pink-watered lake, famous stage of the Paris-Dakar rally", desc_es:"Lago de aguas rosadas, famosa etapa del rally París-Dakar", region:"Dakar", photo:"", gallery:[], rating:5, highlights:["Récolte de sel","Baignade","Balade en 4x4"], active:true },
];

export const DEFAULT_EVENTS = [
  { id:1, name:"Festival de Jazz de Saint-Louis", desc_fr:"Festival international de jazz sur l'île de Saint-Louis", desc_en:"International jazz festival on Saint-Louis island", desc_es:"Festival internacional de jazz en la isla de Saint-Louis", location:"Saint-Louis", date_start:"", date_end:"", price:15000, photo:"", whatsapp:"+221774188107", active:true },
];

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
