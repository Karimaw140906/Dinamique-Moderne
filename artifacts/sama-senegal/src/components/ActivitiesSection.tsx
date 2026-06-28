import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/pages/Home";
import { Clock, Users, MapPin } from "lucide-react";
import { useSupabaseData, DEFAULT_ACTIVITIES } from "@/lib/useSupabaseData";

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
    <section id="activites" className="py-24 bg-white text-[#1A1A2E]" ref={ref}>
      <div className={`container mx-auto px-4 md:px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#2C7A5C] uppercase tracking-widest">{t("category_activities")}</span>
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold mt-2 mb-4">{t("activities_title")}</h2>
          <div className="w-24 h-1 bg-[#2C7A5C] mx-auto rounded-full"></div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((c: any) => (
            <button key={c} onClick={() => { setFilter(c); setShowAll(false); }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${filter === c ? "bg-[#1A1A2E] text-white border-[#1A1A2E]" : "bg-transparent text-gray-600 border-gray-300 hover:border-gray-500"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayed.map((a: any) => {
            const name = language === "EN" ? (a.name_en || a.nameEN) : language === "ES" ? (a.name_es || a.nameES) : (a.name_fr || a.nameFR);
            const desc = language === "EN" ? (a.desc_en || a.descEN) : language === "ES" ? (a.desc_es || a.descES) : (a.desc_fr || a.descFR);
            return (
              <div key={a.id} className="bg-[#F5F0E8] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 [transition-timing-function:var(--ease-premium)] flex flex-col zoom-on-hover">
                {a.photo ? <img src={a.photo} alt={name} loading="lazy" className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-5xl">🎯</div>}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-[#1A1A2E]">{name}</h3>
                    <span className="bg-[#D4A017] text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2">{a.category}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">{desc}</p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-gray-200">
                      <Clock className="w-4 h-4 text-[#2C7A5C]" /><span>{a.duration} {t("activities_duration")}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-gray-200">
                      <Users className="w-4 h-4 text-[#2C7A5C]" /><span>Min {a.min_participants || a.minParticipants} {t("activities_min_participants")}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-gray-200 col-span-2">
                      <MapPin className="w-4 h-4 text-[#2C7A5C]" /><span>{a.location}</span>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-xl font-bold text-[#2C7A5C]">{convertPrice(a.price)}</div>
                    <button
                      onClick={() => openBooking(name)}
                      className="bg-[#1A1A2E] hover:bg-[#D4A017] text-white px-6 py-2 rounded-xl font-bold transition-colors">
                      {t("activities_book")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length > 3 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="bg-[#1A1A2E] hover:bg-[#2C7A5C] text-white px-8 py-3 rounded-xl font-bold transition-colors">
              {showAll ? (t("see_less") || "Voir moins ▲") : (t("see_more") || `Voir plus (${filtered.length - 3}) ▼`)}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
