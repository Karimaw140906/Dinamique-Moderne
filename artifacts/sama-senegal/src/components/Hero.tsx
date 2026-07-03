import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useBooking } from "@/context/BookingContext";
import { ArrowRight, Star, MapPin, ShieldCheck, PlayCircle } from "lucide-react";
import { useHeroVideo } from "@/lib/heroVideos";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

// Statistiques réelles issues de Supabase (jamais de chiffres inventés).
// Si une requête échoue ou que la table est vide, on retombe sur 0 / valeurs
// neutres plutôt que d'afficher un nombre fictif.
const DEFAULT_STATS = { travelers: 0, rating: 0, sites: 0 };

async function loadHeroStats() {
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

    return {
      travelers: bookings.data?.length ?? 0,
      rating: avgRating,
      sites,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function Hero() {
  const { language } = useLanguage();
  const { openBooking } = useBooking();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [playing, setPlaying] = useState(false);
  const videoUrl = useHeroVideo("accueil");

  useEffect(() => {
    loadHeroStats().then(setStats);
    const refresh = () => loadHeroStats().then(setStats);
    window.addEventListener("bookingsUpdated", refresh);
    return () => window.removeEventListener("bookingsUpdated", refresh);
  }, []);

  const subtitles: Record<string, string> = {
    FR: "Gorée, le Lac Rose, Casamance et bien plus — vivez le Sénégal authentique, en toute simplicité.",
    EN: "Gorée, Pink Lake, Casamance and more — experience authentic Senegal, made simple.",
    ES: "Gorée, el Lago Rosa, Casamance y más — vive el Senegal auténtico, sin complicaciones.",
  };
  const videoLabels: Record<string, string> = {
    FR: "Voir la vidéo",
    EN: "Watch the video",
    ES: "Ver el video",
  };
  const statLabels: Record<string, { travelers: string; rating: string; sites: string }> = {
    FR: { travelers: "Voyageurs", rating: "Note moyenne", sites: "Sites couverts" },
    EN: { travelers: "Travelers", rating: "Average rating", sites: "Sites covered" },
    ES: { travelers: "Viajeros", rating: "Valoración media", sites: "Sitios cubiertos" },
  };
  const labels = statLabels[language] || statLabels.FR;

  const hasStats = stats.travelers > 0 || stats.rating > 0 || stats.sites > 0;
  const showVideo = playing && !!videoUrl;

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {showVideo ? (
          <video src={videoUrl!} autoPlay loop muted playsInline className="w-full h-full object-cover object-[75%_center] sm:object-[65%_center] lg:object-center" />
        ) : (
          <img src="/hero-renaissance.png" alt="Monument de la Renaissance africaine, Dakar" className="w-full h-full object-cover object-[75%_center] sm:object-[65%_center] lg:object-center" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/85 via-brand-dark/65 to-brand-violet-glow/50" />
      </div>

      {/* Content grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 pb-24 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-center">

          {/* LEFT — Main content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-center lg:text-left space-y-6">

            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-brand-gold/20 backdrop-blur-sm border border-brand-gold/30 rounded-full px-5 py-2">
              <MapPin className="w-4 h-4 text-brand-gold" />
              <span className="text-brand-gold font-semibold text-sm tracking-wide">Le Sénégal vous accueille</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic font-bold text-white leading-tight tracking-tight drop-shadow-xl">
              Découvrez le Sénégal{" "}
              <span className="text-brand-gold relative">
                Autrement
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-brand-gold/50 rounded-full" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-white/80 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              {subtitles[language]}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3 pt-2">
              <button
                onClick={() => openBooking()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-brand-gold hover:bg-brand-gold-dark text-white font-bold rounded-2xl text-base sm:text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 min-h-[52px]">
                Réserver maintenant
                <ArrowRight className="w-5 h-5" />
              </button>
              {videoUrl && !showVideo && (
                <button
                  onClick={() => setPlaying(true)}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-2xl text-base sm:text-lg transition-all min-h-[52px]">
                  <PlayCircle className="w-5 h-5" />
                  {videoLabels[language]}
                </button>
              )}
            </div>

            {/* Stars row — uniquement si une vraie note moyenne existe en base */}
            {stats.rating > 0 && (
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(stats.rating) ? "text-brand-gold fill-brand-gold" : "text-white/20"}`}
                    />
                  ))}
                </div>
                <span className="text-white/80 text-sm font-medium">
                  {stats.rating}/5
                  {stats.travelers > 0 && (
                    <> · <span className="text-white font-bold">{stats.travelers}</span> {labels.travelers.toLowerCase()}</>
                  )}
                </span>
              </div>
            )}
          </motion.div>

          {/* RIGHT — Trust card (desktop), basé sur des données réelles uniquement */}
          {hasStats && (
            <div className="hidden lg:flex flex-col gap-3">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-violet-glow/40 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Confiance & sécurité</div>
                    <div className="text-white/60 text-xs">Réservation 100% sécurisée</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: stats.travelers > 0 ? String(stats.travelers) : "—", l: labels.travelers },
                    { v: stats.rating > 0 ? `${stats.rating}★` : "—", l: labels.rating },
                    { v: stats.sites > 0 ? String(stats.sites) : "—", l: labels.sites },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-2 text-center">
                      <div className="font-bold text-brand-gold text-base">{s.v}</div>
                      <div className="text-white/60 text-xs">{s.l}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-violet-deep to-transparent z-10" />
    </section>
  );
}
