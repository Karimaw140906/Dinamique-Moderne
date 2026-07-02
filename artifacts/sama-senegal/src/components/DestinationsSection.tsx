import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useSupabaseData, DEFAULT_DESTINATIONS } from "@/lib/useSupabaseData";
import { useSiteSection } from "@/lib/useSiteSection";

export function DestinationsSection() {
  const sectionActive = useSiteSection("destinations");
  const { t, language } = useLanguage();
  const { data: destinations } = useSupabaseData(
    "destinations",
    DEFAULT_DESTINATIONS,
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

  const displayed = showAll ? destinations : destinations.slice(0, 6);

  return (
    <section
      id="destinations"
      ref={ref}
      className={`py-20 px-4 bg-white transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("destinations.title") || "Destinations"}
          </h2>
          <p className="text-gray-600 text-lg">
            {t("destinations.subtitle") || "Les lieux incontournables du Sénégal"}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((d: any) => {
            const desc = language === "EN" ? d.desc_en : language === "ES" ? d.desc_es : d.desc_fr || "";
            const highlights: string[] = d.highlights || [];
            return (
              <div key={d.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group border border-gray-100">
                <Link href={`/destinations/${d.id}`}>
                  {d.photo ? (
                    <div className="h-48 overflow-hidden cursor-pointer">
                      <img src={d.photo} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center cursor-pointer">
                      <span className="text-5xl">📍</span>
                    </div>
                  )}
                </Link>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/destinations/${d.id}`}>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight hover:text-[#2C7A5C] cursor-pointer transition-colors">{d.name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm font-medium text-gray-700">{d.rating || 5}</span>
                    </div>
                  </div>
                  {d.region && (
                    <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full mb-2">{d.region}</span>
                  )}
                  {desc && <p className="text-gray-600 text-sm line-clamp-2 mb-3">{desc}</p>}
                  {highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {highlights.slice(0, 3).map((h, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {destinations.length > 6 && (
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
