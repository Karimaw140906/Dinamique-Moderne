import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { MapPin } from "lucide-react";

export function Destinations() {
  const { t } = useLanguage();

  const destinations = [
    { icon: "🏛️", name: "Île de Gorée", desc: "UNESCO", region: "Dakar", gradient: "from-blue-900 to-indigo-900" },
    { icon: "🌆", name: "Dakar", desc: "Capitale", region: "Dakar", gradient: "from-orange-800 to-red-900" },
    { icon: "🦁", name: "Bandia", desc: "Safari", region: "Thiès", gradient: "from-yellow-700 to-orange-900" },
    { icon: "🏜️", name: "Lac Rose", desc: "Phénomène naturel", region: "Dakar", gradient: "from-pink-800 to-rose-900" },
    { icon: "🌊", name: "Saly", desc: "Plage", region: "Thiès", gradient: "from-cyan-700 to-blue-900" },
    { icon: "🦣", name: "Sine Saloum", desc: "Delta", region: "Fatick", gradient: "from-green-800 to-emerald-900" },
    { icon: "🕌", name: "Saint-Louis", desc: "Patrimoine UNESCO", region: "Saint-Louis", gradient: "from-amber-700 to-orange-900" },
    { icon: "🌊", name: "Casamance", desc: "Nature", region: "Ziguinchor", gradient: "from-emerald-700 to-teal-900" },
  ];

  return (
    <section id="destinations" className="py-24 bg-[#1A1A2E] text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {t("destinations_title")}
          </h2>
          <div className="w-24 h-1 bg-secondary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`relative h-64 rounded-2xl overflow-hidden group cursor-pointer bg-gradient-to-br ${dest.gradient}`}
            >
              {/* Overlay that appears on hover */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 z-10"></div>
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="text-4xl mb-3">{dest.icon}</div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-1">{dest.name}</h3>
                  <div className="flex items-center gap-1 text-white/70 text-sm mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{dest.region}</span>
                  </div>
                  <p className="text-secondary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {dest.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}