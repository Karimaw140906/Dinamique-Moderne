import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { MapPin, Wifi, Waves, Wind, Coffee, Car } from "lucide-react";
import { useSupabaseData, DEFAULT_HOTELS } from "@/lib/useSupabaseData";
import { useBooking } from "@/pages/Home";

const getAmenityIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("wifi")) return <Wifi className="w-4 h-4" />;
  if (n.includes("piscine") || n.includes("mer")) return <Waves className="w-4 h-4" />;
  if (n.includes("clim")) return <Wind className="w-4 h-4" />;
  if (n.includes("déjeuner")) return <Coffee className="w-4 h-4" />;
  if (n.includes("park")) return <Car className="w-4 h-4" />;
  return null;
};

export function HotelsSection() {
  const { t, language } = useLanguage();
  const { convertPrice } = useCurrency();
  const { openBooking } = useBooking();
  const { data: hotels } = useSupabaseData("hotels", DEFAULT_HOTELS, { column: "active", value: true });
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (hotels.length === 0) return null;

  const displayed = showAll ? hotels : hotels.slice(0, 3);

  return (
    <section id="hebergements" className="py-24 bg-[#F5F0E8] text-[#1A1A2E]" ref={ref}>
      <div className={`container mx-auto px-4 md:px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#2C7A5C] uppercase tracking-widest">{t("category_hotels")}</span>
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold mt-2 mb-4">{t("hotels_title")}</h2>
          <div className="w-24 h-1 bg-[#2C7A5C] mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayed.map((h: any) => {
            const desc = language === "EN" ? (h.desc_en || h.descEN) : language === "ES" ? (h.desc_es || h.descES) : (h.desc_fr || h.descFR);
            return (
              <div key={h.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 [transition-timing-function:var(--ease-premium)] flex flex-col border border-gray-100 zoom-on-hover">
                {h.photo ? <img src={h.photo} alt={h.name} loading="lazy" className="w-full h-56 object-cover" /> : <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-5xl">🏨</div>}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-[#1A1A2E]">{h.name}</h3>
                    <span className="text-yellow-500 text-sm whitespace-nowrap">{"⭐".repeat(h.rating || 5)}</span>
                  </div>
                  <div className="text-xs font-bold text-[#2C7A5C] mb-3">{h.type}</div>
                  <p className="text-gray-600 text-sm mb-4">{desc}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(h.amenities || []).map((a: string) => (
                      <div key={a} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-md border border-gray-100 text-gray-600">
                        {getAmenityIcon(a)} <span>{a}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500"><MapPin className="w-4 h-4 text-[#D4A017]" />{h.address}</div>
                      <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{h.rooms} {t("hotels_rooms")}</div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-500">{t("hotels_per_night")}</div>
                      <div className="text-2xl font-bold text-[#D4A017]">{convertPrice(h.price_night || h.priceNight)}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => openBooking(h.name)} className="w-full bg-[#1A1A2E] hover:bg-[#2C7A5C] text-white py-3 rounded-xl font-bold transition-colors">
                        {t("hotels_book") || "Réserver"}
                      </button>
                      {(h.booking_link || h.bookingLink) && (
                        <a href={h.booking_link || h.bookingLink} target="_blank" rel="noreferrer"
                          className="w-full border border-[#1A1A2E] text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white py-3 rounded-xl font-bold flex justify-center transition-colors text-center text-sm">
                          {t("hotels_external") || "Voir sur Booking"}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {hotels.length > 3 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="bg-[#1A1A2E] hover:bg-[#2C7A5C] text-white px-8 py-3 rounded-xl font-bold transition-colors">
              {showAll ? (t("see_less") || "Voir moins ▲") : (t("see_more") || `Voir plus (${hotels.length - 3}) ▼`)}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
