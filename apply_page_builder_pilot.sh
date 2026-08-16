#!/bin/bash
set -e

echo "=========================================="
echo "  APPLICATION DU PILOTE HERO/CATALOGUES"
echo "=========================================="

if [ ! -f "src/components/Hero.tsx" ]; then
  echo "ERREUR: lancez ce script depuis artifacts/sama-senegal (src/components/Hero.tsx introuvable ici)."
  exit 1
fi

mkdir -p src/lib src/components

echo "-> src/lib/useDeviceType.ts"
cat > src/lib/useDeviceType.ts << 'DEVICE_EOF'
import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

function computeDevice(): DeviceType {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function useDeviceType(): DeviceType {
  const [device, setDevice] = useState<DeviceType>(computeDevice);

  useEffect(() => {
    const onResize = () => setDevice(computeDevice());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return device;
}
DEVICE_EOF

echo "-> src/lib/usePageConfig.ts"
cat > src/lib/usePageConfig.ts << 'PAGECONFIG_EOF'
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface HeroButton {
  label: string;
  link: string;
  style?: "primary" | "secondary";
}

export interface HeroClassic {
  background_image: string;
  title: string;
  subtitle: string;
  buttons: HeroButton[];
}

export interface HeroOfferCustom {
  image: string;
  title: string;
  description: string;
  price: number | null;
  discount: number | null;
  badge: string;
  button: { label: string; link: string };
  valid_from: string | null;
  valid_until: string | null;
}

export interface PageConfig {
  id: string;
  slug: string;
  title: string;
  hero_type: "classic" | "special_offer";
  hero_classic: HeroClassic;
  hero_offer_mode: "existing_offer" | "custom" | null;
  hero_offer_id: string | null;
  hero_offer_custom: HeroOfferCustom;
  layout_key: string;
  layout_props: Record<string, any>;
  layout_responsive: { mobile?: string; tablet?: string; desktop?: string };
  status: "draft" | "published";
}

const DEFAULT_CONFIG: Omit<PageConfig, "id" | "slug" | "title"> = {
  hero_type: "classic",
  hero_classic: { background_image: "", title: "", subtitle: "", buttons: [] },
  hero_offer_mode: null,
  hero_offer_id: null,
  hero_offer_custom: {
    image: "", title: "", description: "", price: null, discount: null,
    badge: "", button: { label: "", link: "" }, valid_from: null, valid_until: null,
  },
  layout_key: "grid_classic",
  layout_props: {},
  layout_responsive: {},
  status: "published",
};

export function usePageConfig(slug: string) {
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("page_configs")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        setConfig(data as PageConfig);
      } else {
        setConfig({ id: "", slug, title: slug, ...DEFAULT_CONFIG });
      }
    } catch {
      setConfig({ id: "", slug, title: slug, ...DEFAULT_CONFIG });
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    const channel = supabase
      .channel(`page-config-${slug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "page_configs", filter: `slug=eq.${slug}` },
        () => { fetchConfig(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [slug, fetchConfig]);

  return { config, loading, refetch: fetchConfig };
}
PAGECONFIG_EOF

echo "-> src/lib/useCatalogues.ts"
cat > src/lib/useCatalogues.ts << 'CATALOGUES_HOOK_EOF'
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Catalogue {
  id: string;
  page_id: string;
  name: string;
  image: string | null;
  description: string | null;
  icon: string | null;
  link: string | null;
  display_order: number;
  active: boolean;
}

export function useCatalogues(pageSlug: string) {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCatalogues = useCallback(async () => {
    try {
      const { data: page, error: pageError } = await supabase
        .from("page_configs")
        .select("id")
        .eq("slug", pageSlug)
        .maybeSingle();

      if (pageError || !page) {
        setCatalogues([]);
        return;
      }

      const { data, error } = await supabase
        .from("catalogues")
        .select("*")
        .eq("page_id", page.id)
        .eq("active", true)
        .order("display_order", { ascending: true });

      setCatalogues(!error && data ? (data as Catalogue[]) : []);
    } catch {
      setCatalogues([]);
    } finally {
      setLoading(false);
    }
  }, [pageSlug]);

  useEffect(() => {
    fetchCatalogues();
  }, [fetchCatalogues]);

  useEffect(() => {
    const channel = supabase
      .channel(`catalogues-${pageSlug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "catalogues" },
        () => { fetchCatalogues(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [pageSlug, fetchCatalogues]);

  return { catalogues, loading, refetch: fetchCatalogues };
}
CATALOGUES_HOOK_EOF

echo "-> src/components/Hero.tsx (remplacement, backup conserve)"
cp src/components/Hero.tsx "src/components/Hero.tsx.backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
cat > src/components/Hero.tsx << 'HERO_EOF'
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useBooking } from "@/context/BookingContext";
import { ArrowRight, Star, MapPin, ShieldCheck, PlayCircle, Tag } from "lucide-react";
import { useHeroVideo } from "@/lib/heroVideos";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { usePageConfig, type PageConfig } from "@/lib/usePageConfig";

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

async function loadExistingOffer(offerId: string) {
  try {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("id", offerId)
      .maybeSingle();
    if (!error && data) return data;
    return null;
  } catch {
    return null;
  }
}

interface HeroContentProps {
  config: PageConfig | null;
}

function ClassicHero({ config }: HeroContentProps) {
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

  const defaultTitles: Record<string, string> = {
    FR: "Découvrez le Sénégal Autrement",
    EN: "Discover Senegal, Differently",
    ES: "Descubre Senegal de Otra Manera",
  };
  const defaultSubtitles: Record<string, string> = {
    FR: "Gorée, le Lac Rose, Casamance et bien plus — vivez le Sénégal authentique, en toute simplicité.",
    EN: "Gorée, Pink Lake, Casamance and more — experience authentic Senegal, made simple.",
    ES: "Gorée, el Lago Rosa, Casamance y más — vive el Senegal auténtico, sin complicaciones.",
  };
  const videoLabels: Record<string, string> = {
    FR: "Voir la vidéo", EN: "Watch the video", ES: "Ver el video",
  };
  const statLabels: Record<string, { travelers: string; rating: string; sites: string }> = {
    FR: { travelers: "Voyageurs", rating: "Note moyenne", sites: "Sites couverts" },
    EN: { travelers: "Travelers", rating: "Average rating", sites: "Sites covered" },
    ES: { travelers: "Viajeros", rating: "Valoración media", sites: "Sitios cubiertos" },
  };
  const labels = statLabels[language] || statLabels.FR;

  const classic = config?.hero_classic;
  const title = classic?.title?.trim() || defaultTitles[language] || defaultTitles.FR;
  const subtitle = classic?.subtitle?.trim() || defaultSubtitles[language] || defaultSubtitles.FR;
  const bgImage = classic?.background_image?.trim() || "/hero-renaissance.png";
  const buttons = classic?.buttons && classic.buttons.length > 0 ? classic.buttons : null;

  const hasStats = stats.travelers > 0 || stats.rating > 0 || stats.sites > 0;
  const showVideo = playing && !!videoUrl;

  return (
    <section className="relative min-h-[110dvh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {showVideo ? (
          <video src={videoUrl!} autoPlay loop muted playsInline className="w-full h-full object-cover object-center" />
        ) : (
          <img src={bgImage} alt={title} className="w-full h-full object-cover object-[75%_center] sm:object-[65%_center] lg:object-center" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/85 via-brand-dark/65 to-brand-violet-glow/50" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 pb-24 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-center lg:text-left space-y-6">

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-brand-gold/20 backdrop-blur-sm border border-brand-gold/30 rounded-full px-5 py-2">
              <MapPin className="w-4 h-4 text-brand-gold" />
              <span className="text-brand-gold font-semibold text-sm tracking-wide">Le Sénégal vous accueille</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic font-bold text-white leading-tight tracking-tight drop-shadow-xl">
              {title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/80 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3 pt-2">
              {buttons ? (
                buttons.map((btn, i) => (
                  
                    key={i}
                    href={btn.link}
                    className={`flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 font-bold rounded-2xl text-base sm:text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 min-h-[52px] ${
                      btn.style === "secondary"
                        ? "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white"
                        : "bg-brand-gold hover:bg-brand-gold-dark text-white"
                    }`}>
                    {btn.label}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                ))
              ) : (
                <>
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
                </>
              )}
            </div>

            {stats.rating > 0 && (
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(stats.rating) ? "text-brand-gold fill-brand-gold" : "text-white/20"}`} />
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

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-violet-deep to-transparent z-10" />
    </section>
  );
}

function SpecialOfferHero({ config }: HeroContentProps) {
  const { openBooking } = useBooking();
  const [existingOffer, setExistingOffer] = useState<any>(null);

  const mode = config?.hero_offer_mode;
  const offerId = config?.hero_offer_id;

  useEffect(() => {
    if (mode === "existing_offer" && offerId) {
      loadExistingOffer(offerId).then(setExistingOffer);
    }
  }, [mode, offerId]);

  const custom = config?.hero_offer_custom;

  const display = mode === "existing_offer" && existingOffer
    ? {
        image: existingOffer.image || "/hero-renaissance.png",
        title: existingOffer.campaign_name || "",
        description: existingOffer.description || "",
        badge: existingOffer.discount_type === "percentage"
          ? `-${existingOffer.discount_value}%`
          : existingOffer.discount_type === "fixed"
            ? `-${existingOffer.discount_value} FCFA`
            : "Offert",
        buttonLabel: "Réserver maintenant",
        buttonLink: null,
      }
    : {
        image: custom?.image?.trim() || "/hero-renaissance.png",
        title: custom?.title?.trim() || "Offre spéciale",
        description: custom?.description || "",
        badge: custom?.badge || (custom?.discount ? `-${custom.discount}%` : ""),
        buttonLabel: custom?.button?.label?.trim() || "En profiter",
        buttonLink: custom?.button?.link?.trim() || null,
      };

  return (
    <section className="relative min-h-[110dvh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={display.image} alt={display.title} className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/90 via-brand-dark/70 to-brand-violet-glow/50" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        {display.badge && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-red-500 text-white font-black text-sm px-5 py-2 rounded-full shadow-lg">
            <Tag className="w-4 h-4" />
            {display.badge}
          </motion.div>
        )}

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic font-bold text-white leading-tight tracking-tight drop-shadow-xl">
          {display.title}
        </h1>

        {display.description && (
          <p className="text-base sm:text-lg md:text-xl text-white/80 font-light leading-relaxed max-w-2xl mx-auto">
            {display.description}
          </p>
        )}

        {(custom?.valid_until) && (
          <p className="text-white/60 text-sm">
            Offre valable jusqu'au {new Date(custom.valid_until).toLocaleDateString("fr-FR")}
          </p>
        )}

        {display.buttonLink ? (
          <a href={display.buttonLink}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-gold hover:bg-brand-gold-dark text-white font-bold rounded-2xl text-base sm:text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 min-h-[52px]">
            {display.buttonLabel}
            <ArrowRight className="w-5 h-5" />
          </a>
        ) : (
          <button onClick={() => openBooking(display.title)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-gold hover:bg-brand-gold-dark text-white font-bold rounded-2xl text-base sm:text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 min-h-[52px]">
            {display.buttonLabel}
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-violet-deep to-transparent z-10" />
    </section>
  );
}

interface HeroProps {
  pageSlug?: string;
}

export function Hero({ pageSlug = "accueil" }: HeroProps) {
  const { config, loading } = usePageConfig(pageSlug);

  if (loading || !config || config.hero_type === "classic") {
    return <ClassicHero config={config} />;
  }

  return <SpecialOfferHero config={config} />;
}
HERO_EOF

echo "-> src/components/catalogue-layouts.tsx"
cat > src/components/catalogue-layouts.tsx << 'LAYOUTS_EOF'
import { ArrowRight } from "lucide-react";
import type { Catalogue } from "@/lib/useCatalogues";

export interface CatalogueLayoutProps {
  catalogues: Catalogue[];
  layoutProps?: Record<string, any>;
}

function CatalogueCard({ catalogue, variant }: { catalogue: Catalogue; variant: "grid" | "big" | "small" | "list" }) {
  const content = (
    <>
      {catalogue.image && (
        <img
          src={catalogue.image}
          alt={catalogue.name}
          className={
            variant === "list"
              ? "w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shrink-0"
              : "w-full h-full object-cover absolute inset-0"
          }
        />
      )}
      <div className={variant === "list" ? "flex-1 min-w-0" : "relative z-10 mt-auto p-4 sm:p-5"}>
        {variant !== "list" && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />}
        <div className={variant !== "list" ? "relative z-10" : ""}>
          {catalogue.icon && <span className="text-xl mr-2">{catalogue.icon}</span>}
          <span className={`font-bold ${variant === "list" ? "text-gray-900 text-base" : "text-white text-lg sm:text-xl"}`}>
            {catalogue.name}
          </span>
          {catalogue.description && (
            <p className={`mt-1 text-sm ${variant === "list" ? "text-gray-500 line-clamp-2" : "text-white/80 line-clamp-2"}`}>
              {catalogue.description}
            </p>
          )}
        </div>
      </div>
      {variant === "list" && (
        <ArrowRight className="w-5 h-5 text-gray-300 shrink-0 self-center" />
      )}
    </>
  );

  const baseClasses =
    variant === "list"
      ? "flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
      : "relative flex flex-col overflow-hidden rounded-2xl bg-gray-200 group hover:shadow-lg transition-shadow";

  const sizeClasses =
    variant === "big" ? "aspect-[4/3]" : variant === "small" ? "aspect-square" : variant === "grid" ? "aspect-[4/5]" : "";

  const wrapperClasses = `${baseClasses} ${sizeClasses}`.trim();

  return catalogue.link ? (
    <a href={catalogue.link} className={wrapperClasses}>{content}</a>
  ) : (
    <div className={wrapperClasses}>{content}</div>
  );
}

export function GridClassicLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {catalogues.map((c) => <CatalogueCard key={c.id} catalogue={c} variant="grid" />)}
    </div>
  );
}

export function BigCardsLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
      {catalogues.map((c) => <CatalogueCard key={c.id} catalogue={c} variant="big" />)}
    </div>
  );
}

export function SmallCardsLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {catalogues.map((c) => <CatalogueCard key={c.id} catalogue={c} variant="small" />)}
    </div>
  );
}

export function ListLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="flex flex-col gap-3 max-w-3xl mx-auto">
      {catalogues.map((c) => <CatalogueCard key={c.id} catalogue={c} variant="list" />)}
    </div>
  );
}

export function CarouselLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
      {catalogues.map((c) => (
        <div key={c.id} className="snap-start shrink-0 w-64 sm:w-72">
          <CatalogueCard catalogue={c} variant="grid" />
        </div>
      ))}
    </div>
  );
}

export function MasonryLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
      {catalogues.map((c, i) => (
        <div key={c.id} className="mb-4 break-inside-avoid" style={{ marginTop: i % 3 === 1 ? "1.5rem" : 0 }}>
          <CatalogueCard catalogue={c} variant={i % 2 === 0 ? "grid" : "big"} />
        </div>
      ))}
    </div>
  );
}

export function MagazineLayout({ catalogues }: CatalogueLayoutProps) {
  if (catalogues.length === 0) return null;
  const [featured, ...rest] = catalogues;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="lg:row-span-2">
        <CatalogueCard catalogue={featured} variant="big" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {rest.slice(0, 4).map((c) => <CatalogueCard key={c.id} catalogue={c} variant="small" />)}
      </div>
    </div>
  );
}
LAYOUTS_EOF

echo "-> src/components/layoutRegistry.ts"
cat > src/components/layoutRegistry.ts << 'REGISTRY_EOF'
import {
  GridClassicLayout,
  MasonryLayout,
  BigCardsLayout,
  SmallCardsLayout,
  ListLayout,
  CarouselLayout,
  MagazineLayout,
  type CatalogueLayoutProps,
} from "./catalogue-layouts";

export const layoutRegistry: Record<string, React.ComponentType<CatalogueLayoutProps>> = {
  grid_classic: GridClassicLayout,
  masonry: MasonryLayout,
  big_cards: BigCardsLayout,
  small_cards: SmallCardsLayout,
  list: ListLayout,
  carousel: CarouselLayout,
  magazine: MagazineLayout,
};

export function resolveLayout(key: string): React.ComponentType<CatalogueLayoutProps> {
  return layoutRegistry[key] ?? layoutRegistry.grid_classic;
}
REGISTRY_EOF

echo "-> src/components/CataloguesSection.tsx"
cat > src/components/CataloguesSection.tsx << 'CATSECTION_EOF'
import { motion } from "framer-motion";
import { usePageConfig } from "@/lib/usePageConfig";
import { useCatalogues } from "@/lib/useCatalogues";
import { useDeviceType } from "@/lib/useDeviceType";
import { resolveLayout } from "./layoutRegistry";

interface CataloguesSectionProps {
  pageSlug: string;
  title?: string;
  subtitle?: string;
}

export function CataloguesSection({ pageSlug, title, subtitle }: CataloguesSectionProps) {
  const { config } = usePageConfig(pageSlug);
  const { catalogues, loading } = useCatalogues(pageSlug);
  const device = useDeviceType();

  if (loading || catalogues.length === 0) return null;

  const responsiveKey = config?.layout_responsive?.[device];
  const effectiveLayoutKey = responsiveKey || config?.layout_key || "grid_classic";
  const LayoutComponent = resolveLayout(effectiveLayoutKey);

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {(title || subtitle) && (
          <div className="text-center mb-8 md:mb-10">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {title && (
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold text-gray-900">
                  {title}
                </h2>
              )}
              {subtitle && <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-md mx-auto">{subtitle}</p>}
            </motion.div>
          </div>
        )}

        <LayoutComponent catalogues={catalogues} layoutProps={config?.layout_props} />
      </div>
    </section>
  );
}
CATSECTION_EOF

echo "-> Patch de src/pages/Home.tsx (ajout de CataloguesSection)"
python3 << 'PYEOF'
path = "src/pages/Home.tsx"
with open(path, "r") as f:
    content = f.read()

changed = False

if 'CataloguesSection' not in content:
    content = content.replace(
        'import { Hero } from "@/components/Hero";',
        'import { Hero } from "@/components/Hero";\nimport { CataloguesSection } from "@/components/CataloguesSection";'
    )
    content = content.replace(
        "<Stats />",
        '<Stats />\n      <CataloguesSection pageSlug="accueil" title="Explorez le Sénégal" subtitle="Des lieux d\'exception à découvrir" />'
    )
    changed = True

with open(path, "w") as f:
    f.write(content)

print("Home.tsx modifie." if changed else "Home.tsx deja a jour (rien a faire).")
PYEOF

echo ""
echo "=========================================="
echo "  TERMINE"
echo "  Lancez maintenant : pnpm dev"
echo "=========================================="
