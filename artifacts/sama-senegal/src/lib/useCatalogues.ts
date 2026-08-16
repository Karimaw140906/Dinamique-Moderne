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
