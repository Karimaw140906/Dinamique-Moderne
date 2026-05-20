import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Instagram, Award, ShieldCheck, MapPin } from "lucide-react";

export function Guide() {
  const { t } = useLanguage();

  return (
    <section id="guide" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative"
          >
            {/* Decorative frame */}
            <div className="absolute -inset-4 border-2 border-secondary/30 rounded-3xl transform rotate-3"></div>
            <div className="absolute -inset-4 border-2 border-primary/20 rounded-3xl transform -rotate-2"></div>
            
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl">
              <img 
                src="/guide-moussa.png" 
                alt="Moussa Diallo - Guide Officiel" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-foreground/90 to-transparent p-8">
                <div className="flex gap-4 mb-4">
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-white border border-white/30">
                    <Award className="w-3 h-3 text-secondary" />
                    UNESCO Partner
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-white border border-white/30">
                    <ShieldCheck className="w-3 h-3 text-secondary" />
                    {t("stats_experience")}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 text-primary font-bold tracking-wider uppercase mb-4">
              <MapPin className="w-5 h-5" />
              <span>Île de Gorée, Dakar</span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-serif font-bold text-foreground mb-6">
              Moussa Diallo
            </h2>
            
            <h3 className="text-2xl text-secondary font-serif italic mb-8">
              {t("guide_role")}
            </h3>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
              {t("guide_bio")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <a 
                href="https://instagram.com/sama__senegal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-foreground/10 hover:border-primary text-foreground hover:text-primary font-bold transition-all group"
              >
                <Instagram className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                @sama__senegal
              </a>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}