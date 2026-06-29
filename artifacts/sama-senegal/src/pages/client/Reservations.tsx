import ClientLayout from "./_layout";
import { EmptyState, PageHeader, Badge, COLORS } from "./_shared";

export default function Reservations() {
  return (
    <ClientLayout>
      <PageHeader
        title="Mes réservations"
        subtitle="Historique et suivi de vos réservations"
      />

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {["Toutes", "En cours", "Confirmées", "Annulées"].map((f) => (
          <button
            key={f}
            className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all"
            style={{
              background: f === "Toutes" ? COLORS.vert : "white",
              color: f === "Toutes" ? "white" : COLORS.noir,
              borderColor: f === "Toutes" ? COLORS.vert : "#e5e7eb",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Liste vide */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <EmptyState
          icon="📋"
          title="Aucune réservation"
          description="Vos réservations d'hôtels, restaurants, activités et transports apparaîtront ici."
        />
      </div>
    </ClientLayout>
  );
}
