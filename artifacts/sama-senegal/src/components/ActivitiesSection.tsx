import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/context/BookingContext";
import { Clock, Users, MapPin } from "lucide-react";
import { useSupabaseData, DEFAULT_ACTIVITIES } from "@/lib/useSupabaseData";
import { OfferCard } from "@/components/shared/OfferCard";

export function ActivitiesSection() {
  const { t, language } = useLanguage();
  const { convertPrice } = useCurrency();
  const { openBooking } = useBooking();
  const { data: activities } = useSupabaseData("activities", DEFAULT_ACTIVITIES, { column: "active", value: true });
  const [filter, setFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (activities.length === 0) return null;

  const categories = ["All", ...Array.from(new Set(activities.map((a: any) => a.category)))];
  const filtered = filter === "All" ? activities : activities.filter((a: any) => a.category === filter);
  const displayed = showAll ? filtered : filtered.slice(0, 3);

  return (
    <section id="activites" className="py-24 bg-white text-[#0B0A14]" ref={ref}>
      <div className={`container mx-auto px-4 md:px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#6C3EF5] uppercase tracking-widest">{t("category_activities")}</span>
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold mt-2 mb-4">{t("activities_title")}</h2>
          <div className="w-24 h-1 bg-[#6C3EF5] mx-auto rounded-full"></div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((c: any) => (
            <button key={c} onClick={() => { setFilter(c); setShowAll(false); }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${filter === c ? "bg-[#0B0A14] text-white border-[#0B0A14]" : "bg-transparent text-gray-600 border-gray-300 hover:border-gray-500"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayed.map((a: any) => {
            const name = language === "EN" ? (a.name_en || a.nameEN) : language === "ES" ? (a.name_es || a.nameES) : (a.name_fr || a.nameFR);
            const desc = language === "EN" ? (a.desc_en || a.descEN) : language === "ES" ? (a.desc_es || a.descES) : (a.desc_fr || a.descFR);
            return (
                <OfferCard
                  key={a.id}
                  href={`/activites/${a.id}`}
                  image={a.photo}
                  emoji="🎯"
                  title={name}
                  category={a.category}
                  city={a.location}
                  price={a.price || undefined}
                  priceUnit="pers"
                  onBook={() => openBooking(name)}
                />
              );
          })}
        </div>
        {filtered.length > 3 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="bg-[#0B0A14] hover:bg-[#6C3EF5] text-white px-8 py-3 rounded-xl font-bold transition-colors">
              {showAll ? (t("see_less") || "Voir moins ▲") : (t("see_more") || `Voir plus (${filtered.length - 3}) ▼`)}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
