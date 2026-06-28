import { logActivity } from "@/lib/activityLogger";
import { useState, useEffect } from "react";
import { printQRConfirmation } from "@/components/QRConfirmation";
import { Check, X, Download, QrCode, Star, RefreshCw, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const WHATSAPP_NUMBER = "221774188107";

function sendWhatsAppToClient(r: any, newStatus: string) {
  const phone = (r.client_whatsapp || r.client_phone || r.phone || "").replace(/\D/g, "");
  if (!phone) return;
  const statusMessages: Record<string, string> = {
    confirmed:   `✅ *Bonne nouvelle !*\n\nVotre réservation est maintenant *CONFIRMÉE*.\n\n🎯 Service : ${r.service_name || "—"}\n📅 Date : ${r.booking_date || r.date || "Non spécifiée"}\n👥 ${r.people_count || r.people || 1} personnes\n\nNous vous attendons avec plaisir. Pour toute question : +221 77 418 81 07`,
    cancelled:   `❌ *Réservation annulée*\n\nVotre réservation a été annulée.\n\nPour tout renseignement : +221 77 418 81 07`,
    completed:   `🌴 *Merci pour votre confiance !*\n\nVotre réservation est terminée. Nous espérons que vous avez passé un excellent moment avec Sama Sénégal !\n\nLaissez-nous un avis : +221 77 418 81 07`,
    in_progress: `🚀 *Votre expérience commence !*\n\nVotre réservation est maintenant *EN COURS*.\n\nBonne expérience avec Sama Sénégal ! 🌴`,
  };
  const msg = statusMessages[newStatus];
  if (!msg) return;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:     { label: "En attente",  color: "bg-yellow-100 text-yellow-700" },
  confirmed:   { label: "Confirmée",   color: "bg-green-100 text-green-700" },
  in_progress: { label: "En cours",    color: "bg-blue-100 text-blue-700" },
  completed:   { label: "Terminée",    color: "bg-gray-100 text-gray-600" },
  cancelled:   { label: "Annulée",     color: "bg-red-100 text-red-600" },
};

// Normalise un enregistrement Supabase ou localStorage vers format unifié
function normalizeBooking(b: any): any {
  return {
    ...b,
    id:           b.id || b.ref || Math.random().toString(36).slice(2),
    ref:          b.id || b.ref || "—",
    client_name:  b.client_name || b.name || "",
    client_phone: b.client_whatsapp || b.client_phone || b.phone || "",
    client_email: b.client_email || b.email || "",
    service_name: b.service_name || (Array.isArray(b.services) ? b.services[0] : "") || "—",
    service_type: b.service_type || "tours",
    people:       b.people_count || b.people || 1,
    date:         b.booking_date || b.date || null,
    time:         b.booking_time || b.time || null,
    extra:        b.extras || b.extra || null,
    status:       b.booking_status || b.status || "pending",
    services:     Array.isArray(b.services) ? b.services : [b.service_name].filter(Boolean),
  };
}

async function loadAllBookings(): Promise<any[]> {
  const results: any[] = [];

  // 1. Charger depuis Supabase
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      results.push(...data.map(normalizeBooking));
    }
  } catch {}

  // 2. Charger depuis localStorage (déduplication par ref)
  try {
    const local = JSON.parse(localStorage.getItem("bookings") || "[]");
    const supabaseRefs = new Set(results.map(r => r.ref));
    const localOnly = local
      .map(normalizeBooking)
      .filter((b: any) => !supabaseRefs.has(b.ref));
    results.push(...localOnly);
  } catch {}

  // Trier par date de création
  return results.sort((a, b) =>
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );
}

async function updateBookingStatus(id: string, status: string): Promise<void> {
  // Mettre à jour dans Supabase
  try {
    await supabase
      .from("bookings")
      .update({ booking_status: status })
      .eq("id", id);
  } catch {}

  // Mettre à jour dans localStorage
  try {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const updated = bookings.map((b: any) =>
      (b.id === id || b.ref === id) ? { ...b, status, booking_status: status } : b
    );
    localStorage.setItem("bookings", JSON.stringify(updated));
    window.dispatchEvent(new Event("bookingsUpdated"));
  } catch {}
}

