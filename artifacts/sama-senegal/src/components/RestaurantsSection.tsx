import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/pages/Home";
import { useSupabaseData, DEFAULT_RESTAURANTS } from "@/lib/useSupabaseData";
import { useSiteSection } from "@/lib/useSiteSection";

export function RestaurantsSection() {
  const sectionActive = useSiteSection("restaurants");
  const { t, language } = useLanguage();
  const { convertPrice, symbol } = useCurrency();
  const { openBooking } = useBooking();
  const { data: restaurants } = useSupabaseData(
    "restaurants",
    DEFAULT_RESTAURANTS,
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

  const displayed = showAll ? restaurants : restaurants.slice(0, 6);

  const waLink = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return "https://wa.me/" + digits;
  };

  return (
    <section
      id="restaurants"
      ref={ref}
      className={`py-20 px-4 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("restaurants.title") || "Restaurants"}
          </h2>
          <p className="text-gray-600 text-lg">
            {t("restaurants.subtitle") || "Saveurs authentiques du Senegal"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((r: any) => {
            const name = r.name || "";
            const desc =
              language === "en" ? r.desc_en :
              language === "es" ? r.desc_es :
              r.desc_fr || r.description || "";
            const rating = r.rating || 5;

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
              >
                {r.photo ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={r.photo}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
                    <span className="text-5xl">restaurant</span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{name}</h3>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className="text-yellow-400">*</span>
                      <span className="text-sm font-medium text-gray-700">{rating}</span>
                    </div>
                  </div>

                  {r.cuisine && (
                    <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full mb-2">
                      {r.cuisine}
                    </span>
                  )}

                  {desc && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{desc}</p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      {r.price_range && <span>{r.price_range}</span>}
                      {r.hours && <span className="ml-2 text-xs">- {r.hours}</span>}
                    </div>
                    <div className="flex gap-2">
                      {r.whatsapp && (
                        
                          href={waLink(r.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          WhatsApp
                        </a>
                      )}
                      <button
                        onClick={() => openBooking(name)}
                        className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Reserver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {restaurants.length > 6 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 border-2 border-amber-600 text-amber-600 rounded-xl font-semibold hover:bg-amber-600 hover:text-white transition-all duration-200"
            >
              {showAll ? "Voir moins" : "Voir plus"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
