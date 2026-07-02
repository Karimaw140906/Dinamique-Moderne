import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useBooking } from "@/context/BookingContext";
import { useSupabaseData, DEFAULT_EVENTS } from "@/lib/useSupabaseData";
import { useSiteSection } from "@/lib/useSiteSection";

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
            {t("events.title") || "Événements"}
          </h2>
          <p className="text-gray-600 text-lg">
            {t("events.subtitle") || "Festivals, mariages et galas"}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev: any) => {
            const desc = language === "EN" ? ev.desc_en : language === "ES" ? ev.desc_es : ev.desc_fr || "";
            return (
              <div key={ev.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                <Link href={`/evenements/${ev.id}`}>
                  {ev.photo ? (
                    <div className="h-48 overflow-hidden cursor-pointer">
                      <img src={ev.photo} alt={ev.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-[#1A1A2E]/10 to-[#D4A017]/10 flex items-center justify-center cursor-pointer">
                      <span className="text-5xl">🎉</span>
                    </div>
                  )}
                </Link>
                <div className="p-5">
                  <Link href={`/evenements/${ev.id}`}>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight hover:text-[#2C7A5C] cursor-pointer transition-colors mb-1">{ev.name}</h3>
                  </Link>
                  {ev.date_start && (
                    <div className="text-xs text-gray-500 mb-2">📅 {formatDate(ev.date_start)}</div>
                  )}
                  {ev.location && (
                    <span className="inline-block text-xs bg-[#1A1A2E]/10 text-[#1A1A2E] px-2 py-0.5 rounded-full mb-2">{ev.location}</span>
                  )}
                  {desc && <p className="text-gray-600 text-sm line-clamp-2 mb-3">{desc}</p>}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <div className="text-sm font-semibold text-green-700">
                      {ev.price ? convertPrice(ev.price) : "Gratuit"}
                    </div>
                    <div className="flex gap-2">
                      {ev.whatsapp && (
                        <a href={waLink(ev.whatsapp)} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors">
                          WhatsApp
                        </a>
                      )}
                      <button onClick={() => openBooking(ev.name)}
                        className="text-xs bg-[#2C7A5C] text-white px-3 py-1.5 rounded-lg hover:bg-[#1d5940] transition-colors">
                        Réserver
                      </button>
                    </div>
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
