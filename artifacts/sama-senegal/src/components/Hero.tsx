import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useBooking } from "@/pages/Home";
import { ArrowRight, Star, Sun, Wind, MapPin } from "lucide-react";

const REVIEWS = [
  { name: "Sophie M.", country: "🇫🇷", text: "Expérience inoubliable !", stars: 5 },
  { name: "James K.", country: "🇬🇧", text: "Absolutely magical!", stars: 5 },
  { name: "Carlos R.", country: "🇪🇸", text: "¡Increíble aventura!", stars: 5 },
];

function WeatherBadge() {
  return (
    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white">
      <Sun className="w-6 h-6 text-[#D4A017]" />
      <div>
        <div className="text-xs text-white/60 font-medium">Dakar aujourd'hui</div>
        <div className="font-bold text-lg leading-none">32°C ☀️</div>
      </div>
      <div className="w-px h-8 bg-white/20" />
      <div className="text-xs text-white/70 flex items-center gap-1">
        <Wind className="w-3 h-3" /> 15 km/h
      </div>
    </div>
  );
}

function FloatingReview({ review, delay }: { review: typeof REVIEWS[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-full bg-[#D4A017]/30 flex items-center justify-center text-sm">{review.country}</div>
        <span className="font-semibold text-sm">{review.name}</span>
        <div className="flex ml-auto">
          {Array.from({ length: review.stars }).map((_, i) => (
            <Star key={i} className="w-3 h-3 text-[#D4A017] fill-[#D4A017]" />
          ))}
        </div>
      </div>
      <p className="text-white/80 text-xs">{review.text}</p>
    </motion.div>
  );
}

export function Hero() {
  const { language } = useLanguage();
  const { openBooking } = useBooking();

  const subtitles: Record<string, string> = {
    FR: "Gorée, le Lac Rose, Casamance et bien plus — vivez le Sénégal authentique avec votre guide dédié.",
    EN: "Gorée, Pink Lake, Casamance and more — experience authentic Senegal with your dedicated guide.",
    ES: "Gorée, el Lago Rosa, Casamance y más — vive el Senegal auténtico con tu guía dedicado.",
  };
  const discoverLabels: Record<string, string> = {
    FR: "Découvrir les expériences",
    EN: "Explore experiences",
    ES: "Explorar experiencias",
  };

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src="/hero-goree.png" alt="Sénégal - Île de Gorée" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E]/85 via-[#1A1A2E]/65 to-[#2C7A5C]/50" />
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
              className="inline-flex items-center gap-2 bg-[#D4A017]/20 backdrop-blur-sm border border-[#D4A017]/30 rounded-full px-5 py-2">
              <MapPin className="w-4 h-4 text-[#D4A017]" />
              <span className="text-[#D4A017] font-semibold text-sm tracking-wide">Le Sénégal vous accueille</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic font-bold text-white leading-tight tracking-tight drop-shadow-xl">
              Découvrez le Sénégal{" "}
              <span className="text-[#D4A017] relative">
                Autrement
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#D4A017]/50 rounded-full" />
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
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-[#D4A017] hover:bg-[#c49015] text-white font-bold rounded-2xl text-base sm:text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 min-h-[52px]">
                Réserver maintenant
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.querySelector("#destinations")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-2xl text-base sm:text-lg transition-all min-h-[52px]">
                {discoverLabels[language]}
              </button>
            </div>

            {/* Trust row (mobile) */}
            <div className="flex items-center justify-center lg:justify-start gap-4 lg:hidden pt-2">
              <WeatherBadge />
            </div>

            {/* Stars row */}
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-[#D4A017] fill-[#D4A017]" />)}
              </div>
              <span className="text-white/80 text-sm font-medium">4.9/5 · <span className="text-white font-bold">2 847</span> avis vérifiés</span>
            </div>
          </motion.div>

          {/* RIGHT — Floating widgets (desktop) */}
          <div className="hidden lg:flex flex-col gap-3">
            <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <WeatherBadge />
            </motion.div>

            {/* Trust card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#2C7A5C]/40 flex items-center justify-center">
                  <Star className="w-5 h-5 text-[#D4A017] fill-[#D4A017]" />
                </div>
                <div>
                  <div className="font-bold text-sm">Confiance & Sécurité</div>
                  <div className="text-white/60 text-xs">Certifié Tourisme Sénégal</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: "2 847", l: "Voyageurs" },
                  { v: "4.9★", l: "Note moyenne" },
                  { v: "6", l: "Sites couverts" },
                  { v: "100%", l: "Satisfaction" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-2 text-center">
                    <div className="font-bold text-[#D4A017] text-base">{s.v}</div>
                    <div className="text-white/60 text-xs">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating reviews */}
            {REVIEWS.slice(0, 2).map((r, i) => (
              <FloatingReview key={i} review={r} delay={0.9 + i * 0.15} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F5F0E8] to-transparent z-10" />
    </section>
  );
}
