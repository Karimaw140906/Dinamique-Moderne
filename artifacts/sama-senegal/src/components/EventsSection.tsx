import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/context/BookingContext";
import { useSupabaseData, DEFAULT_EVENTS } from "@/lib/useSupabaseData";
import { useSiteSection } from "@/lib/useSiteSection";
import { OfferCard } from "@/components/shared/OfferCard";

function formatDate(iso: string) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return ""; }
}

export function EventsSection() {
  const sectionActive = useSiteSection("events");
  const { t, language } = useLanguage();
  const { convertPrice } = useCurrency();
  const { openBooking } = useBooking();
  const { data: events } = useSupabaseData(
    "events",
    DEFAULT_EVENTS,
    { column: "active", value: true }
  );
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (!sectionActive) return null;

  const waLink = (phone: string) => "https://wa.me/" + phone.replace(/\D/g, "");

  return (
    <section
      id="events"
      ref={ref}
      className={`py-20 px-4 bg-gray-50 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("events_title") || "Événements"}
          </h2>
          <p className="text-gray-600 text-lg">
            {t("events_subtitle") || "Festivals, mariages et galas"}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev: any) => {
            const desc = language === "EN" ? ev.desc_en : language === "ES" ? ev.desc_es : ev.desc_fr || "";
            return (
                <OfferCard
                  key={ev.id}
                  href={`/evenements/${ev.id}`}
                  image={ev.photo}
                  emoji="🎉"
                  title={ev.name}
                  category={ev.date_start ? formatDate(ev.date_start) : ev.location}
                  city={ev.location}
                  price={ev.price || undefined}
                  whatsapp={ev.whatsapp}
                  onBook={() => openBooking(ev.name)}
                />
              );
          })}
        </div>
      </div>
    </section>
  );
}
