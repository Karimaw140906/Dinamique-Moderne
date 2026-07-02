import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type SectionKey = "restaurants" | "hotels" | "activities" | "transport" | "tours" | "menu" | "destinations" | "events";

const cache: Record<string, boolean> = {};
let loaded = false;

export function useSiteSection(key: SectionKey): boolean {
  const [active, setActive] = useState<boolean>(true);

  useEffect(() => {
    if (loaded && key in cache) {
      setActive(cache[key]);
      return;
    }
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("site_sections")
          .select("key, active");
        if (!error && data && data.length > 0) {
          data.forEach((row) => { cache[row.key] = row.active; });
          loaded = true;
          setActive(cache[key] ?? true);
        }
      } catch {
        // réseau KO → reste visible
      }
    };
    load();
  }, [key]);

  return active;
}
