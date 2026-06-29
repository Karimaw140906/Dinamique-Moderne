import ClientLayout from "./_layout";
import { PageHeader, EmptyState, COLORS } from "./_shared";

const NIVEAUX = [
  { label: "Débutant", min: 0, max: 500, color: "#9ca3af" },
  { label: "Explorateur", min: 500, max: 2000, color: COLORS.vert },
  { label: "Voyageur", min: 2000, max: 5000, color: "#6366f1" },
  { label: "Premium", min: 5000, max: 10000, color: COLORS.or },
  { label: "VIP", min: 10000, max: null, color: "#ef4444" },
];

const COLORS_LOCAL = { vert: "#2C7A5C", or: "#D4A017", noir: "#1A1A2E" };

export default function Fidelite() {
  const points = 0;
  const niveau = NIVEAUX[0];

  return (
    <ClientLayout>
      <PageHeader
        title="Programme fidélité"
        subtitle="Vos points et récompenses Sama Senegal"
      />

      {/* Carte points */}
      <div
        className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${COLORS_LOCAL.vert}, #1a5c42)` }}
      >
        <p className="text-sm opacity-80 mb-1">Vos points</p>
        <p className="text-5xl font-bold mb-1">{points}</p>
        <p className="text-sm opacity-70">Niveau : {niveau.label}</p>
        <div className="absolute right-4 top-4 text-6xl opacity-10">★</div>
      </div>

      {/* Progression */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">
          Progression par niveau
        </p>
        {NIVEAUX.map((n) => (
          <div key={n.label} className="flex items-center gap-3 mb-3 last:mb-0">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: n.color }}
            />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: COLORS_LOCAL.noir, fontWeight: 500 }}>{n.label}</span>
                <span className="text-gray-400">
                  {n.max ? `${n.min} – ${n.max} pts` : `${n.min}+ pts`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Récompenses */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <EmptyState
          icon="★"
          title="Aucune récompense disponible"
          description="Accumulez des points en effectuant des réservations pour débloquer des avantages exclusifs."
        />
      </div>
    </ClientLayout>
  );
}
