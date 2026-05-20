import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-goree.png"
          alt="Gorée Island Coast"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Dark gradient overlay matching brand colors (night to green) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E]/90 via-[#1A1A2E]/70 to-[#2C7A5C]/60" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary backdrop-blur-sm">
            <span>✨ {t("hero_badge")}</span>
          </div>

          {/* Wolof Title - Never translated */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif italic text-white tracking-tight leading-none drop-shadow-lg">
            Xam suñu tiossane
          </h1>

          <p className="text-xl md:text-3xl text-white/90 font-light tracking-wide max-w-2xl mx-auto">
            {t("hero_subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8 h-14 text-lg w-full sm:w-auto rounded-none"
              onClick={() => document.querySelector("#reserver")?.scrollIntoView({ behavior: "smooth" })}
            >
              {t("hero_book")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <a href="https://wa.me/+221774188107" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="bg-primary/80 border-primary hover:bg-primary text-white hover:text-white px-8 h-14 text-lg w-full backdrop-blur-md rounded-none"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                WhatsApp
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}