import ClientLayout from "./_layout";
import { EmptyState, PageHeader, StatCard, COLORS } from "./_shared";

export default function Paiements() {
  return (
    <ClientLayout>
      <PageHeader
        title="Mes paiements"
        subtitle="Historique de vos transactions"
      />

      {/* Résumé */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total dépensé" value="0 F" sub="aucune transaction" color={COLORS.vert} />
        <StatCard label="En attente" value="0 F" sub="aucun paiement" color={COLORS.or} />
      </div>

      {/* Méthodes acceptées */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Moyens de paiement acceptés
        </p>
        <div className="flex flex-wrap gap-2">
          {["Wave", "Orange Money", "Free Money", "Carte bancaire"].map((m) => (
            <span
              key={m}
              className="text-xs px-3 py-1 rounded-full border"
              style={{ borderColor: COLORS.vert, color: COLORS.vert }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Historique vide */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <EmptyState
          icon="💳"
          title="Aucune transaction"
          description="Vos paiements et reçus apparaîtront ici après votre première réservation."
        />
      </div>
    </ClientLayout>
  );
}
