import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/context/BookingContext";
import { useSupabaseData, DEFAULT_HOTELS } from "@/lib/useSupabaseData";
import { useSiteSection } from "@/lib/useSiteSection";
import { OfferCard } from "@/components/shared/OfferCard";

export function HotelsSection() {
  const sectionActive = useSiteSection("hotels");
  const { t, language } = useLanguage();
  const { convertPrice } = useCurrency();
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
            const desc = language === "EN" ? h.desc_en : language === "ES" ? h.desc_es : h.desc_fr || h.description || "";
            const priceNight = h.price_night ? convertPrice(h.price_night) + " / nuit" : null;
            const rating = h.rating || 5;
            const amenities: string[] = h.amenities || [];
            return (
                <OfferCard
                  key={h.id}
                  href={`/hotels/${h.id}`}
                  image={h.photo}
                  emoji="🏨"
                  title={name}
                  category={h.type}
                  city={h.address}
                  rating={rating}
                  price={h.price_night || undefined}
                  priceUnit="nuit"
                  whatsapp={h.whatsapp}
                  onBook={() => openBooking(name)}
                />
              );
          })}
        </div>
        {hotels.length > 6 && (
          <div className="text-center mt-10">
            <button onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 border-2 border-[#6C3EF5] text-[#6C3EF5] rounded-xl font-semibold hover:bg-[#6C3EF5] hover:text-white transition-all duration-200">
              {showAll ? "Voir moins" : "Voir plus"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
