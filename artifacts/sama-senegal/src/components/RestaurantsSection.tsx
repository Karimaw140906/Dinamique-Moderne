import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { MapPin, Clock, MessageCircle } from "lucide-react";
import { useSupabaseData, DEFAULT_RESTAURANTS } from "@/lib/useSupabaseData";

export function RestaurantsSection() {
  const { t, language } = useLanguage();
  const { data: restaurants } = useSupabaseData("restaurants", DEFAULT_RESTAURANTS, { column: "active", value: true });
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (restaurants.length === 0) return null;

  return (
    <section id="restaurants" className="py-24 bg-[#1A1A2E] text-white" ref={ref}>
      <div className={`container mx-auto px-4 md:px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">{t("restaurants_title")}</h2>
          <div className="w-24 h-1 bg-[#D4A017] mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((r: any) => {
            const desc = language === "EN" ? (r.desc_en || r.descEN) : language === "ES" ? (r.desc_es || r.descES) : (r.desc_fr || r.descFR);
            return (
              <div key={r.id} className="bg-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all border border-white/5 flex flex-col">
                {r.photo ? <img src={r.photo} alt={r.name} className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-white/5 flex items-center justify-center text-5xl">🍽️</div>}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{r.name}</h3>
                    <span className="text-[#D4A017] bg-[#D4A017]/20 text-xs font-bold px-2 py-1 rounded-full">{r.price_range || r.priceRange}</span>
                  </div>
                  <div className="text-yellow-500 text-sm mb-3">{"⭐".repeat(r.rating || 5)}</div>
                  <div className="text-xs text-[#2C7A5C] bg-[#2C7A5C]/20 inline-block px-2 py-1 rounded mb-3">{r.cuisine}</div>
                  <p className="text-white/70 text-sm mb-6">{desc}</p>
                  <div className="space-y-2 text-sm text-white/60 mb-6 mt-auto">
                    {r.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#D4A017]" /><span>{r.address}</span></div>}
                    {r.hours && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#D4A017]" /><span>{r.hours}</span></div>}
                  </div>
                  <a href={`https://wa.me/${(r.whatsapp || "").replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors">
                    <MessageCircle className="w-5 h-5" /> {t("restaurants_contact")}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