async function scanQRBooking(id: string): Promise<void> {
  try {
    await supabase
      .from("bookings")
      .update({ qr_scanned: true, qr_scanned_at: new Date().toISOString(), booking_status: "in_progress" })
      .eq("id", id);
  } catch {}
  try {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const updated = bookings.map((b: any) =>
      (b.id === id || b.ref === id)
        ? { ...b, qr_scanned: true, qr_scanned_at: new Date().toISOString(), status: "in_progress" }
        : b
    );
    localStorage.setItem("bookings", JSON.stringify(updated));
    window.dispatchEvent(new Event("bookingsUpdated"));
  } catch {}
}

export function ReservationsAdmin() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const all = await loadAllBookings();
    setReservations(filter === "all" ? all : all.filter(r => r.status === filter));
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    window.addEventListener("bookingsUpdated", load);
    return () => window.removeEventListener("bookingsUpdated", load);
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const target = reservations.find(r => r.id === id || r.ref === id);
    await updateBookingStatus(id, status);
    await load();
    if (target) sendWhatsAppToClient(target, status);
  };

  const scanQR = async (r: any) => {
    await scanQRBooking(r.id || r.ref);
    await load();
  };

  const displayed = filter === "all" ? reservations : reservations.filter(r => r.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-gray-800">
          Réservations
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({displayed.length} {filter === "all" ? "au total" : STATUS_CONFIG[filter]?.label || ""})
          </span>
        </h2>
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={load} disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === s ? "bg-[#1A1A2E] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s === "all" ? "Toutes" : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
          <p>Chargement depuis Supabase...</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>Aucune réservation{filter !== "all" ? ` "${STATUS_CONFIG[filter]?.label}"` : " pour le moment"}.</p>
          <p className="text-sm mt-2 text-gray-300">Les réservations Supabase + locales apparaissent ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(r => {
            const status = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            return (
              <div key={r.id || r.ref} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-[#1A1A2E] text-sm font-mono">{r.ref}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                      {r.qr_scanned && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">✅ QR scanné</span>}
                      {r.id && !r.ref?.startsWith("SS-") && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">☁️ Supabase</span>}
                    </div>
                    <div className="font-semibold text-gray-700 text-sm">{r.client_name}</div>
                    <div className="text-xs text-gray-500">
                      {r.client_phone && <span>{r.client_phone}</span>}
                      {r.client_email && <span> · {r.client_email}</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                      {r.services?.length > 0 && <div>🎯 {r.services.join(", ")}</div>}
                      <div>
                        {r.date ? `📅 ${r.date}` : "📅 Date non spécifiée"}
                        {r.time ? ` à ${r.time}` : ""}
                        {" · "}👥 {r.people} pers.
                      </div>
                      {r.extra && <div className="text-gray-300">💬 {r.extra}</div>}
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      {r.created_at ? new Date(r.created_at).toLocaleString("fr-FR") : "—"}
                    </div>
                    {r.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                        {r.review && <span className="text-xs text-gray-400 ml-1">"{r.review}"</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap shrink-0">
                    <button onClick={() => printQRConfirmation({ ref: r.ref, client_name: r.client_name, client_phone: r.client_phone, service_type: r.service_type || "tours", service_name: r.service_name || "—", date: r.date, time: r.time, people: r.people, extra: r.extra, status: r.status })}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" title="PDF/QR">
                      <Download className="w-4 h-4" />
                    </button>
                    {r.client_phone && (
                      <button onClick={() => { const ph = r.client_phone.replace(/\D/g, ""); window.open(`https://wa.me/${ph}?text=${encodeURIComponent(`Bonjour ${r.client_name}! Concernant votre réservation — Sama Sénégal`)}`, "_blank"); }}
                        className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors" title="WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    {!r.qr_scanned && r.status === "confirmed" && (
                      <button onClick={() => scanQR(r)} className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors" title="Scanner QR">
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                    {r.status === "pending" && (
                      <button onClick={() => updateStatus(r.id || r.ref, "confirmed")}
                        className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors" title="Confirmer">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {["pending", "confirmed", "in_progress"].includes(r.status) && (
                      <button onClick={() => updateStatus(r.id || r.ref, "cancelled")}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors" title="Annuler">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {r.status === "in_progress" && (
                      <button onClick={() => updateStatus(r.id || r.ref, "completed")}
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
