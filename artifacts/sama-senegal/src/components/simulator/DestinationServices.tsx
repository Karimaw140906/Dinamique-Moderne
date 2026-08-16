import { useEffect, useState } from "react";
import { Check, Bed, Sparkles } from "lucide-react";
import { useSupabaseData, DEFAULT_HOTELS, DEFAULT_ACTIVITIES } from "@/lib/useSupabaseData";
import { useSimulator, TripDestination } from "@/lib/simulator";
import { fetchPricingRules, resolveTier, computePrice, PricingRule } from "@/lib/pricing";
import { AvailabilityBadge, getAvailabilityStatus } from "@/components/simulator/AvailabilityBadge";

function DestinationBlock({ dest }: { dest: TripDestination }) {
  const { data: hotels } = useSupabaseData("hotels", DEFAULT_HOTELS);
  const { data: activities } = useSupabaseData("activities", DEFAULT_ACTIVITIES);
  const { travelers, setAccommodation, toggleActivity } = useSimulator();
  const [hotelRules, setHotelRules] = useState<PricingRule[]>([]);
  const [activityRules, setActivityRules] = useState<PricingRule[]>([]);

  useEffect(() => {
    fetchPricingRules("hebergement").then(setHotelRules);
    fetchPricingRules("activite").then(setActivityRules);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        {dest.photo ? (
          <img src={dest.photo} className="w-8 h-8 rounded-lg object-cover" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C3EF5] to-[#0B0A14] flex items-center justify-center text-xs">📍</div>
        )}
        <h3 className="font-bold text-sm text-[#0B0A14]">{dest.name}</h3>
        <span className="text-xs text-gray-400">· {dest.nights} nuit{dest.nights > 1 ? "s" : ""}</span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-2">
          <Bed className="w-3.5 h-3.5" /> Hébergement
        </div>
        <div className="grid grid-cols-2 gap-2">
          {hotels.slice(0, 4).map((h: any) => {
            const tier = resolveTier(hotelRules, h.id, travelers);
            const price = computePrice(tier, travelers, dest.nights, (h.price_night || 0) * dest.nights);
            const selected = dest.accommodationId === String(h.id);
            const status = getAvailabilityStatus(h.capacity, travelers);
            return (
              <button
                key={h.id}
                disabled={status === "unavailable"}
                onClick={() => setAccommodation(dest.uid, selected ? null : String(h.id))}
                className={`text-left p-2 rounded-xl border text-xs transition-colors ${
                  selected ? "border-[#6C3EF5] bg-[#6C3EF5]/5" : "border-gray-100 hover:border-gray-200"
                } ${status === "unavailable" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold truncate">{h.name}</span>
                  {selected && <Check className="w-3 h-3 text-[#6C3EF5] shrink-0" />}
                </div>
                <div className="text-[#6C3EF5] font-bold mt-0.5">{price.toLocaleString("fr-FR")} FCFA</div>
                <div className="mt-1"><AvailabilityBadge capacity={h.capacity} travelers={travelers} /></div>
              </button>
            );
          })}
          {hotels.length === 0 && <p className="text-xs text-gray-400 col-span-2">Aucun hébergement disponible.</p>}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Activités (optionnel)
        </div>
        <div className="flex flex-wrap gap-2">
          {activities.slice(0, 8).map((a: any) => {
            const tier = resolveTier(activityRules, a.id, travelers);
            const price = computePrice(tier, travelers, 1, a.price || 0);
            const selected = dest.activityIds.includes(String(a.id));
            return (
              <button
                key={a.id}
                onClick={() => toggleActivity(dest.uid, String(a.id))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selected ? "bg-[#F5B942] border-[#F5B942] text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {a.name} · {price.toLocaleString("fr-FR")} FCFA
              </button>
            );
          })}
          {activities.length === 0 && <p className="text-xs text-gray-400">Aucune activité disponible.</p>}
        </div>
      </div>
    </div>
  );
}

export function DestinationServices() {
  const { destinations } = useSimulator();
  if (destinations.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">Ajoute d'abord des destinations à ton itinéraire.</p>;
  }
  return (
    <div className="space-y-4">
      {destinations.map((d) => (
        <DestinationBlock key={d.uid} dest={d} />
      ))}
    </div>
  );
}
