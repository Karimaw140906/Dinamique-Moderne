import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tag, ArrowRight } from "lucide-react";
import { useBooking } from "@/pages/Home";
import { supabase } from "@/lib/supabase";

// Une offre n'existe que si un acteur autorisé (Super Admin, co-admin, guide
// principal, prestataire) l'a créée depuis son interface — table promo_codes
// gérée par PromoAdmin. Aucune promotion n'est codée en dur ici : si la table
// est vide ou ne contient aucune campagne active, la section ne s'affiche pas.

interface PromoCode {
  id: string;
  code: string;
  campaign_name: string;
  description?: string;
  discount_type: "percentage" | "fixed" | "free_service";
  discount_value: number;
  service_type: string;
  status: string;
  active: boolean;
}

const SERVICE_LABELS: Record<string, string> = {
  all: "Toute la plateforme",
  tours: "Tours",
  transport: "Transport",
  activities: "Activités",
  restaurants: "Restaurants",
  hotels: "Hébergements",
};

function formatDiscount(promo: PromoCode) {
  if (promo.discount_type === "percentage") return `-${promo.discount_value}%`;
  if (promo.discount_type === "fixed") return `-${promo.discount_value} FCFA`;
  return "Offert";
}

function OfferCard({ promo, index }: { promo: PromoCode; index: number }) {
  const { openBooking } = useBooking();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative flex flex-col bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/20 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 shrink-0 w-72 sm:w-80 md:w-auto">

      <div className="absolute -top-3 -right-3 w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10">
        <span className="text-white font-black text-xs leading-none text-center px-1">{formatDiscount(promo)}</span>
      </div>

      <div className="inline-flex items-center gap-1.5 self-start bg-foreground text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
        <Tag className="w-3 h-3" />
        {SERVICE_LABELS[promo.service_type] || promo.service_type}
      </div>

      <div className="font-bold text-foreground text-base sm:text-lg leading-tight mb-2">
        {promo.campaign_name}
      </div>

      {promo.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{promo.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto">
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-foreground">{promo.code}</span>
        <button
          className="flex items-center gap-1.5 px-4 py-2.5 bg-foreground hover:bg-primary text-white text-sm font-bold rounded-xl transition-all group-hover:scale-105 min-h-[44px]"
          onClick={() => openBooking(promo.campaign_name)}>
          Réserver <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function SpecialOffers() {
  const [offers, setOffers] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("promo_codes")
          .select("*")
          .eq("active", true)
          .order("created_at", { ascending: false });
        if (mounted) {
          setOffers(!error && data ? data : []);
          setLoading(false);
        }
      } catch {
        if (mounted) { setOffers([]); setLoading(false); }
      }
    };
    load();
    window.addEventListener("promosUpdated", load);
    return () => { mounted = false; window.removeEventListener("promosUpdated", load); };
  }, []);

  // Aucune offre active : la section ne s'affiche pas du tout.
  if (loading || offers.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Offres spéciales</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold text-foreground mt-2">
              Promotions du moment
            </h2>
          </motion.div>
          <button
            onClick={() => document.querySelector("#tours")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 whitespace-nowrap shrink-0 min-h-[44px]">
            Voir tout <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile : carrousel horizontal */}
        <div className="flex md:hidden overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {offers.map((offer, i) => (
            <div key={offer.id} className="snap-start shrink-0">
              <OfferCard promo={offer} index={i} />
            </div>
          ))}
        </div>

        {/* Desktop : grille */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
          {offers.map((offer, i) => (
            <OfferCard key={offer.id} promo={offer} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
