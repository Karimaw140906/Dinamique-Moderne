import { useState, useEffect } from "react";
import { printQRConfirmation } from "@/components/QRConfirmation";
import { Check, X, Download, QrCode, Star, RefreshCw, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "221774188107";

function sendWhatsAppToClient(r: any, newStatus: string) {
  const phone = (r.client_phone || r.phone || "").replace(/\D/g, "");
  if (!phone) return;
  const statusMessages: Record<string, string> = {
    confirmed:   `✅ *Bonne nouvelle !*\n\nVotre réservation *N° ${r.ref}* est maintenant *CONFIRMÉE*.\n\n🎯 Service : ${r.service_name || "—"}\n📅 Date : ${r.date || "Non spécifiée"}\n👥 ${r.people} personnes\n\nNous vous attendons avec plaisir. Pour toute question : +221 77 418 81 07`,
    cancelled:   `❌ *Réservation annulée*\n\nVotre réservation *N° ${r.ref}* a été annulée.\n\nPour tout renseignement, contactez-nous au +221 77 418 81 07`,
    completed:   `🌴 *Merci pour votre confiance !*\n\nVotre réservation *N° ${r.ref}* est terminée. Nous espérons que vous avez passé un excellent moment avec Sama Sénégal !\n\nLaissez-nous un avis : +221 77 418 81 07`,
    in_progress: `🚀 *Votre expérience commence !*\n\nVotre réservation *N° ${r.ref}* est maintenant *EN COURS*.\n\nBonne expérience avec Sama Sénégal ! 🌴`,
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

function loadBookings(): any[] {
  try {
    const raw = localStorage.getItem("bookings");
    if (!raw) return [];
    const data = JSON.parse(raw);
    // Normalise champs : booking public → champs admin
    return data.map((b: any) => ({
      ...b,
      id: b.ref || b.id || Math.random().toString(36).slice(2),
      client_name:  b.client_name  || b.name  || "",
      client_phone: b.client_phone || b.phone || "",
      client_email: b.client_email || b.email || "",
      service_name: b.service_name || (Array.isArray(b.services) ? b.services[0] : "") || "—",
      service_type: b.service_type || "tours",
      people:       b.people       || 1,
      status:       b.status       || "pending",
    }));
  } catch { return []; }
}

function saveBookings(bookings: any[]) {
  localStorage.setItem("bookings", JSON.stringify(bookings));
  window.dispatchEvent(new Event("bookingsUpdated"));
}

export function ReservationsAdmin() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  const load = () => {
    const all = loadBookings();
    setReservations(filter === "all" ? all : all.filter(r => r.status === filter));
  };

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    window.addEventListener("bookingsUpdated", load);
    return () => window.removeEventListener("bookingsUpdated", load);
  }, [filter]);

  const updateStatus = (id: string, status: string) => {
    const all = loadBookings();
    const target = all.find(r => r.id === id || r.ref === id);
    const updated = all.map(r => r.id === id || r.ref === id ? { ...r, status } : r);
    saveBookings(updated);
    load();
    // Notification WhatsApp automatique au client
    if (target) sendWhatsAppToClient(target, status);
  };

  const scanQR = (r: any) => {
    const all = loadBookings();
    const updated = all.map(b =>
      (b.id === r.id || b.ref === r.ref)
        ? { ...b, qr_scanned: true, qr_scanned_at: new Date().toISOString(), status: "in_progress" }
        : b
    );
    saveBookings(updated);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-gray-800">
          Réservations
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({reservations.length} {filter === "all" ? "au total" : STATUS_CONFIG[filter]?.label || ""})
          </span>
        </h2>
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Rafraîchir">
            <RefreshCw className="w-4 h-4" />
          </button>
          {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === s ? "bg-[#1A1A2E] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s === "all" ? "Toutes" : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>Aucune réservation{filter !== "all" ? ` avec le statut "${STATUS_CONFIG[filter]?.label}"` : " pour le moment"}.</p>
          <p className="text-sm mt-2 text-gray-300">Les réservations apparaissent ici dès qu'un client soumet le formulaire.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map(r => {
            const status = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const services = Array.isArray(r.services) ? r.services : [r.service_name].filter(Boolean);
            return (
              <div key={r.ref || r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-[#1A1A2E] text-sm font-mono">{r.ref}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                      {r.qr_scanned && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">✅ QR scanné</span>
                      )}
                    </div>

                    <div className="font-semibold text-gray-700 text-sm">{r.client_name}</div>
                    <div className="text-xs text-gray-500">
                      {r.client_phone && <span>{r.client_phone}</span>}
                      {r.client_email && <span> · {r.client_email}</span>}
                    </div>

                    <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                      {services.length > 0 && <div>🎯 {services.join(", ")}</div>}
                      <div>
                        {r.date ? `📅 ${r.date}` : "📅 Date non spécifiée"}
                        {r.time ? ` à ${r.time}` : ""}
                        {" · "}
                        👥 {r.people} pers.
                      </div>
                      {r.extra && <div className="text-gray-300">💬 {r.extra}</div>}
                    </div>

                    <div className="text-xs text-gray-300 mt-1">
                      Créée le {r.created_at ? new Date(r.created_at).toLocaleString("fr-FR") : "—"}
                    </div>

                    {r.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        ))}
                        {r.review && <span className="text-xs text-gray-400 ml-1">"{r.review}"</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap shrink-0">
                    <button
                      onClick={() => printQRConfirmation({
                        ref:          r.ref,
                        client_name:  r.client_name,
                        client_phone: r.client_phone,
                        service_type: r.service_type || "tours",
                        service_name: r.service_name || services[0] || "—",
                        date:  r.date,
                        time:  r.time,
                        people: r.people,
                        extra:  r.extra,
                        status: r.status,
                      })}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" title="Télécharger PDF">
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Bouton WhatsApp manuel */}
                    {(r.client_phone || r.phone) && (
                      <button
                        onClick={() => {
                          const ph = (r.client_phone || r.phone || "").replace(/\D/g, "");
                          const msg = encodeURIComponent(
                            `Bonjour ${r.client_name || r.name || ""}! Concernant votre réservation N° ${r.ref} — Sama Sénégal`
                          );
                          window.open(`https://wa.me/${ph}?text=${msg}`, "_blank");
                        }}
                        className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                        title="Contacter par WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}

                    {!r.qr_scanned && r.status === "confirmed" && (
                      <button onClick={() => scanQR(r)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors" title="Marquer QR scanné">
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}

                    {r.status === "pending" && (
                      <button onClick={() => updateStatus(r.ref || r.id, "confirmed")}
                        className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors" title="Confirmer">
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    {["pending", "confirmed", "in_progress"].includes(r.status) && (
                      <button onClick={() => updateStatus(r.ref || r.id, "cancelled")}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors" title="Annuler">
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {r.status === "in_progress" && (
                      <button onClick={() => updateStatus(r.ref || r.id, "completed")}
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
