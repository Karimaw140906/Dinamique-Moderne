import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";
import { DEFAULT_TOURS } from "./admin/ToursAdmin";
import { useBooking } from "@/pages/home";

function loadTours() {
  try {
    const saved = localStorage.getItem("toursData");
    return saved ? JSON.parse(saved) : DEFAULT_TOURS;
  } catch {
    return DEFAULT_TOURS;
  }
}

export function Tours() {
  const { t, language } = useLanguage();
  const { convertPrice } = useCurrency();
  const { openBooking } = useBooking();
  const [tours, setTours] = useState<any[]>(() => loadTours());

  useEffect(() => {
    const onUpdate = () => setTours(loadTours());
    window.addEventListener("toursDataUpdated", onUpdate);
    return () => window.removeEventListener("toursDataUpdated", onUpdate);
  }, []);

  const activeTours = tours.filter((t: any) => t.active);
  if (activeTours.length === 0) return null;

  const getName = (tour: any) =>
    language === "EN"
      ? tour.nameEN || tour.nameFR
      : language === "ES"
        ? tour.nameES || tour.nameFR
        : tour.nameFR || tour.name || "";

  const getDesc = (tour: any) =>
    language === "EN"
      ? tour.descEN
      : language === "ES"
        ? tour.descES
        : tour.descFR;

  return (
    <section id="tours" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {t("tours_title")}
          </h2>
          <div className="w-24 h-1 bg-secondary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTours.map((tour, index) => {
            const name = getName(tour);
            const desc = getDesc(tour);
            const gradient = tour.gradient || "from-[#2C7A5C] to-[#1A1A2E]";
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

                  {tour.photo ? (
                    <div className="relative h-48 overflow-hidden shrink-0">
                      <img
                        src={tour.photo}
                        alt={name}
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
                    <div className="flex flex-col items-center pt-8 pb-4 px-8">
                      <div className="text-5xl mb-6 bg-white/5 p-4 rounded-full w-24 h-24 flex items-center justify-center border border-white/10 shadow-inner">
                        {tour.emoji}
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-white text-center h-16 flex items-center justify-center">
                        {name}
                      </h3>
                    </div>
                  )}

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
