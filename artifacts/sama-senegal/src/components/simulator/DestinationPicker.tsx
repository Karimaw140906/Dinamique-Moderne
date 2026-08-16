import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useSupabaseData, DEFAULT_DESTINATIONS } from "@/lib/useSupabaseData";
import { useSimulator } from "@/lib/simulator";
import { useLanguage } from "@/lib/i18n";
import { useState } from "react";

const CATEGORIES = ["Toutes", "plage", "culture", "nature", "patrimoine", "aventure", "gastronomie", "ville", "faune", "désert", "loisirs"];

export function DestinationPicker() {
  const { data: destinations } = useSupabaseData("destinations", DEFAULT_DESTINATIONS, { column: "active", value: true });
  const { destinations: tripDestinations, addDestination } = useSimulator();
  const { language } = useLanguage();
  const [filter, setFilter] = useState("Toutes");
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const filtered = filter === "Toutes" ? destinations : destinations.filter((d: any) => d.category === filter);

  const handleAdd = (d: any) => {
    addDestination({ id: d.id, name: d.name, photo: d.photo });
    setJustAdded(d.id);
    setTimeout(() => setJustAdded(null), 900);
  };

  const isInTrip = (id: string | number) => tripDestinations.some((td) => td.destinationId === id);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
              filter === c ? "bg-[#6C3EF5] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((d: any) => {
          const desc = language === "EN" ? d.desc_en : language === "ES" ? d.desc_es : d.desc_fr;
          const already = isInTrip(d.id);
          return (
            <motion.div
              key={d.id}
              layout
              whileHover={{ y: -4 }}
              className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 group"
            >
              <div className="relative h-32 sm:h-36 overflow-hidden">
                {d.photo ? (
                  <img src={d.photo} alt={d.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#6C3EF5] to-[#0B0A14] flex items-center justify-center text-3xl">🏝️</div>
                )}
                <AnimatePresence>
                  {justAdded === d.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 bg-[#6C3EF5]/80 flex items-center justify-center"
                    >
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Check className="w-10 h-10 text-white" strokeWidth={3} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {d.region && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold rounded-full">
                    {d.region}
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm text-[#0B0A14] truncate">{d.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{desc}</p>
                <button
                  onClick={() => handleAdd(d)}
                  disabled={already}
                  className={`mt-2 w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    already
                      ? "bg-green-50 text-green-600 cursor-default"
                      : "bg-[#F5B942] text-white hover:bg-[#c49015] active:scale-95"
                  }`}
                >
                  {already ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Dans le voyage
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Ajouter
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
