import { supabase } from "@/lib/supabase";

export interface PricingRule {
  id: string;
  entity_type: "transport" | "hebergement" | "activite" | "destination";
  entity_id: string;
  unit: "per_group" | "per_person" | "per_night" | "per_room" | "per_vehicle" | "fixed";
  min_people: number;
  max_people: number | null;
  price: number;
}

// Charge toutes les règles de tarification en une requête (évite le N+1)
export async function fetchPricingRules(entityType: PricingRule["entity_type"]): Promise<PricingRule[]> {
  try {
    const { data, error } = await supabase.from("pricing_rules").select("*").eq("entity_type", entityType);
    if (error || !data) return [];
    return data as PricingRule[];
  } catch {
    return [];
  }
}

// Sélectionne le palier de prix adapté au nombre de voyageurs
export function resolveTier(rules: PricingRule[], entityId: string, travelers: number): PricingRule | null {
  const candidates = rules.filter((r) => r.entity_id === String(entityId));
  if (candidates.length === 0) return null;
  const match = candidates.find(
    (r) => travelers >= r.min_people && (r.max_people == null || travelers <= r.max_people)
  );
  return match || candidates[candidates.length - 1];
}

// Calcule le prix effectif selon l'unité (par groupe, par personne, par nuit...)
export function computePrice(rule: PricingRule | null, travelers: number, nights = 1, fallback = 0): number {
  if (!rule) return fallback;
  switch (rule.unit) {
    case "per_person":
      return rule.price * travelers;
    case "per_night":
      return rule.price * nights;
    case "per_group":
    case "per_room":
    case "per_vehicle":
    case "fixed":
    default:
      return rule.price;
  }
}
