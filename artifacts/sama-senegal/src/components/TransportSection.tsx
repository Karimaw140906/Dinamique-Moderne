import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/context/BookingContext";
import { Users, Snowflake, CheckCircle2 } from "lucide-react";
import { useSupabaseData, DEFAULT_TRANSPORT } from "@/lib/useSupabaseData";
import { OfferCard } from "@/components/shared/OfferCard";

export function TransportSection() {
  const { t, language } = useLanguage();
  const { convertPrice } = useCurrency();
  const { openBooking } = useBooking();
  const { data: vehicles } = useSupabaseData("transport", DEFAULT_TRANSPORT, { column: "active", value: true });
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (vehicles.length === 0) return null;

  const displayed = showAll ? vehicles : vehicles.slice(0, 3);

  return (
    <section id="transport" className="py-24 bg-white text-[#1A1A2E]" ref={ref}>
      <div className={`container mx-auto px-4 md:px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#2C7A5C] uppercase tracking-widest">{t("category_transport")}</span>
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold mt-2 mb-4">{t("transport_title")}</h2>
          <div className="w-24 h-1 bg-[#2C7A5C] mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayed.map((v: any) => {
            const desc = language === "EN" ? (v.desc_en || v.descEN) : language === "ES" ? (v.desc_es || v.descES) : (v.desc_fr || v.descFR);
            return (
                <OfferCard
                  key={v.id}
                  href={`/transport/${v.id}`}
                  image={v.photo}
                  emoji="🚗"
                  title={v.name}
                  category={v.category}
                  price={v.price_day || v.priceDay || undefined}
                  priceUnit="jour"
                  whatsapp={v.whatsapp}
                  onBook={() => openBooking(v.name)}
                />
              );
          })}
        </div>
        {vehicles.length > 3 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="bg-[#2C7A5C] hover:bg-[#1A1A2E] text-white px-8 py-3 rounded-xl font-bold transition-colors">
              {showAll ? (t("see_less") || "Voir moins ▲") : (t("see_more") || `Voir plus (${vehicles.length - 3}) ▼`)}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
