import { useState } from "react";
import { Phone, X, MessageCircle, Shield } from "lucide-react";

export function SOSButton() {
  const [expanded, setExpanded] = useState(false);

  const sosMessage = encodeURIComponent(
    "🆘 URGENCE TOURISTE — J'ai besoin d'aide immédiatement.\n\n" +
    "Je suis un touriste au Sénégal et j'ai besoin d'assistance urgente.\n\n" +
    "Merci de me contacter rapidement."
  );

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[100] flex flex-col items-end gap-2">
      {expanded && (
        <div className="bg-white rounded-2xl shadow-2xl border border-red-100 p-4 w-64 sm:w-72 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">Assistance Urgente</div>
              <div className="text-xs text-gray-500">Disponible 24h/24</div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            En cas d'urgence touristique, notre équipe Sama Senegal vous répond immédiatement via WhatsApp.
          </p>
          <a
            href={`https://wa.me/221774188107?text=${sosMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-sm transition-colors"
            onClick={() => setExpanded(false)}>
            <MessageCircle className="w-4 h-4" />
            Contacter via WhatsApp
          </a>
          <a
            href="tel:+221774188107"
            className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors">
            <Phone className="w-4 h-4" />
            Appeler maintenant
          </a>
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className={`relative flex items-center gap-2 min-h-[52px] px-4 rounded-2xl shadow-xl font-bold text-white transition-all duration-200 ${
          expanded
            ? "bg-gray-700 hover:bg-gray-800"
            : "bg-red-600 hover:bg-red-700"
        }`}
        aria-label="Bouton SOS urgence touriste">
        {!expanded && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
        )}
        {expanded ? (
          <><X className="w-5 h-5" /> <span className="text-sm">Fermer</span></>
        ) : (
          <><span className="text-lg font-black">SOS</span> <span className="text-sm hidden sm:inline">Urgence</span></>
        )}
      </button>
    </div>
  );
}
