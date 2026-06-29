import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/pages/Home";
import { Users, Wind, User } from "lucide-react";

export default function TransportFiche() {
  const [, params] = useRoute("/transport/:id");
  const { language } = useLanguage();
  const { convertPrice } = useCurrency();
  const { openBooking } = useBooking();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    supabase.from("transport").select("*").eq("id", params.id).single()
      .then(({ data }) => { setItem(data); setLoading(false); });
  }, [params?.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center">Véhicule introuvable.</div>;

  const desc = language === "EN" ? (item.desc_en || item.desc_fr) : language === "ES" ? (item.desc_es || item.desc_fr) : item.desc_fr;

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {item.photo && <img src={item.photo} alt={item.name} className="w-full h-72 object-cover" />}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-serif font-bold text-[#1A1A2E]">{item.name}</h1>
          </div>
          {item.category && <div className="text-xs font-bold text-[#2C7A5C] uppercase tracking-wide">{item.category}</div>}
          {desc && <p className="text-gray-600">{desc}</p>}
          <div className="grid grid-cols-2 gap-3">
            {item.seats && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <Users className="w-4 h-4 text-[#D4A017]" />
                <span>{item.seats} places</span>
              </div>
            )}
            {item.aircon && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <Wind className="w-4 h-4 text-[#D4A017]" />
                <span>Climatisé</span>
              </div>
            )}
            {item.driver_included && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <User className="w-4 h-4 text-[#D4A017]" />
                <span>Chauffeur inclus</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {item.price_day && (
              <div className="bg-[#F5F0E8] rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Prix / jour</div>
                <div className="text-xl font-bold text-[#D4A017]">{convertPrice(item.price_day)}</div>
              </div>
            )}
            {item.price_half && (
              <div className="bg-[#F5F0E8] rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Demi-journée</div>
                <div className="text-xl font-bold text-[#2C7A5C]">{convertPrice(item.price_half)}</div>
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={() => openBooking(item.name)}
              className="bg-[#1A1A2E] hover:bg-[#D4A017] text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Réserver ce véhicule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
