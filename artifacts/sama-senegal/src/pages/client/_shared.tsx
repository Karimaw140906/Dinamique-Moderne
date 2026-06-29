import { useLocation } from "wouter";

export const COLORS = {
  vert: "#2C7A5C",
  or: "#D4A017",
  ivoire: "#F5F0E8",
  noir: "#1A1A2E",
};

export const NAV_ITEMS = [
  { path: "/mon-espace", label: "Tableau de bord", icon: "⊞" },
  { path: "/mon-espace/reservations", label: "Réservations", icon: "📋" },
  { path: "/mon-espace/paiements", label: "Paiements", icon: "💳" },
  { path: "/mon-espace/messages", label: "Messages", icon: "✉" },
  { path: "/mon-espace/fidelite", label: "Fidélité", icon: "★" },
  { path: "/mon-espace/profil", label: "Mon profil", icon: "◎" },
];

export function StatCard({
  label,
  value,
  sub,
  color = COLORS.vert,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{ borderTop: `3px solid ${color}` }}
      className="bg-white rounded-xl p-4 shadow-sm"
    >
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color: COLORS.noir }}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.noir }}>
        {title}
      </h3>
      <p className="text-gray-500 text-sm max-w-xs">{description}</p>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: "Playfair Display, serif", color: COLORS.noir }}
      >
        {title}
      </h1>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

export function Badge({
  label,
  type = "default",
}: {
  label: string;
  type?: "success" | "warning" | "error" | "default";
}) {
  const styles = {
    success: { background: "#dcfce7", color: "#166534" },
    warning: { background: "#fef9c3", color: "#854d0e" },
    error: { background: "#fee2e2", color: "#991b1b" },
    default: { background: "#f3f4f6", color: "#374151" },
  };
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={styles[type]}
    >
      {label}
    </span>
  );
}
