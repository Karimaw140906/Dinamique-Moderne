import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/context/BookingContext";
import { useSupabaseData, DEFAULT_RESTAURANTS } from "@/lib/useSupabaseData";
import { useSiteSection } from "@/lib/useSiteSection";
import { OfferCard } from "@/components/shared/OfferCard";

export function RestaurantsSection() {
  const sectionActive = useSiteSection("restaurants");
  const { t, language } = useLanguage();
  const { convertPrice } = useCurrency();
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

  const waLink = (phone: string) => "https://wa.me/" + phone.replace(/\D/g, "");

  return (
    <section
      id="restaurants"
      ref={ref}
      className={`py-20 px-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("restaurants_title") || "Restaurants"}
          </h2>
          <p className="text-gray-600 text-lg">
            {t("restaurants_subtitle") || "Saveurs authentiques du Senegal"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((r: any) => {
            const name = r.name || "";
            const desc = language === "EN" ? r.desc_en : language === "ES" ? r.desc_es : r.desc_fr || r.description || "";
            const rating = r.rating || 5;
            return (
                <OfferCard
                  key={r.id}
                  href={`/restaurants/${r.id}`}
                  image={r.photo}
                  emoji="🍽️"
                  title={name}
                  category={r.cuisine}
                  city={r.address}
                  rating={rating}
                  whatsapp={r.whatsapp}
                  onBook={() => openBooking(name)}
                />
              );
          })}
        </div>
        {restaurants.length > 6 && (
          <div className="text-center mt-10">
            <button onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 border-2 border-amber-600 text-amber-600 rounded-xl font-semibold hover:bg-amber-600 hover:text-white transition-all duration-200">
              {showAll ? "Voir moins" : "Voir plus"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
