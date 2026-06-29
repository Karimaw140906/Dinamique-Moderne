import { useEffect, useState } from "react";
import ClientLayout from "./_layout";
import { StatCard, EmptyState, PageHeader, COLORS } from "./_shared";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface RecentActivity {
  id: string;
  type: "booking" | "message" | "payment";
  label: string;
  date: string;
}

export default function MonEspace() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ bookings: 0, messages: 0, points: 0, paid: 0 });
  const [recent, setRecent] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (!session?.clientUser) { setLoading(false); return; }
    const u = session.clientUser;

    Promise.all([
      supabase.from("bookings")
        .select("*")
        .or(`client_email.eq.${u.email},client_whatsapp.eq.${u.whatsapp}`)
        .order("created_at", { ascending: false }),
      supabase.from("messages")
        .select("*")
        .or(`sender_id.eq.${u.id},receiver_id.eq.${u.id}`),
    ]).then(([bookingsRes, messagesRes]) => {
      const bookings = bookingsRes.data || [];
      const messages = messagesRes.data || [];
      const paid = bookings
        .filter((b: any) => b.payment_status === "paid")
        .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

      setStats({
        bookings: bookings.length,
        messages: messages.length,
        points: u.points || 0,
        paid,
      });

      const recentBookings: RecentActivity[] = bookings.slice(0, 3).map((b: any) => ({
        id: b.id,
        type: "booking",
        label: `Réservation — ${b.service_name || "service"}`,
        date: b.created_at,
      }));
      setRecent(recentBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    });
  }, [session]);

  return (
    <ClientLayout>
      <PageHeader
        title="Tableau de bord"
        subtitle="Bienvenue dans votre espace personnel"
      />

      {/* Stats — données réelles Supabase, pas de valeurs codées en dur */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Réservations"
          value={loading ? "…" : String(stats.bookings)}
          sub={stats.bookings === 0 ? "aucune pour l'instant" : `${stats.bookings} au total`}
        />
        <StatCard
          label="Messages"
          value={loading ? "…" : String(stats.messages)}
          sub={stats.messages === 0 ? "boîte vide" : `${stats.messages} reçu(s)`}
          color={COLORS.or}
        />
        <StatCard
          label="Points fidélité"
          value={loading ? "…" : String(stats.points)}
          sub={stats.points === 0 ? "niveau débutant" : "voir le détail"}
          color="#6366f1"
        />
        <StatCard
          label="Paiements"
          value={loading ? "…" : `${stats.paid.toLocaleString()} F`}
          sub={stats.paid === 0 ? "aucune transaction" : "total payé"}
          color="#f59e0b"
        />
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

      {/* Activité récente — vraies réservations récentes, pas un état vide systématique */}
      <h2 className="text-base font-semibold mb-3" style={{ color: COLORS.noir }}>
        Activité récente
      </h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Chargement...</div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon="🌍"
            title="Aucune activité pour l'instant"
            description="Vos réservations, messages et paiements apparaîtront ici dès votre première interaction."
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm" style={{ color: COLORS.noir }}>{item.label}</p>
                <p className="text-xs text-gray-400">
                  {new Date(item.date).toLocaleDateString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
