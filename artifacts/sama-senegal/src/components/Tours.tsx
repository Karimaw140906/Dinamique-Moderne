import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";

export function Tours() {
  const { t } = useLanguage();

  const tours = [
    {
      id: 1,
      icon: "🏛️",
      name: "Visite guidée Île de Gorée",
      duration: "4-5h",
      price: "15 000 FCFA",
      gradient: "from-[#2C7A5C] to-[#1A1A2E]",
    },
    {
      id: 2,
      icon: "🏙",
      name: "City Tour Dakar",
      duration: "3-4h",
      price: "20 000 FCFA",
      gradient: "from-[#C2622D] to-[#5C3D1E]",
    },
    {
      id: 3,
      icon: "🦒",
      name: "Excursion Bandia",
      duration: "1 journée",
      price: "35 000 FCFA",
      gradient: "from-[#D4A017] to-[#5C3D1E]",
    },
    {
      id: 4,
      icon: "🎒",
      name: "Combo Gorée+Dakar",
      duration: "1 journée",
      price: "30 000 FCFA",
      gradient: "from-[#2C7A5C] to-[#C2622D]",
    },
    {
      id: 5,
      icon: "🌅",
      name: "Coucher de soleil Gorée",
      duration: "2h",
      price: "10 000 FCFA",
      gradient: "from-[#1A1A2E] to-[#D4A017]",
    },
    {
      id: 6,
      icon: "🏜️",
      name: "Lac Rose",
      duration: "1 journée",
      price: "25 000 FCFA",
      gradient: "from-[#C2622D] to-[#2C7A5C]",
    },
  ];

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
          {tours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${tour.gradient} p-[1px]`}
            >
              <div className="bg-foreground/95 h-full rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden group">
                {/* Decorative background blur */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${tour.gradient} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                
                <div className="text-5xl mb-6 bg-white/5 p-4 rounded-full w-24 h-24 flex items-center justify-center border border-white/10 shadow-inner">
                  {tour.icon}
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-white mb-4 h-16 flex items-center justify-center">
                  {tour.name}
                </h3>
                
                <div className="flex items-center gap-6 text-white/80 mb-8 w-full justify-center border-t border-b border-white/10 py-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span>{tour.duration}</span>
                  </div>
                </div>
                
                <div className="mt-auto w-full">
                  <div className="text-3xl font-bold text-secondary mb-6">
                    {tour.price}
                  </div>
                  <Button 
                    className="w-full bg-white text-foreground hover:bg-secondary hover:text-secondary-foreground font-bold py-6 text-lg rounded-xl transition-colors"
                    onClick={() => {
                      const select = document.querySelector('select[name="tour"]');
                      if (select) {
                        (select as HTMLSelectElement).value = tour.name;
                      }
                      document.querySelector("#reserver")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {t("tours_book")}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}