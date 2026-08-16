import { Reorder, motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, GripVertical, MapPin } from "lucide-react";
import { useSimulator } from "@/lib/simulator";

export function TripTimeline() {
  const { destinations, reorderDestinations, updateNights, removeDestination, totalNights } = useSimulator();

  if (destinations.length === 0) {
    return (
      <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-2xl">
        <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Ajoute des destinations pour construire ton itinéraire.</p>
      </div>
    );
  }

  return (
    <div>
      <Reorder.Group axis="y" values={destinations} onReorder={reorderDestinations} className="space-y-2">
        <AnimatePresence initial={false}>
          {destinations.map((d, i) => (
            <Reorder.Item
              key={d.uid}
              value={d}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3">
                <GripVertical className="w-4 h-4 text-gray-300 shrink-0 cursor-grab active:cursor-grabbing" />
                <div className="w-8 h-8 rounded-full bg-[#6C3EF5]/10 text-[#6C3EF5] font-bold text-xs flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                {d.photo ? (
                  <img src={d.photo} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6C3EF5] to-[#0B0A14] flex items-center justify-center text-sm shrink-0">📍</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#0B0A14] truncate">{d.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateNights(d.uid, d.nights - 1)}
                      className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <motion.span
                      key={d.nights}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-xs font-semibold text-gray-600 w-16 text-center"
                    >
                      {d.nights} nuit{d.nights > 1 ? "s" : ""}
                    </motion.span>
                    <button
                      onClick={() => updateNights(d.uid, d.nights + 1)}
                      className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeDestination(d.uid)}
                  className="w-7 h-7 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
      <div className="text-center text-xs text-gray-400 mt-3">
        {destinations.length} destination{destinations.length > 1 ? "s" : ""} · {totalNights} nuit{totalNights > 1 ? "s" : ""} au total
      </div>
    </div>
  );
}
