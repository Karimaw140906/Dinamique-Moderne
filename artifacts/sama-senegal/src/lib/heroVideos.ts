import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const HERO_CATEGORIES = [
  { key: "accueil", label: "Accueil (Home)" },
  { key: "destinations", label: "Destinations" },
  { key: "activites", label: "Activités" },
  { key: "restaurants", label: "Restaurants" },
  { key: "transport", label: "Transport" },
  { key: "evenements", label: "Événements" },
  { key: "hebergements", label: "Hébergements" },
] as const;

export type HeroCategoryKey = typeof HERO_CATEGORIES[number]["key"];

const SETTING_PREFIX = "hero_video_";

export async function getHeroVideoUrl(category?: HeroCategoryKey): Promise<string | null> {
  if (!category) return null;
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", `${SETTING_PREFIX}${category}`)
      .maybeSingle();
    if (error || !data || !data.value) return null;
    return data.value;
  } catch {
    return null;
  }
}

export async function getAllHeroVideoUrls(): Promise<Record<string, string>> {
  try {
    const keys = HERO_CATEGORIES.map((c) => `${SETTING_PREFIX}${c.key}`);
    const { data, error } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", keys);
    if (error || !data) return {};
    const map: Record<string, string> = {};
    data.forEach((row: any) => {
      const cat = row.key.replace(SETTING_PREFIX, "");
      map[cat] = row.value;
    });
    return map;
  } catch {
    return {};
  }
}

export async function uploadHeroVideo(category: HeroCategoryKey, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "mp4";
  const path = `${category}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("hero-videos")
    .upload(path, file, { upsert: true, contentType: file.type || "video/mp4" });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("hero-videos").getPublicUrl(path);
  const publicUrl = data.publicUrl;

  const { error: settingError } = await supabase
    .from("site_settings")
    .upsert({ key: `${SETTING_PREFIX}${category}`, value: publicUrl }, { onConflict: "key" });
  if (settingError) throw settingError;

  return publicUrl;
}

export async function removeHeroVideo(category: HeroCategoryKey): Promise<void> {
  await supabase
    .from("site_settings")
    .upsert({ key: `${SETTING_PREFIX}${category}`, value: "" }, { onConflict: "key" });
}

export function useHeroVideo(category?: HeroCategoryKey) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    getHeroVideoUrl(category).then((u) => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [category]);
  return url;
}
