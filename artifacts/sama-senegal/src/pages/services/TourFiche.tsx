import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/context/BookingContext";
import { MapPin, Clock, Users } from "lucide-react";

export default function TourFiche() {
  const [, params] = useRoute("/tours/:id");
  const { language } = useLanguage();
  const { convertPrice } = useCurrency();
  const { openBooking } = useBooking();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    supabase.from("tours").select("*").eq("id", params.id).single()
      .then(({ data }) => { setItem(data); setLoading(false); });
  }, [params?.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center">Tour introuvable.</div>;

  const name = language === "EN" ? (item.name_en || item.name || item.name_fr) : language === "ES" ? (item.name_es || item.name || item.name_fr) : (item.name_fr || item.name);
  const desc = language === "EN" ? (item.desc_en || item.desc_fr || item.desc) : language === "ES" ? (item.desc_es || item.desc_fr || item.desc) : (item.desc_fr || item.desc);

  return (
    <div className="min-h-screen bg-[#2B1B4D]">
      {item.photo && <img src={item.photo} alt={name} className="w-full h-56 sm:h-72 md:h-96 lg:h-[30rem] object-cover" />}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h1 className="text-3xl font-serif font-bold text-[#0B0A14]">{name}</h1>
          {item.category && <div className="text-xs font-bold text-[#6C3EF5] uppercase tracking-wide">{item.category}</div>}
          {desc && <p className="text-gray-600">{desc}</p>}
          <div className="grid grid-cols-2 gap-3">
            {item.duration && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <Clock className="w-4 h-4 text-[#F5B942]" />
                <span>{item.duration}</span>
              </div>
            )}
            {item.min_participants && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <Users className="w-4 h-4 text-[#F5B942]" />
                <span>Min. {item.min_participants} pers.</span>
              </div>
            )}
            {item.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <MapPin className="w-4 h-4 text-[#F5B942]" />
                <span>{item.location}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <div className="text-sm text-gray-500">Par personne</div>
              <div className="text-2xl font-bold text-[#F5B942]">{convertPrice(item.price)}</div>
            </div>
            <button onClick={() => openBooking(name)}
              className="bg-[#0B0A14] hover:bg-[#F5B942] text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Réserver ce tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
