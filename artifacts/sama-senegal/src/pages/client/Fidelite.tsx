import { useEffect, useState } from "react";
import ClientLayout from "./_layout";
import { PageHeader, EmptyState, COLORS } from "./_shared";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const NIVEAUX = [
  { label: "Débutant", min: 0, max: 500, color: "#9ca3af" },
  { label: "Explorateur", min: 500, max: 2000, color: "#2C7A5C" },
  { label: "Voyageur", min: 2000, max: 5000, color: "#6366f1" },
  { label: "Premium", min: 5000, max: 10000, color: "#D4A017" },
  { label: "VIP", min: 10000, max: null, color: "#ef4444" },
];

export default function Fidelite() {
  const { session } = useAuth();
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.clientUser) { setLoading(false); return; }
    const u = session.clientUser;
    setPoints(u.points || 0);
    supabase.from("loyalty_points")
      .select("*")
      .eq("client_id", u.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setHistory(data || []); setLoading(false); });
  }, [session]);

  const niveau = NIVEAUX.find(n => points >= n.min && (n.max === null || points < n.max)) || NIVEAUX[0];
  const next = NIVEAUX[NIVEAUX.indexOf(niveau) + 1];
  const progress = next ? Math.round(((points - niveau.min) / (next.min - niveau.min)) * 100) : 100;

  return (
    <ClientLayout>
      <PageHeader title="Programme fidélité" subtitle="Vos points et récompenses Sama Senegal" />

      {/* Carte points */}
      <div className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #2C7A5C, #1a5c42)` }}>
        <p className="text-sm opacity-80 mb-1">Vos points</p>
        <p className="text-5xl font-bold mb-1">{points}</p>
        <p className="text-sm opacity-70">Niveau : {niveau.label}</p>
        {next && (
          <div className="mt-4">
            <div className="flex justify-between text-xs opacity-70 mb-1">
              <span>{points} pts</span>
              <span>{next.min} pts pour {next.label}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <div className="absolute right-4 top-4 text-6xl opacity-10">★</div>
      </div>

      {/* Niveaux */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">Progression par niveau</p>
        {NIVEAUX.map((n) => (
          <div key={n.label} className="flex items-center gap-3 mb-3 last:mb-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.color }} />
            <div className="flex-1 flex justify-between text-xs">
              <span style={{ color: COLORS.noir, fontWeight: n.label === niveau.label ? 700 : 400 }}>
                {n.label} {n.label === niveau.label ? "← vous êtes ici" : ""}
              </span>
              <span className="text-gray-400">{n.max ? `${n.min}–${n.max} pts` : `${n.min}+ pts`}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Historique */}
      <h2 className="text-base font-semibold mb-3" style={{ color: COLORS.noir }}>Historique des points</h2>
      {loading ? (
        <div className="text-center py-8 text-gray-400">Chargement...</div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <EmptyState icon="★" title="Aucun historique" description="Vos gains de points apparaîtront ici après vos réservations." />
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((h) => (
            <div key={h.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.noir }}>{h.reason || "Réservation"}</p>
                <p className="text-xs text-gray-400">{new Date(h.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <p className="font-bold" style={{ color: h.points > 0 ? "#16a34a" : "#ef4444" }}>
                {h.points > 0 ? "+" : ""}{h.points} pts
              </p>
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}
