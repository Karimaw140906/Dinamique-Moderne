import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useSupabaseData, DEFAULT_DESTINATIONS } from "@/lib/useSupabaseData";
import { useSiteSection } from "@/lib/useSiteSection";
import { OfferCard } from "@/components/shared/OfferCard";

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
                <OfferCard
                  key={d.id}
                  href={`/destinations/${d.id}`}
                  image={d.photo}
                  emoji="📍"
                  title={d.name}
                  category={d.region}
                  rating={d.rating || 5}
                />
              );
          })}
        </div>
        {destinations.length > 6 && (
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
