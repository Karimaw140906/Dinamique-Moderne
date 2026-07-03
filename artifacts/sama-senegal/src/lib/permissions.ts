// Catalogue central des permissions — source unique de vérité.
export const PERMISSION_CATALOG = [
  { key: "voir_reservations",     label: "Voir réservations",        module: "reservations" },
  { key: "modifier_reservations", label: "Modifier réservations",    module: "reservations" },
  { key: "gerer_destinations",    label: "Gérer destinations",       module: "destinations" },
  { key: "gerer_hebergements",    label: "Gérer hébergements",       module: "hotels" },
  { key: "gerer_activites",       label: "Gérer activités",          module: "activites" },
  { key: "gerer_restaurants",     label: "Gérer restaurants",        module: "restaurants" },
  { key: "gerer_transport",       label: "Gérer transport",          module: "transport" },
  { key: "gerer_evenements",      label: "Gérer événements",         module: "events" },
  { key: "gerer_contenus",        label: "Gérer contenus & onglets", module: "tabs" },
  { key: "gerer_temoignages",     label: "Gérer témoignages",        module: "temoignages" },
  { key: "gerer_promos",          label: "Gérer offres & promos",    module: "promos" },
  { key: "gerer_commandes",       label: "Gérer commandes",          module: "menu" },
  { key: "voir_clients",          label: "Voir clients",             module: "clients" },
  { key: "gerer_calendrier",      label: "Gérer disponibilités",     module: "calendrier" },
  { key: "gerer_parametres",      label: "Gérer paramètres du site", module: "parametres" },
  { key: "voir_logs",             label: "Voir les logs d'activité", module: "logs" },
  { key: "gerer_acces",           label: "Gérer comptes & rôles",    module: "staff" },
  { key: "scanner_qr",            label: "Scanner QR code",          module: "reservations" },
] as const;

export type PermissionKey = typeof PERMISSION_CATALOG[number]["key"];

export type StaffRole =
  | "admin"
  | "responsable_destinations"
  | "responsable_hebergements"
  | "responsable_activites"
  | "responsable_restaurants"
  | "responsable_transport"
  | "responsable_evenements"
  | "responsable_contenus"
  | "agent";

export const ROLE_DEFS: { value: StaffRole; label: string; icon: string }[] = [
  { value: "admin",                     label: "Admin (opérationnel global)", icon: "🛠️" },
  { value: "responsable_destinations",  label: "Responsable Destinations",    icon: "🗺️" },
  { value: "responsable_hebergements",  label: "Responsable Hébergements",    icon: "🏨" },
  { value: "responsable_activites",     label: "Responsable Activités",       icon: "🎯" },
  { value: "responsable_restaurants",   label: "Responsable Restaurants",     icon: "🍽️" },
  { value: "responsable_transport",     label: "Responsable Transport",       icon: "🚗" },
  { value: "responsable_evenements",    label: "Responsable Événements",      icon: "🎉" },
  { value: "responsable_contenus",      label: "Responsable Marketing/Contenus", icon: "📣" },
  { value: "agent",                     label: "Agent (droits minimaux)",     icon: "🌴" },
];

export const DEFAULT_PERMISSIONS_BY_ROLE: Record<StaffRole, PermissionKey[]> = {
  admin: [
    "voir_reservations", "modifier_reservations", "gerer_destinations",
    "gerer_hebergements", "gerer_activites", "gerer_restaurants",
    "gerer_transport", "gerer_evenements", "gerer_contenus",
    "gerer_temoignages", "gerer_promos", "gerer_commandes", "voir_clients",
    "gerer_calendrier", "gerer_parametres", "voir_logs",
  ],
  responsable_destinations: ["gerer_destinations", "voir_reservations", "scanner_qr"],
  responsable_hebergements: ["gerer_hebergements", "voir_reservations", "scanner_qr"],
  responsable_activites:    ["gerer_activites", "voir_reservations", "scanner_qr"],
  responsable_restaurants:  ["gerer_restaurants", "gerer_commandes", "scanner_qr"],
  responsable_transport:    ["gerer_transport", "voir_reservations", "scanner_qr"],
  responsable_evenements:   ["gerer_evenements", "voir_reservations", "scanner_qr"],
  responsable_contenus:     ["gerer_contenus", "gerer_temoignages", "gerer_promos"],
  agent: ["voir_reservations", "scanner_qr"],
};

export function hasModuleAccess(permissions: string[] | undefined, moduleKey: string): boolean {
  if (!permissions) return false;
  return PERMISSION_CATALOG.some(p => p.module === moduleKey && permissions.includes(p.key));
}

export function hasPermission(permissions: string[] | undefined, key: PermissionKey): boolean {
  return !!permissions?.includes(key);
}
