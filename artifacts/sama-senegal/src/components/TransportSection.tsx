import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/context/BookingContext";
import { Users, Snowflake, CheckCircle2 } from "lucide-react";
import { useSupabaseData, DEFAULT_TRANSPORT } from "@/lib/useSupabaseData";

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
              <div key={v.id} className="bg-[#F5F0E8] rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 [transition-timing-function:var(--ease-premium)] flex flex-col zoom-on-hover">
                <Link href={`/transport/${v.id}`}>
                  {v.photo ? <img src={v.photo} alt={v.name} loading="lazy" className="w-full h-48 object-cover cursor-pointer" /> : <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-5xl cursor-pointer">🚗</div>}
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/transport/${v.id}`}>
                      <h3 className="text-xl font-bold text-[#1A1A2E] hover:text-[#2C7A5C] cursor-pointer transition-colors">{v.name}</h3>
                    </Link>
                    <span className="bg-[#2C7A5C] text-white text-xs font-bold px-2 py-1 rounded-full">{v.category}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{desc}</p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-1 text-sm bg-white px-2 py-1 rounded border border-gray-200">
                      <Users className="w-4 h-4 text-gray-500" /> {v.seats} {t("transport_seats")}
                    </div>
                    {v.aircon && (
                      <div className="flex items-center gap-1 text-sm bg-white px-2 py-1 rounded border border-gray-200">
                        <Snowflake className="w-4 h-4 text-blue-500" /> {t("transport_aircon")}
                      </div>
                    )}
                    {(v.driver_included || v.driverIncluded) && (
                      <div className="flex items-center gap-1 text-sm bg-green-50 px-2 py-1 rounded border border-green-200 text-green-700">
                        <CheckCircle2 className="w-4 h-4" /> {t("transport_driver")}
                      </div>
                    )}
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <div className="text-sm text-gray-500">{t("transport_per_day")}</div>
                        <div className="text-2xl font-bold text-[#D4A017]">{convertPrice(v.price_day || v.priceDay)}</div>
                        <div className="text-xs text-gray-400">{(v.price_day || v.priceDay || 0).toLocaleString()} FCFA</div>
                      </div>
                      {(v.price_half || v.priceHalf) > 0 && (
                        <div className="text-right">
                          <div className="text-xs text-gray-400">{t("transport_per_half")}</div>
                          <div className="text-sm font-bold text-gray-600">{convertPrice(v.price_half || v.priceHalf)}</div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => openBooking(v.name)}
                      className="w-full bg-[#1A1A2E] hover:bg-[#2C7A5C] text-white py-3 rounded-xl font-bold transition-colors">
                      {t("transport_book")}
                    </button>
                  </div>
                </div>
              </div>
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
