import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/context/BookingContext";
import { MapPin, Calendar } from "lucide-react";

function formatDate(iso: string) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return ""; }
}

export default function EventFiche() {
  const [, params] = useRoute("/evenements/:id");
  const { language } = useLanguage();
  const { convertPrice } = useCurrency();
  const { openBooking } = useBooking();
  const [ev, setEv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    supabase.from("events").select("*").eq("id", params.id).single()
      .then(({ data }) => { setEv(data); setLoading(false); });
  }, [params?.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!ev) return <div className="min-h-screen flex items-center justify-center">Événement introuvable.</div>;

  const desc = language === "EN" ? (ev.desc_en || ev.desc_fr) : language === "ES" ? (ev.desc_es || ev.desc_fr) : ev.desc_fr;

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {ev.photo && <img src={ev.photo} alt={ev.name} className="w-full h-72 object-cover" />}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h1 className="text-3xl font-serif font-bold text-[#1A1A2E]">{ev.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {ev.date_start && (
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#D4A017]" /> {formatDate(ev.date_start)}</div>
            )}
            {ev.location && (
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#D4A017]" /> {ev.location}</div>
            )}
          </div>
          <p className="text-gray-600">{desc}</p>
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <div className="text-sm text-gray-500">Tarif</div>
              <div className="text-2xl font-bold text-[#D4A017]">{ev.price ? convertPrice(ev.price) : "Gratuit"}</div>
            </div>
            <button onClick={() => openBooking(ev.name)}
              className="bg-[#1A1A2E] hover:bg-[#D4A017] text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Réserver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
