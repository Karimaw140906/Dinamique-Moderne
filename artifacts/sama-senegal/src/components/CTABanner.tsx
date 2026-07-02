import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useBooking } from "@/context/BookingContext";
import { ArrowRight, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Statistiques réelles uniquement — jamais de chiffre inventé. Si une donnée
// n'existe pas encore en base, l'élément correspondant ne s'affiche pas.
const DEFAULT_STATS = { travelers: 0, rating: 0, sites: 0 };

async function loadCTAStats() {
  try {
    const [bookings, restaurants, hotels, activities, tours] = await Promise.all([
      supabase.from("bookings").select("id"),
      supabase.from("restaurants").select("rating").eq("active", true),
      supabase.from("hotels").select("rating").eq("active", true),
      supabase.from("activities").select("location").eq("active", true),
      supabase.from("tours").select("id").eq("active", true),
    ]);

    const ratings = [
      ...(restaurants.data || []).map((r: any) => r.rating).filter((r: any) => typeof r === "number"),
      ...(hotels.data || []).map((h: any) => h.rating).filter((r: any) => typeof r === "number"),
    ];
    const avgRating = ratings.length > 0
      ? parseFloat((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1))
      : 0;

    const sites = new Set((activities.data || []).map((a: any) => a.location).filter(Boolean)).size
      || (tours.data?.length ?? 0);

    return { travelers: bookings.data?.length ?? 0, rating: avgRating, sites };
  } catch {
    return DEFAULT_STATS;
  }
}

export function CTABanner() {
  const { openBooking } = useBooking();
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    loadCTAStats().then(setStats);
    const refresh = () => loadCTAStats().then(setStats);
    window.addEventListener("bookingsUpdated", refresh);
    return () => window.removeEventListener("bookingsUpdated", refresh);
  }, []);

  const statRows = [
    stats.travelers > 0 ? { value: `${stats.travelers}+`, label: "Voyageurs satisfaits" } : null,
    stats.rating > 0 ? { value: `${stats.rating}/5`, label: "Note moyenne" } : null,
    stats.sites > 0 ? { value: String(stats.sites), label: "Sites iconiques" } : null,
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0A14] via-[#6C3EF5] to-[#0B0A14]" />
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #F5B942 0%, transparent 50%), radial-gradient(circle at 80% 50%, #C2622D 0%, transparent 50%)" }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          {stats.travelers > 0 && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-[#F5B942] fill-[#F5B942]" />
              <span className="text-white/90 text-sm font-medium">Plus de {stats.travelers} voyageurs satisfaits</span>
              <Star className="w-4 h-4 text-[#F5B942] fill-[#F5B942]" />
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold text-white leading-tight mb-4">
            Votre aventure sénégalaise<br className="hidden sm:block" />
            <span className="text-[#F5B942]"> vous attend</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Réservez dès maintenant et découvrez les merveilles du Sénégal, du désert à l'océan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openBooking()}
              className="flex items-center gap-2 px-8 py-4 bg-[#F5B942] hover:bg-[#c49015] text-white font-bold rounded-2xl text-base sm:text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 w-full sm:w-auto justify-center min-h-[52px]">
              Réserver maintenant
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => (window.location.href = "/destinations")}
              className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-2xl text-base sm:text-lg transition-all w-full sm:w-auto justify-center min-h-[52px]">
              Explorer nos tours
            </button>
          </div>

          {statRows.length > 0 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
              {statRows.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-[#F5B942]">{stat.value}</div>
                  <div className="text-white/60 text-xs sm:text-sm mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
