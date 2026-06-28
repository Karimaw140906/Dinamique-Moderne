import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useBooking } from "@/pages/Home";
import { useSupabaseData, DEFAULT_HOTELS, DEFAULT_RESTAURANTS, DEFAULT_TRANSPORT, DEFAULT_ACTIVITIES } from "@/lib/useSupabaseData";
import { ArrowRight, MapPin, Calendar, Users, Search, Compass, UtensilsCrossed, Car, Map } from "lucide-react";

// Onglets de la barre de recherche flottante.
// "Guides" est volontairement absent : couche interne du système (attribution
// auto/admin), jamais un service sélectionnable par le touriste.
const SEARCH_TABS = [
  { id: "tours", labelKey: "search_tab_tours", icon: Map, anchor: "#tours" },
  { id: "activities", labelKey: "search_tab_activities", icon: Compass, anchor: "#activites" },
  { id: "restaurants", labelKey: "search_tab_restaurants", icon: UtensilsCrossed, anchor: "#restaurants" },
  { id: "transport", labelKey: "search_tab_transport", icon: Car, anchor: "#transport" },
] as const;

function FloatingSearchBar() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [destination, setDestination] = useState("");

  const handleSearch = () => {
    const anchor = SEARCH_TABS[activeTab].anchor;
    document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
      className="relative z-20 mx-auto w-full max-w-5xl rounded-2xl bg-card p-3 shadow-xl sm:p-4 lg:p-5"
    >
      {/* Onglets — défilement tactile horizontal sur mobile */}
      <div className="-mx-1 mb-3 flex gap-1 overflow-x-auto px-1 sm:gap-2">
        {SEARCH_TABS.map((tab, i) => {
          const Icon = tab.icon;
          const active = i === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(i)}
              data-testid={`button-search-tab-${tab.id}`}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-secondary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[2fr_1.2fr_1fr_auto]">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={t("search_destination")}
            data-testid="input-search-destination"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3">
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t("search_date")}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3">
          <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm text-foreground">2 {t("search_people_unit")}</span>
        </div>
        <button
          type="button"
          onClick={handleSearch}
          data-testid="button-search-submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:col-span-2 lg:col-span-1"
        >
          <Search className="h-4 w-4" />
          {t("search_button")}
        </button>
      </div>
    </motion.div>
  );
}

export function Hero() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();

  // Compteurs réels pour le badge de confiance, basés sur les mêmes données
  // que le reste du site (Supabase via useSupabaseData, fallback localStorage).
  const { data: hotels } = useSupabaseData("hotels", DEFAULT_HOTELS, { column: "active", value: true });
  const { data: restaurants } = useSupabaseData("restaurants", DEFAULT_RESTAURANTS, { column: "active", value: true });
  const { data: transport } = useSupabaseData("transport", DEFAULT_TRANSPORT, { column: "active", value: true });
  const { data: activities } = useSupabaseData("activities", DEFAULT_ACTIVITIES, { column: "active", value: true });

  const totalServices = hotels.length + restaurants.length + transport.length + activities.length;

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden pb-28 sm:pb-20 lg:pb-16">
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-goree.png"
          alt="Gorée Island Coast"
          className="h-full w-full scale-105 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E]/90 via-[#1A1A2E]/70 to-[#2C7A5C]/60" />
      </div>

      <div className="container relative z-10 mx-auto flex flex-1 flex-col px-4 pt-28 md:px-6 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mx-auto max-w-2xl space-y-5 text-center lg:max-w-3xl"
        >
          <div className="inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary backdrop-blur-sm">
            <span>✨ {t("hero_badge")}</span>
          </div>

          <h1 className="font-serif text-5xl italic leading-none tracking-tight text-white drop-shadow-lg sm:text-7xl lg:text-8xl">
            Xam suñu tiossane
          </h1>

          <p className="mx-auto max-w-xl text-lg font-light tracking-wide text-white/90 sm:text-2xl">
            {t("hero_subtitle")}
          </p>

          {totalServices > 0 && (
            <p className="text-sm font-medium text-white/70">
              {totalServices}+ services · ★ 4.8/5
            </p>
          )}

          <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
            <button
              onClick={() => openBooking()}
              data-testid="button-hero-book"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-7 text-base font-bold text-secondary-foreground transition-colors hover:bg-secondary/90 sm:w-auto"
            >
              {t("hero_book")}
              <ArrowRight className="h-5 w-5" />
            </button>
            <a
              href="#tours"
              onClick={(e) => { e.preventDefault(); document.querySelector("#tours")?.scrollIntoView({ behavior: "smooth" }); }}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 text-base font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:w-auto"
            >
              {t("hero_discover")}
            </a>
          </div>
        </motion.div>

        {/* La barre de recherche flotte au-dessus du bord inférieur du hero,
            empiétant légèrement sur la section suivante (comme la maquette). */}
        <div className="mt-10 px-0 sm:mt-12 lg:mt-14">
          <FloatingSearchBar />
        </div>
      </div>
    </section>
  );
}
