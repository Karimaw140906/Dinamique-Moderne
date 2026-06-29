import { useState } from "react";
import { useAuth } from "@/lib/auth";

const WHATSAPP = "221774188107";

export function UrgenceButton() {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);

  const send = (msg: string) => {
    const text = encodeURIComponent(
      `🆘 ASSISTANCE URGENTE — Sama Senegal\n\n${msg}\n\nClient : ${session?.name || "Anonyme"}\nHeure : ${new Date().toLocaleString("fr-FR")}`
    );
    window.open(`https://wa.me/${WHATSAPP}?text=${text}`, "_blank");
    setOpen(false);
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white font-bold text-xl transition-transform hover:scale-110"
        style={{ background: "#ef4444" }}
        title="Assistance urgente"
      >
        🆘
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-t-3xl md:rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-red-600 mb-1">🆘 Assistance urgente</h3>
            <p className="text-xs text-gray-500 mb-4">Choisissez le type d'assistance</p>
            <div className="space-y-2">
              {[
                { label: "🚑 Urgence médicale", msg: "J'ai besoin d'une assistance médicale urgente." },
                { label: "🚔 Problème de sécurité", msg: "J'ai un problème de sécurité urgent." },
                { label: "🏨 Problème hébergement", msg: "J'ai un problème urgent avec mon hébergement." },
                { label: "🚗 Panne / Transport", msg: "J'ai un problème urgent de transport." },
                { label: "💬 Autre urgence", msg: "J'ai besoin d'assistance urgente." },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => send(item.msg)}
                  className="w-full text-left px-4 py-3 rounded-xl border text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button onClick={() => setOpen(false)} className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-gray-600">
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
}
