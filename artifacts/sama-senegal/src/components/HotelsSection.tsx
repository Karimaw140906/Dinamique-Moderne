import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/pages/Home";
import { useSupabaseData, DEFAULT_HOTELS } from "@/lib/useSupabaseData";
import { useSiteSection } from "@/lib/useSiteSection";

export function HotelsSection() {
  const sectionActive = useSiteSection("hotels");
  const { t, language } = useLanguage();
  const { convertPrice, symbol } = useCurrency();
  const { openBooking } = useBooking();
  const { data: hotels } = useSupabaseData(
    "hotels",
    DEFAULT_HOTELS,
    { column: "active", value: true }
  );
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (!sectionActive) return null;

  const displayed = showAll ? hotels : hotels.slice(0, 6);

  const waLink = (phone: string) => "https://wa.me/" + phone.replace(/\D/g, "");

  return (
    <section
      id="hotels"
      ref={ref}
      className={`py-20 px-4 bg-gray-50 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("hotels.title") || "Hotels"}
          </h2>
          <p className="text-gray-600 text-lg">
            {t("hotels.subtitle") || "Sejours exception au Senegal"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((h: any) => {
            const name = h.name || "";
            const desc = language === "en" ? h.desc_en : language === "es" ? h.desc_es : h.desc_fr || h.description || "";
            const priceNight = h.price_night ? convertPrice(h.price_night) + " " + symbol + " / nuit" : null;
            const rating = h.rating || 5;
            const amenities: string[] = h.amenities || [];
            return (
              <div key={h.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                <Link href={`/hotels/${h.id}`}>
                  {h.photo ? (
                    <div className="h-48 overflow-hidden cursor-pointer">
                      <img src={h.photo} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center cursor-pointer">
                      <span className="text-5xl">🏨</span>
                    </div>
                  )}
                </Link>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/hotels/${h.id}`}>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight hover:text-[#2C7A5C] cursor-pointer transition-colors">{name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm font-medium text-gray-700">{rating}</span>
                    </div>
                  </div>
                  {h.type && (
                    <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mb-2">{h.type}</span>
                  )}
                  {desc && <p className="text-gray-600 text-sm line-clamp-2 mb-3">{desc}</p>}
                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {amenities.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                      {amenities.length > 3 && <span className="text-xs text-gray-400">+{amenities.length - 3}</span>}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <div className="text-sm font-semibold text-green-700">{priceNight || "Prix sur demande"}</div>
                    <div className="flex gap-2">
                      {h.whatsapp && (
                        <a href={waLink(h.whatsapp)} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors">
                          WhatsApp
                        </a>
                      )}
                      <button onClick={() => openBooking(name)}
                        className="text-xs bg-[#2C7A5C] text-white px-3 py-1.5 rounded-lg hover:bg-[#1d5940] transition-colors">
                        Reserver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {hotels.length > 6 && (
          <div className="text-center mt-10">
            <button onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 border-2 border-[#2C7A5C] text-[#2C7A5C] rounded-xl font-semibold hover:bg-[#2C7A5C] hover:text-white transition-all duration-200">
              {showAll ? "Voir moins" : "Voir plus"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
