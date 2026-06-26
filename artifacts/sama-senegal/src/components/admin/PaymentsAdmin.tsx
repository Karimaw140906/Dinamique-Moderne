import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, TrendingUp, CreditCard, Smartphone, RefreshCw } from "lucide-react";

const METHOD_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  orange_money: { label: "Orange Money", icon: "🟠", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  wave:         { label: "Wave",         icon: "🌊", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  carte:        { label: "Carte",        icon: "💳", color: "text-gray-700",   bg: "bg-gray-50 border-gray-200" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  validated: { label: "Validé",     color: "bg-green-100 text-green-700",   icon: CheckCircle },
  cancelled: { label: "Annulé",     color: "bg-red-100 text-red-600",       icon: XCircle },
};

function loadPayments() {
  try { return JSON.parse(localStorage.getItem("payments") || "[]"); } catch { return []; }
}
function savePayments(data: any[]) {
  localStorage.setItem("payments", JSON.stringify(data));
  window.dispatchEvent(new Event("paymentsUpdated"));
}

export function PaymentsAdmin() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "validated" | "cancelled">("all");

  const load = () => setPayments(loadPayments());

  useEffect(() => {
    load();
    window.addEventListener("paymentsUpdated", load);
    return () => window.removeEventListener("paymentsUpdated", load);
  }, []);

  const updateStatus = (txId: string, status: string) => {
    const updated = payments.map(p => p.transaction_id === txId ? { ...p, status } : p);
    savePayments(updated);
    setPayments(updated);

    // Si validé, mettre à jour aussi la réservation
    if (status === "validated") {
      try {
        const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
        const pmt = payments.find(p => p.transaction_id === txId);
        if (pmt) {
          const updatedB = bookings.map((b: any) =>
            b.ref === pmt.booking_ref ? { ...b, paid: true, status: "confirmed" } : b
          );
          localStorage.setItem("bookings", JSON.stringify(updatedB));
          window.dispatchEvent(new Event("bookingsUpdated"));
        }
      } catch {}
    }
  };

  const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter);

  // Totaux par méthode
  const totals = payments.filter(p => p.status !== "cancelled").reduce((acc: any, p: any) => {
    const m = p.method || "autre";
    acc[m] = (acc[m] || 0) + (p.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const grandTotal = Object.values(totals).reduce((a: any, b: any) => a + b, 0);
  const pending = payments.filter(p => p.status === "pending").length;
  const validated = payments.filter(p => p.status === "validated").length;

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total encaissé</div>
          <div className="text-2xl font-bold text-[#2C7A5C]">{(grandTotal as number).toLocaleString("fr-FR")}</div>
          <div className="text-xs text-gray-400">FCFA</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Transactions</div>
          <div className="text-2xl font-bold text-[#1A1A2E]">{payments.length}</div>
          <div className="text-xs text-gray-400">total</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">En attente</div>
          <div className="text-2xl font-bold text-yellow-600">{pending}</div>
          <div className="text-xs text-gray-400">à valider</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Validés</div>
          <div className="text-2xl font-bold text-green-600">{validated}</div>
          <div className="text-xs text-gray-400">confirmés</div>
        </div>
      </div>

      {/* Totaux par méthode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(METHOD_LABELS).map(([key, m]) => (
          <div key={key} className={`rounded-xl p-4 border ${m.bg} flex items-center gap-4`}>
            <span className="text-3xl">{m.icon}</span>
            <div>
              <div className={`font-bold ${m.color}`}>{m.label}</div>
              <div className="text-lg font-bold text-gray-800">
                {((totals[key] || 0) as number).toLocaleString("fr-FR")} FCFA
              </div>
              <div className="text-xs text-gray-400">
                {payments.filter(p => p.method === key && p.status !== "cancelled").length} paiement(s)
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-gray-600">Filtrer :</span>
          {(["all", "pending", "validated", "cancelled"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === f ? "bg-[#1A1A2E] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f === "all" ? "Tous" : STATUS_CONFIG[f]?.label}
              <span className="ml-1.5 opacity-70">
                ({f === "all" ? payments.length : payments.filter(p => p.status === f).length})
              </span>
            </button>
          ))}
          <button onClick={load} className="ml-auto p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Aucun paiement enregistré</p>
            <p className="text-xs mt-1">Les paiements apparaîtront ici dès qu'un client paiera</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((p, i) => {
              const m = METHOD_LABELS[p.method] || { label: p.method, icon: "💰", color: "text-gray-700", bg: "" };
              const s = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
              const StatusIcon = s.icon;
              return (
                <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl shrink-0">{m.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-[#1A1A2E] text-sm">
                        {(p.amount || 0).toLocaleString("fr-FR")} FCFA
                        <span className={`ml-2 text-xs font-medium ${m.color}`}>{m.label}</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        Réf : {p.booking_ref || "—"}
                        {p.phone && ` · ${p.phone}`}
                      </div>
                      <div className="font-mono text-xs text-gray-300 truncate">{p.transaction_id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${s.color}`}>
                      <StatusIcon className="w-3 h-3" /> {s.label}
                    </span>

                    {p.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(p.transaction_id, "validated")}
                          className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors" title="Valider">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateStatus(p.transaction_id, "cancelled")}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Annuler">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {p.status === "validated" && (
                      <button onClick={() => updateStatus(p.transaction_id, "cancelled")}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Annuler">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-gray-300 shrink-0">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
