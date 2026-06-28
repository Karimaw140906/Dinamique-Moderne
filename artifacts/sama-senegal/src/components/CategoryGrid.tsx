import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Map, Compass, UtensilsCrossed, Bed, Car } from "lucide-react";
import {
  useSupabaseData,
  DEFAULT_HOTELS,
  DEFAULT_RESTAURANTS,
  DEFAULT_TRANSPORT,
  DEFAULT_ACTIVITIES,
} from "@/lib/useSupabaseData";

// Catégories visibles par le touriste. "Guides" est volontairement exclu :
// le guide est attribué automatiquement ou administrativement, jamais choisi
// par le client comme un service indépendant.
function useCategories() {
  const { data: hotels } = useSupabaseData("hotels", DEFAULT_HOTELS, { column: "active", value: true });
  const { data: restaurants } = useSupabaseData("restaurants", DEFAULT_RESTAURANTS, { column: "active", value: true });
  const { data: transport } = useSupabaseData("transport", DEFAULT_TRANSPORT, { column: "active", value: true });
  const { data: activities } = useSupabaseData("activities", DEFAULT_ACTIVITIES, { column: "active", value: true });

  return [
    { id: "tours", icon: Map, labelKey: "category_tours", count: undefined, anchor: "#tours", accent: "bg-primary/10 text-primary" },
    { id: "activities", icon: Compass, labelKey: "category_activities", count: activities.length, anchor: "#activites", accent: "bg-secondary/10 text-secondary" },
    { id: "restaurants", icon: UtensilsCrossed, labelKey: "category_restaurants", count: restaurants.length, anchor: "#restaurants", accent: "bg-accent/10 text-accent" },
    { id: "hotels", icon: Bed, labelKey: "category_hotels", count: hotels.length, anchor: "#hebergements", accent: "bg-primary/10 text-primary" },
    { id: "transport", icon: Car, labelKey: "category_transport", count: transport.length, anchor: "#transport", accent: "bg-secondary/10 text-secondary" },
  ];
}

export function CategoryGrid() {
  const { t } = useLanguage();
  const categories = useCategories();

  const handleClick = (anchor: string) => {
    document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8 sm:mb-10">
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            {t("categories_title")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("categories_subtitle")}</p>
        </div>

        {/* Mobile : carrousel tactile horizontal. Desktop : grille. */}
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => handleClick(cat.anchor)}
                data-testid={`button-category-${cat.id}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex w-[148px] shrink-0 flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-md sm:w-auto"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${cat.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{t(cat.labelKey)}</span>
                  {typeof cat.count === "number" && cat.count > 0 && (
                    <span className="mt-0.5 block text-xs text-muted-foreground">{cat.count}+ {cat.count > 1 ? "options" : "option"}</span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
