import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { printQRConfirmation } from "@/components/QRConfirmation";
import { Check, X, Download, QrCode, Star } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmée", color: "bg-green-100 text-green-700" },
  in_progress: { label: "En cours", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Terminée", color: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-600" },
};

export function ReservationsAdmin() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    let query = supabase.from("reservations").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    if (data) setReservations(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    await load();
  };

  const scanQR = async (r: any) => {
    await supabase.from("reservations").update({
      qr_scanned: true, qr_scanned_at: new Date().toISOString(), status: "in_progress"
    }).eq("id", r.id);
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-gray-800">Réservations</h2>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "in_progress", "completed"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === s ? "bg-[#1A1A2E] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s === "all" ? "Toutes" : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Chargement...</div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <p>Aucune réservation{filter !== "all" ? ` avec le statut "${STATUS_CONFIG[filter]?.label}"` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map(r => {
            const status = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            return (
              <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#1A1A2E] text-sm">{r.ref}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                      {r.qr_scanned && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">✅ QR scanné</span>}
                    </div>
                    <div className="font-semibold text-gray-700">{r.client_name}</div>
                    <div className="text-xs text-gray-500">{r.client_phone} {r.client_email ? `· ${r.client_email}` : ""}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {r.service_name} · {r.date || "Date non spécifiée"} {r.time ? `à ${r.time}` : ""} · {r.people} pers.
                    </div>
                    {r.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                        {r.review && <span className="text-xs text-gray-400 ml-1">"{r.review}"</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => printQRConfirmation({
                        ref: r.ref, client_name: r.client_name, client_phone: r.client_phone,
                        service_type: r.service_type, service_name: r.service_name,
                        date: r.date, time: r.time, people: r.people, extra: r.extra, status: r.status,
                      })}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" title="PDF">
                      <Download className="w-4 h-4" />
                    </button>
                    {!r.qr_scanned && r.status === "confirmed" && (
                      <button onClick={() => scanQR(r)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors" title="Scanner QR">
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                    {r.status === "pending" && (
                      <button onClick={() => updateStatus(r.id, "confirmed")}
                        className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors" title="Confirmer">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {["pending", "confirmed", "in_progress"].includes(r.status) && (
                      <button onClick={() => updateStatus(r.id, "cancelled")}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors" title="Annuler">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {r.status === "in_progress" && (
                      <button onClick={() => updateStatus(r.id, "completed")}
                        className="px-3 py-2 rounded-lg bg-[#2C7A5C] hover:bg-[#245f49] text-white text-xs font-bold transition-colors">
                        Terminer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
