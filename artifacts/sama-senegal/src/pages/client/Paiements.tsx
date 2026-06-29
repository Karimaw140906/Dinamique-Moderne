import { useEffect, useState } from "react";
import ClientLayout from "./_layout";
import { EmptyState, PageHeader, StatCard, Badge, COLORS } from "./_shared";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function Paiements() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.clientUser) { setLoading(false); return; }
    const u = session.clientUser;
    supabase.from("bookings")
      .select("*")
      .or(`client_email.eq.${u.email},client_whatsapp.eq.${u.whatsapp}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setBookings(data || []); setLoading(false); });
  }, [session]);

  const total = bookings.filter(b => b.payment_status === "paid").reduce((s, b) => s + (b.total_amount || 0), 0);
  const pending = bookings.filter(b => b.payment_status !== "paid").reduce((s, b) => s + (b.total_amount || 0), 0);

  return (
    <ClientLayout>
      <PageHeader title="Mes paiements" subtitle="Historique de vos transactions" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total payé" value={`${total.toLocaleString()} F`} sub={`${bookings.filter(b => b.payment_status === "paid").length} transaction(s)`} color={COLORS.vert} />
        <StatCard label="En attente" value={`${pending.toLocaleString()} F`} sub={`${bookings.filter(b => b.payment_status !== "paid").length} en attente`} color={COLORS.or} />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Moyens de paiement acceptés</p>
        <div className="flex flex-wrap gap-2">
          {["Wave", "Orange Money", "Free Money", "Carte bancaire"].map((m) => (
            <span key={m} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: COLORS.vert, color: COLORS.vert }}>{m}</span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <EmptyState icon="💳" title="Aucune transaction" description="Vos paiements apparaîtront ici après votre première réservation." />
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold" style={{ color: COLORS.noir }}>{b.service_name}</p>
                <p className="text-xs text-gray-400">{new Date(b.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: COLORS.or }}>
                  {b.total_amount > 0 ? `${b.total_amount.toLocaleString()} F` : "—"}
                </p>
                {b.payment_status === "paid"
                  ? <Badge label="Payé" type="success" />
                  : <Badge label="Non payé" type="warning" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}
