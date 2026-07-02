import { Link } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useSupabaseData } from "@/lib/useSupabaseData";

// Repli par défaut au format réel de la table Supabase "tours" (colonnes :
// name, name_en, name_es, desc_fr, desc_en, desc_es, price, location,
// duration, emoji, gradient, active) — distinct de l'ancien format
// localStorage (nameFR/descFR) qui n'est plus utilisé ici.
const DEFAULT_TOURS_FALLBACK = [
  { id: "default-1", emoji: "🏛️", name: "Visite guidée Île de Gorée", name_en: "Guided Tour Gorée Island", name_es: "Visita Guiada Isla de Gorée", desc_fr: "Découvrez l'histoire et l'architecture coloniale de Gorée.", desc_en: "Discover the history and colonial architecture of Gorée.", desc_es: "Descubre la historia y arquitectura colonial de Gorée.", duration: "4-5h", price: 15000, location: "Île de Gorée", gradient: "from-[#6C3EF5] to-[#0B0A14]", active: true },
  { id: "default-2", emoji: "🏙", name: "City Tour Dakar", name_en: "Dakar City Tour", name_es: "Tour por la Ciudad de Dakar", desc_fr: "Explorez les quartiers emblématiques de Dakar avec un guide expert.", desc_en: "Explore Dakar's iconic neighborhoods with an expert guide.", desc_es: "Explora los barrios icónicos de Dakar con un guía experto.", duration: "3-4h", price: 20000, location: "Dakar", gradient: "from-[#C2622D] to-[#5C3D1E]", active: true },
  { id: "default-3", emoji: "🦒", name: "Excursion Bandia", name_en: "Bandia Safari Excursion", name_es: "Excursión Safari Bandia", desc_fr: "Safari au cœur de la réserve naturelle de Bandia, rencontrez girafes et lions.", desc_en: "Safari in the heart of the Bandia nature reserve.", desc_es: "Safari en el corazón de la reserva natural de Bandia.", duration: "1 journée", price: 35000, location: "Bandia", gradient: "from-[#F5B942] to-[#5C3D1E]", active: true },
];

export function Tours() {
  const { t, language } = useLanguage();
  const { convertPrice } = useCurrency();
  const { openBooking } = useBooking();
  const { data: tours } = useSupabaseData("tours", DEFAULT_TOURS_FALLBACK, { column: "active", value: true });

  const activeTours = tours.filter((tour: any) => tour.active);
  if (activeTours.length === 0) return null;

  const getName = (tour: any) =>
    language === "EN"
      ? tour.name_en || tour.name
      : language === "ES"
        ? tour.name_es || tour.name
        : tour.name || "";

  const getDesc = (tour: any) =>
    language === "EN"
      ? tour.desc_en
      : language === "ES"
        ? tour.desc_es
        : tour.desc_fr;

  return (
    <section id="tours" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">
            {t("category_tours")}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-foreground mt-2 mb-4">
            {t("tours_title")}
          </h2>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTours.map((tour: any, index: number) => {
            const name = getName(tour);
            const desc = getDesc(tour);
            const gradient = tour.gradient || "from-[#6C3EF5] to-[#0B0A14]";
            return (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${gradient} p-[1px]`}
              >
                <div className="bg-foreground/95 h-full rounded-2xl flex flex-col overflow-hidden relative group">
                  <div
                    className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${gradient} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none`}
                  />

                  <Link href={`/tours/${tour.id}`}>
                    {tour.photo ? (
                      <div className="relative h-48 overflow-hidden shrink-0 zoom-on-hover cursor-pointer">
                        <img
                          src={tour.photo}
                          alt={name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="text-xl font-serif font-bold text-white leading-tight">
                            {name}
                          </h3>
                        </div>
                        <div className="absolute top-3 right-3 text-3xl bg-black/30 backdrop-blur-sm p-2 rounded-full">
                          {tour.emoji}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center pt-8 pb-4 px-8 cursor-pointer">
                        <div className="text-5xl mb-6 bg-white/5 p-4 rounded-full w-24 h-24 flex items-center justify-center border border-white/10 shadow-inner">
                          {tour.emoji}
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white text-center h-16 flex items-center justify-center hover:text-secondary transition-colors">
                          {name}
                        </h3>
                      </div>
                    )}
                  </Link>

                  <div
                    className={`flex flex-col flex-1 px-8 ${tour.photo ? "pt-5" : "pt-0"} pb-8`}
                  >
                    <div className="flex items-center gap-4 text-white/70 mb-4 border-t border-b border-white/10 py-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-secondary shrink-0" />
                        <span className="text-sm">{tour.duration}</span>
                      </div>
                      {tour.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-secondary shrink-0" />
                          <span className="text-sm">{tour.location}</span>
                        </div>
                      )}
                    </div>

                    {desc && (
                      <p className="text-white/60 text-sm leading-relaxed mb-5 line-clamp-2">
                        {desc}
                      </p>
                    )}

                    <div className="mt-auto">
                      <div className="text-3xl font-bold text-secondary mb-1">
                        {convertPrice(tour.price)}
                      </div>
                      <div className="text-white/30 text-xs mb-4">
                        {new Intl.NumberFormat("fr-FR").format(tour.price)} FCFA
                      </div>
                      <Button
                        className="w-full bg-white text-foreground hover:bg-secondary hover:text-secondary-foreground font-bold py-6 text-lg rounded-xl transition-colors"
                        onClick={() => openBooking(name)}
                      >
                        {t("tours_book")}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
