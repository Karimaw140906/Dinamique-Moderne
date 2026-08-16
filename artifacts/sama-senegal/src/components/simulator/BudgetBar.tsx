import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulator } from "@/lib/simulator";
import { fetchPricingRules, resolveTier, computePrice, PricingRule } from "@/lib/pricing";

export function BudgetBar({ variant = "mobile" }: { variant?: "mobile" | "sidebar" }) {
  const { travelers, totalNights, destinations } = useSimulator();
  const [destRules, setDestRules] = useState<PricingRule[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchPricingRules("destination").then((r) => {
      setDestRules(r);
      setLoaded(true);
    });
  }, []);

  let total = 0;
  let hasPricing = false;
  for (const d of destinations) {
    const tier = resolveTier(destRules, String(d.destinationId), travelers);
    if (tier) {
      hasPricing = true;
      total += computePrice(tier, travelers, d.nights, 0);
    }
  }

  const perPerson = travelers > 0 && hasPricing ? Math.round(total / travelers) : 0;

  const content = (
    <>
      <div className="flex items-center justify-between text-xs text-white/70 mb-1">
        <span>
          👥 {travelers} · 📍 {destinations.length} · 🌙 {totalNights}n
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          {!loaded ? (
            <div className="text-sm text-white/50">Calcul...</div>
          ) : hasPricing ? (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={total}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                className="text-xl font-bold text-white"
              >
                {total.toLocaleString("fr-FR")} FCFA
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-sm text-white/60 italic">Budget à définir (tarifs non configurés)</div>
          )}
          {hasPricing && (
            <div className="text-xs text-white/60">≈ {perPerson.toLocaleString("fr-FR")} FCFA / personne</div>
          )}
        </div>
      </div>
    </>
  );

  if (variant === "sidebar") {
    return <div className="bg-[#0B0A14] rounded-2xl p-4 sticky top-4">{content}</div>;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0A14]/95 backdrop-blur-sm px-4 py-3 lg:hidden border-t border-white/10">
      {content}
    </div>
  );
}
