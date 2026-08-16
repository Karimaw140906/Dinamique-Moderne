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
