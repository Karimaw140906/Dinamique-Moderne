import ClientLayout from "./_layout";
import { StatCard, EmptyState, PageHeader, Badge, COLORS } from "./_shared";
import { Link } from "wouter";

export default function MonEspace() {
  return (
    <ClientLayout>
      <PageHeader
        title="Tableau de bord"
        subtitle="Bienvenue dans votre espace personnel"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Réservations" value="0" sub="aucune pour l'instant" />
        <StatCard label="Messages" value="0" sub="boîte vide" color={COLORS.or} />
        <StatCard label="Points fidélité" value="0" sub="niveau débutant" color="#6366f1" />
        <StatCard label="Paiements" value="0 F" sub="aucune transaction" color="#f59e0b" />
      </div>

      {/* Accès rapides */}
      <h2 className="text-base font-semibold mb-3" style={{ color: COLORS.noir }}>
        Accès rapides
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {[
          { href: "/mon-espace/reservations", icon: "📋", label: "Mes réservations", desc: "Historique et statuts" },
          { href: "/mon-espace/messages", icon: "✉", label: "Mes messages", desc: "Conversations en cours" },
          { href: "/mon-espace/paiements", icon: "💳", label: "Mes paiements", desc: "Transactions et reçus" },
          { href: "/mon-espace/fidelite", icon: "★", label: "Fidélité", desc: "Points et récompenses" },
          { href: "/mon-espace/profil", icon: "◎", label: "Mon profil", desc: "Informations personnelles" },
          { href: "/", icon: "🏠", label: "Retour accueil", desc: "Explorer les services" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-sm font-semibold" style={{ color: COLORS.noir }}>{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Activité récente */}
      <h2 className="text-base font-semibold mb-3" style={{ color: COLORS.noir }}>
        Activité récente
      </h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <EmptyState
          icon="🌍"
          title="Aucune activité pour l'instant"
          description="Vos réservations, messages et paiements apparaîtront ici dès votre première interaction."
        />
      </div>
    </ClientLayout>
  );
}
