import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/context/BookingContext";
import { MapPin, Wifi, Waves, Wind, Coffee, Car, Star } from "lucide-react";

const getAmenityIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("wifi")) return <Wifi className="w-4 h-4" />;
  if (n.includes("piscine")) return <Waves className="w-4 h-4" />;
  if (n.includes("clim")) return <Wind className="w-4 h-4" />;
  if (n.includes("déjeuner")) return <Coffee className="w-4 h-4" />;
  if (n.includes("park")) return <Car className="w-4 h-4" />;
  return null;
};

export default function HotelFiche() {
  const [, params] = useRoute("/hotels/:id");
  const { language } = useLanguage();
  const { convertPrice } = useCurrency();
  const { openBooking } = useBooking();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    supabase.from("hotels").select("*").eq("id", params.id).single()
      .then(({ data }) => { setHotel(data); setLoading(false); });
  }, [params?.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!hotel) return <div className="min-h-screen flex items-center justify-center">Hôtel introuvable.</div>;

  const desc = language === "EN" ? (hotel.desc_en || hotel.desc_fr) : language === "ES" ? (hotel.desc_es || hotel.desc_fr) : hotel.desc_fr;

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {hotel.photo && <img src={hotel.photo} alt={hotel.name} className="w-full h-72 object-cover" />}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-serif font-bold text-[#1A1A2E]">{hotel.name}</h1>
            <span className="text-yellow-500">{"⭐".repeat(hotel.rating || 5)}</span>
          </div>
          <div className="text-xs font-bold text-[#2C7A5C]">{hotel.type}</div>
          <p className="text-gray-600">{desc}</p>
          {hotel.address && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-[#D4A017]" /> {hotel.address}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(hotel.amenities || []).map((a: string) => (
              <div key={a} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-md border text-gray-600">
                {getAmenityIcon(a)} {a}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <div className="text-sm text-gray-500">Par nuit</div>
              <div className="text-2xl font-bold text-[#D4A017]">{convertPrice(hotel.price_night)}</div>
            </div>
            <button onClick={() => openBooking(hotel.name)}
              className="bg-[#1A1A2E] hover:bg-[#D4A017] text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Réserver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
