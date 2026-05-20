import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { Clock, Users, MapPin } from "lucide-react";

export function ActivitiesSection() {
  const { t, language } = useLanguage();
  const [activities, setActivities] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const loadActivities = () => {
    const saved = localStorage.getItem("activitiesData");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setActivities(parsed.filter((a: any) => a.active));
      } catch { }
    }
  };

  useEffect(() => {
    loadActivities();
    window.addEventListener("activitiesDataUpdated", loadActivities);
    return () => window.removeEventListener("activitiesDataUpdated", loadActivities);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (activities.length === 0) return null;

  const categories = ["All", ...Array.from(new Set(activities.map(a => a.category)))];
  const filtered = filter === "All" ? activities : activities.filter(a => a.category === filter);

  return (
    <section id="activites" className="py-24 bg-white text-[#1A1A2E]" ref={ref}>
      <div className={`container mx-auto px-4 md:px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">{t("activities_title")}</h2>
          <div className="w-24 h-1 bg-[#2C7A5C] mx-auto"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${filter === c ? "bg-[#1A1A2E] text-white border-[#1A1A2E]" : "bg-transparent text-gray-600 border-gray-300 hover:border-gray-500"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((a) => {
            const name = language === "EN" ? a.nameEN : language === "ES" ? a.nameES : a.nameFR;
            const desc = language === "EN" ? a.descEN : language === "ES" ? a.descES : a.descFR;
            return (
              <div key={a.id} className="bg-[#F5F0E8] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all flex flex-col">
                {a.photo ? (
                  <img src={a.photo} alt={name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-5xl">🎯</div>
                )}
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-[#1A1A2E]">{name}</h3>
                    <span className="bg-[#D4A017] text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2">{a.category}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6">{desc}</p>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-gray-200">
                      <Clock className="w-4 h-4 text-[#2C7A5C]" /> <span>{a.duration} {t("activities_duration")}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-gray-200">
                      <Users className="w-4 h-4 text-[#2C7A5C]" /> <span>Min {a.minParticipants} {t("activities_min_participants")}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-gray-200 col-span-2">
                      <MapPin className="w-4 h-4 text-[#2C7A5C]" /> <span>{a.location}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-xl font-bold text-[#2C7A5C]">{a.price.toLocaleString()} FCFA</div>
                    <button 
                      onClick={() => {
                        const select = document.querySelector('select[name="tour"]');
                        if (select) (select as HTMLSelectElement).value = name;
                        document.querySelector("#reserver")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="bg-[#1A1A2E] hover:bg-[#D4A017] text-white px-6 py-2 rounded-xl font-bold transition-colors"
                    >
                      {t("activities_book")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
