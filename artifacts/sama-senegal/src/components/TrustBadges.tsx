import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { ShieldCheck, Clock, Tag, RefreshCcw } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, labelKey: "trust_secure_title", descKey: "trust_secure_desc" },
  { icon: Clock, labelKey: "trust_support_title", descKey: "trust_support_desc" },
  { icon: Tag, labelKey: "trust_price_title", descKey: "trust_price_desc" },
  { icon: RefreshCcw, labelKey: "trust_cancel_title", descKey: "trust_cancel_desc" },
];

export function TrustBadges() {
  const { t } = useLanguage();

  return (
    <section className="bg-background py-10 sm:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-4 sm:gap-6 sm:p-6">
          {BADGES.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.labelKey}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="flex items-start gap-2.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight text-foreground">{t(badge.labelKey)}</p>
                  <p className="mt-0.5 text-xs leading-tight text-muted-foreground">{t(badge.descKey)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
