import { useEffect, useState } from "react";
import ClientLayout from "./_layout";
import { EmptyState, PageHeader, Badge, COLORS } from "./_shared";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function Reservations() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Toutes");

  useEffect(() => {
    if (!session?.clientUser) { setLoading(false); return; }
    const u = session.clientUser;
    supabase.from("bookings")
      .select("*")
      .or(`client_email.eq.${u.email},client_whatsapp.eq.${u.whatsapp}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setBookings(data || []); setLoading(false); });
  }, [session]);

  const filtered = filter === "Toutes" ? bookings : bookings.filter(b =>
    filter === "Confirmées" ? b.booking_status === "confirmed" :
    filter === "En cours" ? b.booking_status === "pending" :
    filter === "Annulées" ? b.booking_status === "cancelled" : true
  );

  const statusBadge = (s: string) => {
    if (s === "confirmed") return <Badge label="Confirmée" type="success" />;
    if (s === "cancelled") return <Badge label="Annulée" type="error" />;
    return <Badge label="En attente" type="warning" />;
  };

  const payBadge = (s: string) => {
    if (s === "paid") return <Badge label="Payé" type="success" />;
    return <Badge label="Non payé" type="warning" />;
  };

  return (
    <ClientLayout>
      <PageHeader title="Mes réservations" subtitle={`${bookings.length} réservation${bookings.length > 1 ? "s" : ""} au total`} />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {["Toutes", "En cours", "Confirmées", "Annulées"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all"
            style={{
              background: filter === f ? COLORS.vert : "white",
              color: filter === f ? "white" : COLORS.noir,
              borderColor: filter === f ? COLORS.vert : "#e5e7eb",
            }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <EmptyState icon="📋" title="Aucune réservation" description="Vos réservations apparaîtront ici après votre première commande." />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm" style={{ color: COLORS.noir }}>{b.service_name}</p>
                  <p className="text-xs text-gray-400 capitalize">{b.service_type}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {statusBadge(b.booking_status)}
                  {payBadge(b.payment_status)}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-2">
                <div className="text-xs text-gray-400">
                  {b.booking_date ? new Date(b.booking_date).toLocaleDateString("fr-FR") : "Date non définie"}
                  {b.people_count > 1 && ` · ${b.people_count} pers.`}
                </div>
                <div className="text-sm font-bold" style={{ color: COLORS.or }}>
                  {b.total_amount > 0 ? `${b.total_amount.toLocaleString()} F` : "Gratuit"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}
