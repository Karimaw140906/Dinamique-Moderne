import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { useBooking } from "@/pages/Home";
import { MapPin, Clock, Phone } from "lucide-react";

export default function RestaurantFiche() {
  const [, params] = useRoute("/restaurants/:id");
  const { language } = useLanguage();
  const { openBooking } = useBooking();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    supabase.from("restaurants").select("*").eq("id", params.id).single()
      .then(({ data }) => { setItem(data); setLoading(false); });
  }, [params?.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center">Restaurant introuvable.</div>;

  const desc = language === "EN" ? (item.desc_en || item.desc_fr) : language === "ES" ? (item.desc_es || item.desc_fr) : item.desc_fr;

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {item.photo && <img src={item.photo} alt={item.name} className="w-full h-72 object-cover" />}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-serif font-bold text-[#1A1A2E]">{item.name}</h1>
            {item.rating && <span className="text-yellow-500">{"⭐".repeat(item.rating)}</span>}
          </div>
          {item.cuisine && <div className="text-xs font-bold text-[#2C7A5C] uppercase tracking-wide">{item.cuisine}</div>}
          {desc && <p className="text-gray-600">{desc}</p>}
          {item.address && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-[#D4A017]" /> {item.address}
            </div>
          )}
          {item.hours && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-[#D4A017]" /> {item.hours}
            </div>
          )}
          {item.whatsapp && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone className="w-4 h-4 text-[#D4A017]" /> {item.whatsapp}
            </div>
          )}
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              {item.price_range && (
                <>
                  <div className="text-sm text-gray-500">Gamme de prix</div>
                  <div className="text-xl font-bold text-[#D4A017]">{item.price_range}</div>
                </>
              )}
            </div>
            <button onClick={() => openBooking(item.name)}
              className="bg-[#1A1A2E] hover:bg-[#D4A017] text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Réserver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
