export type AvailabilityStatus = "available" | "limited" | "unavailable";

// Statut de disponibilité basé sur la capacité déclarée vs nombre de voyageurs.
// Si aucune capacité n'est configurée sur l'item, on considère "disponible" par défaut
// (ne bloque jamais un item juste parce que le champ n'a pas été rempli côté admin).
export function getAvailabilityStatus(capacity: number | null | undefined, travelers: number): AvailabilityStatus {
  if (capacity == null || capacity <= 0) return "available";
  if (travelers > capacity) return "unavailable";
  if (capacity - travelers <= 2) return "limited";
  return "available";
}

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: "Disponible",
  limited: "Places limitées",
  unavailable: "Indisponible",
};

export const AVAILABILITY_COLORS: Record<AvailabilityStatus, string> = {
  available: "bg-green-100 text-green-700",
  limited: "bg-orange-100 text-orange-700",
  unavailable: "bg-red-100 text-red-700",
};

export const AVAILABILITY_DOTS: Record<AvailabilityStatus, string> = {
  available: "🟢",
  limited: "🟠",
  unavailable: "🔴",
};
