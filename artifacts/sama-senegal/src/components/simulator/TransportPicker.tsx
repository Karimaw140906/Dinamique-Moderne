import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Car } from "lucide-react";
import { useSupabaseData, DEFAULT_TRANSPORT } from "@/lib/useSupabaseData";
import { useSimulator } from "@/lib/simulator";
import { fetchPricingRules, resolveTier, computePrice, PricingRule } from "@/lib/pricing";
import { AvailabilityBadge, getAvailabilityStatus } from "@/components/simulator/AvailabilityBadge";

export function TransportPicker() {
  const { data: transports } = useSupabaseData("transport", DEFAULT_TRANSPORT, { column: "active", value: true });
  const { transportId, setTransportId, travelers } = useSimulator();
  const [rules, setRules] = useState<PricingRule[]>([]);

  useEffect(() => {
    fetchPricingRules("transport").then(setRules);
  }, []);

  if (transports.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">Aucune option de transport configurée pour le moment.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {transports.map((t: any) => {
        const tier = resolveTier(rules, t.id, travelers);
        const price = computePrice(tier, travelers, 1, t.price || 0);
        const selected = transportId === String(t.id);
        const status = getAvailabilityStatus(t.capacity, travelers);
        return (
          <motion.button
            key={t.id}
            disabled={status === "unavailable"}
            onClick={() => setTransportId(String(t.id))}
            whileTap={{ scale: 0.97 }}
            className={`text-left p-4 rounded-2xl border-2 transition-colors ${
              selected ? "border-[#6C3EF5] bg-[#6C3EF5]/5" : "border-gray-100 bg-white hover:border-gray-200"
            } ${status === "unavailable" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[#6C3EF5]" />
                <span className="font-bold text-sm text-[#0B0A14]">{t.name}</span>
              </div>
              {selected && <Check className="w-4 h-4 text-[#6C3EF5]" />}
            </div>
            <p className="text-xs text-gray-400 mb-2">{t.desc_fr}</p>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm font-bold text-[#6C3EF5]">{price.toLocaleString("fr-FR")} FCFA</div>
              <AvailabilityBadge capacity={t.capacity} travelers={travelers} />
            </div>
            {tier && <div className="text-[10px] text-gray-400">tarif pour {travelers} voyageur{travelers > 1 ? "s" : ""}</div>}
          </motion.button>
        );
      })}
    </div>
  );
}
