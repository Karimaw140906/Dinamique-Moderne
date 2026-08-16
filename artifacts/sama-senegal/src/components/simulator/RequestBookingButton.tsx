import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useSimulator } from "@/lib/simulator";
import { saveItinerary } from "@/lib/saveTrip";
import { useSupabaseData } from "@/lib/useSupabaseData";

export function RequestBookingButton() {
  const state = useSimulator();
  const { data: settingsRows } = useSupabaseData("site_settings", []);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const businessWhatsapp = (settingsRows.find((s: any) => s.key === "business_whatsapp") as any)?.value || "";

  const handleRequest = async () => {
    setSending(true);
    const result = await saveItinerary(state, { status: "requested" });
    setSending(false);
    setSent(!!result.ok);

    if (businessWhatsapp) {
      const lines = [
        `Bonjour, je souhaite réserver mon voyage Sama Senegal 🌴`,
        `👥 Voyageurs : ${state.adults} adulte${state.adults > 1 ? "s" : ""}${state.children > 0 ? ` + ${state.children} enfant${state.children > 1 ? "s" : ""}` : ""}`,
        `🚗 Véhicule personnel : ${state.hasOwnVehicle ? "Oui" : "Non"}`,
        state.startDate ? `📅 Départ : ${new Date(state.startDate).toLocaleDateString("fr-FR")}` : "",
        `📍 Destinations : ${state.destinations.map((d) => `${d.name} (${d.nights}n)`).join(", ")}`,
      ].filter(Boolean);
      const text = encodeURIComponent(lines.join("\n"));
      window.open(`https://wa.me/${businessWhatsapp.replace(/\D/g, "")}?text=${text}`, "_blank");
    }
  };

  if (sent) {
    return (
      <div className="w-full mt-6 py-3 bg-green-50 text-green-700 font-bold rounded-xl flex items-center justify-center gap-2">
        <CheckCircle2 className="w-5 h-5" /> Demande envoyée !
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleRequest}
        disabled={sending}
        className="w-full mt-6 py-3 bg-[#F5B942] hover:bg-[#c49015] text-white font-bold rounded-xl transition-colors disabled:opacity-60"
      >
        {sending ? "Envoi..." : "Demander une réservation"}
      </button>
      {!businessWhatsapp && (
        <p className="text-center text-xs text-gray-400 mt-2">
          Ton voyage est sauvegardé — configure le numéro WhatsApp de contact dans l'admin (Réglages) pour activer l'envoi direct.
        </p>
      )}
    </>
  );
}
