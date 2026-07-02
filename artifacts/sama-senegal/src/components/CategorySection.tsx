import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BedDouble, Zap, UtensilsCrossed, Car, Calendar, ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    id: "hebergements",
    label: "Hébergements",
    icon: BedDouble,
    anchor: "#hebergements",
    localKey: "hotelsData",
    gradient: "from-[#6C3EF5] to-[#1a5e42]",
    bg: "bg-[#6C3EF5]/10",
    color: "text-[#6C3EF5]",
    emoji: "🏨",
    desc: "Lodges, hôtels & maisons d'hôtes",
  },
  {
    id: "activites",
    label: "Activités",
    icon: Zap,
    anchor: "#activites",
    localKey: "activitiesData",
    gradient: "from-[#F5B942] to-[#b8880f]",
    bg: "bg-[#F5B942]/10",
    color: "text-[#F5B942]",
    emoji: "🎯",
    desc: "Pirogue, cuisine, excursions",
  },
  {
    id: "restaurants",
    label: "Restaurants",
    icon: UtensilsCrossed,
    anchor: "#restaurants",
    localKey: "restaurantsData",
    gradient: "from-[#C2622D] to-[#a0501f]",
    bg: "bg-[#C2622D]/10",
    color: "text-[#C2622D]",
    emoji: "🍽️",
    desc: "Cuisine sénégalaise & internationale",
  },
  {
    id: "transports",
    label: "Transports",
    icon: Car,
    anchor: "#transport",
    localKey: "transportData",
    gradient: "from-[#5C3D1E] to-[#3d2810]",
    bg: "bg-[#5C3D1E]/10",
    color: "text-[#5C3D1E]",
    emoji: "🚗",
    desc: "4x4, minibus, transferts",
  },
  {
    id: "evenements",
    label: "Événements",
    icon: Calendar,
    anchor: "#tours",
    localKey: "toursData",
    gradient: "from-[#0B0A14] to-[#2d2d4a]",
    bg: "bg-[#0B0A14]/10",
    color: "text-[#0B0A14]",
    emoji: "🎉",
    desc: "Festivals, mariages & gala",
  },
];

function useCount(localKey: string) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(localKey) || "[]");
      setCount(data.filter((d: any) => d.active !== false).length);
    } catch { setCount(0); }
  }, [localKey]);
  return count;
}

function CategoryCard({ cat, index }: { cat: typeof CATEGORIES[0]; index: number }) {
  const count = useCount(cat.localKey);
  const Icon = cat.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      onClick={() => document.querySelector(cat.anchor)?.scrollIntoView({ behavior: "smooth" })}
      className="group flex flex-col items-center text-center p-4 sm:p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 shrink-0 w-36 sm:w-44 md:w-auto cursor-pointer">

      {/* Icon circle */}
      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${cat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
        <span className="text-2xl sm:text-3xl">{cat.emoji}</span>
      </div>

      <div className="font-bold text-[#0B0A14] text-sm sm:text-base leading-tight">{cat.label}</div>
      <div className="text-xs text-gray-400 mt-1 leading-tight hidden sm:block">{cat.desc}</div>

      {count > 0 && (
        <div className={`mt-2 text-xs font-bold ${cat.color} bg-opacity-10 ${cat.bg} px-2.5 py-1 rounded-full`}>
          {count} {count === 1 ? "option" : "options"}
        </div>
      )}

      <div className={`mt-3 flex items-center gap-1 text-xs font-semibold ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
        Explorer <ArrowRight className="w-3 h-3" />
      </div>
    </motion.button>
  );
}

export function CategorySection() {
  return (
    <section className="py-12 md:py-16 bg-[#2B1B4D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-10">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold text-[#6C3EF5] uppercase tracking-widest">Explorez par catégorie</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold text-[#0B0A14] mt-2">
              Que cherchez-vous ?
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-md mx-auto">
              Du lodge en brousse à la sortie en pirogue, tout le Sénégal en un clic.
            </p>
          </motion.div>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex sm:hidden overflow-x-auto gap-3 pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {CATEGORIES.map((cat, i) => (
            <div key={cat.id} className="snap-start shrink-0">
              <CategoryCard cat={cat} index={i} />
            </div>
          ))}
        </div>

        {/* Tablet/Desktop: grid */}
        <div className="hidden sm:grid grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
