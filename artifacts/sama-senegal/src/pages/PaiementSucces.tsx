import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkPaytechStatus } from "@/lib/usePaytech";

export default function PaiementSucces() {
  const [status, setStatus] = useState<"loading" | "success" | "pending">("loading");
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  const token = params.get("token");

  useEffect(() => {
    const verify = async () => {
      if (!ref) { setStatus("pending"); return; }

      if (token) {
        const result = await checkPaytechStatus(token);
        if (result === "completed") {
          await supabase.from("payments")
            .update({ status: "completed", paid_at: new Date().toISOString() })
            .eq("booking_ref", ref);
          await supabase.from("bookings")
            .update({ status: "confirmed", paid: true })
            .eq("ref", ref);
          setStatus("success");
          return;
        }
      }

      await supabase.from("payments")
        .update({ status: "completed", paid_at: new Date().toISOString() })
        .eq("booking_ref", ref);
      await supabase.from("bookings")
        .update({ status: "confirmed", paid: true })
        .eq("ref", ref);
      setStatus("success");
    };

    verify();
  }, [ref, token]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-2xl">⏳</span>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E]">Vérification en cours...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">Paiement confirmé !</h2>
            <p className="text-gray-500 text-sm mb-2">Réf : <span className="font-mono font-bold text-[#2C7A5C]">{ref}</span></p>
            <p className="text-gray-400 text-xs mb-6">Votre réservation est confirmée. Vous recevrez une confirmation par WhatsApp.</p>
            <a href="/" className="block w-full py-3 bg-[#2C7A5C] text-white rounded-xl font-bold hover:bg-[#235f47] transition">
              Retour à l'accueil
            </a>
          </>
        )}
        {status === "pending" && (
          <>
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⏱️</span>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">Paiement en attente</h2>
            <p className="text-gray-400 text-xs mb-6">Votre paiement est en cours de traitement. Notre équipe vous contactera sous 24h.</p>
            <a href="/" className="block w-full py-3 bg-[#1A1A2E] text-white rounded-xl font-bold hover:bg-[#2C7A5C] transition">
              Retour à l'accueil
            </a>
          </>
        )}
      </div>
    </div>
  );
}
