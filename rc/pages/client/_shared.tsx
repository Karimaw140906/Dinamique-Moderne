import {
  CalendarX,
  WalletCards,
  MessageSquareOff,
  User,
  Gift,
} from "lucide-react";

/* ============================================================================
   SAMA SENEGAL — ESPACE CLIENT — HELPERS PARTAGÉS
   Utilisé par : MonEspace, Reservations, Paiements, Messages, Profil, Fidelite
============================================================================ */

export const C = {
  green: "#2C7A5C",
  gold: "#D4A017",
  ivory: "#F5F0E8",
  dark: "#1A1A2E",
  red: "#EF4444",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ReservationStatus = "confirmee" | "en_attente" | "annulee" | "terminee";

export interface ReservationRow {
  id: string;
  service_name: string;
  service_type: string;
  date: string;
  status: ReservationStatus;
  amount?: number;
}

export type PaymentStatus = "reussi" | "en_attente" | "echoue";

export interface PaymentRow {
  id: string;
  label: string;
  amount: number;
  method?: string;
  status: PaymentStatus;
  date: string;
}

export interface MessageThreadRow {
  id: string;
  contact_name: string;
  last_message: string;
  date: string;
  unread: boolean;
}

export interface LoyaltyRow {
  points: number;
  level: "decouverte" | "explorateur" | "ambassadeur" | "vip";
}

export interface ClientProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  language: string;
  devices?: string[];
}

// ---------------------------------------------------------------------------
// Défauts — toujours vides, jamais de contenu fictif
// ---------------------------------------------------------------------------
export const DEFAULT_RESERVATIONS: ReservationRow[] = [];
export const DEFAULT_PAYMENTS: PaymentRow[] = [];
export const DEFAULT_MESSAGES: MessageThreadRow[] = [];
export const DEFAULT_LOYALTY: LoyaltyRow[] = [];
export const DEFAULT_PROFILE: ClientProfileRow[] = [];

// ---------------------------------------------------------------------------
// Helpers d'affichage
// ---------------------------------------------------------------------------
export function statusBadge(status: ReservationStatus | PaymentStatus) {
  const map: Record<string, { label: string; bg: string; fg: string }> = {
    confirmee: { label: "Confirmée", bg: "#2C7A5C20", fg: C.green },
    reussi: { label: "Réussi", bg: "#2C7A5C20", fg: C.green },
    en_attente: { label: "En attente", bg: "#D4A01720", fg: C.gold },
    annulee: { label: "Annulée", bg: "#EF444420", fg: C.red },
    echoue: { label: "Échoué", bg: "#EF444420", fg: C.red },
    terminee: { label: "Terminée", bg: "#1A1A2E15", fg: C.dark },
  };
  const s = map[status] ?? map.en_attente;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: any;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center text-center py-14 px-6 rounded-2xl border border-dashed"
      style={{ borderColor: "#1A1A2E20" }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: "#2C7A5C15" }}
      >
        <Icon size={26} style={{ color: C.green }} />
      </div>
      <h3 className="font-semibold text-base mb-1.5" style={{ color: C.dark }}>
        {title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: "#1A1A2E80" }}>
        {subtitle}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 rounded-full text-sm font-semibold transition-transform active:scale-95"
          style={{ backgroundColor: C.green, color: "#fff" }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2
        className="text-2xl mb-1"
        style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: C.dark }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm" style={{ color: "#1A1A2E70" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function ProfileRow({
  icon: Icon,
  label,
  value,
  chevron,
}: {
  icon: any;
  label: string;
  value: string;
  chevron?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: C.ivory }}>
      <Icon size={18} style={{ color: C.green }} />
      <div className="flex-1">
        <p className="text-xs" style={{ color: "#1A1A2E70" }}>
          {label}
        </p>
        <p className="text-sm font-medium" style={{ color: C.dark }}>
          {value}
        </p>
      </div>
      {chevron && <span style={{ color: "#1A1A2E50" }}>›</span>}
    </div>
  );
}