import { motion } from "framer-motion";
import { useBooking } from "@/pages/Home";
import { ArrowRight, Star } from "lucide-react";

export function CTABanner() {
  const { openBooking } = useBooking();
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] via-[#2C7A5C] to-[#1A1A2E]" />
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #D4A017 0%, transparent 50%), radial-gradient(circle at 80% 50%, #C2622D 0%, transparent 50%)" }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-[#D4A017] fill-[#D4A017]" />
            <span className="text-white/90 text-sm font-medium">Plus de 2 800 voyageurs satisfaits</span>
            <Star className="w-4 h-4 text-[#D4A017] fill-[#D4A017]" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold text-white leading-tight mb-4">
            Votre aventure sénégalaise<br className="hidden sm:block" />
            <span className="text-[#D4A017]"> vous attend</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Réservez dès maintenant et laissez-vous guider à travers les merveilles du Sénégal, du désert à l'océan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openBooking()}
              className="flex items-center gap-2 px-8 py-4 bg-[#D4A017] hover:bg-[#c49015] text-white font-bold rounded-2xl text-base sm:text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 w-full sm:w-auto justify-center min-h-[52px]">
              Réserver maintenant
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.querySelector("#destinations")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-2xl text-base sm:text-lg transition-all w-full sm:w-auto justify-center min-h-[52px]">
              Explorer les destinations
            </button>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            {[
              { value: "2 800+", label: "Voyageurs satisfaits" },
              { value: "4.9/5", label: "Note moyenne" },
              { value: "6", label: "Sites iconiques" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#D4A017]">{stat.value}</div>
                <div className="text-white/60 text-xs sm:text-sm mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
