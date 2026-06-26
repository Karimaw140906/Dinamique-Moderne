import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface SectionConfig {
  id: string;
  label_fr: string;
  label_en: string;
  label_es: string;
  emoji: string;
  visible: boolean;
  in_navbar: boolean;
  section_order: number;
  is_custom: boolean;
  type: string;
  href?: string;
}

const DEFAULTS: SectionConfig[] = [
  { id:"stats",        label_fr:"Statistiques",    label_en:"Stats",          label_es:"Estadísticas",   emoji:"📊", visible:true,  in_navbar:false, section_order:0,  is_custom:false, type:"builtin" },
  { id:"tours",        label_fr:"Nos Tours",       label_en:"Our Tours",      label_es:"Nuestros Tours", emoji:"🗺️", visible:true,  in_navbar:true,  section_order:1,  is_custom:false, type:"builtin" },
  { id:"transport",    label_fr:"Transport",       label_en:"Transport",      label_es:"Transporte",     emoji:"🚗", visible:true,  in_navbar:false, section_order:2,  is_custom:false, type:"builtin" },
  { id:"destinations", label_fr:"Destinations",    label_en:"Destinations",   label_es:"Destinos",       emoji:"📍", visible:true,  in_navbar:true,  section_order:3,  is_custom:false, type:"builtin" },
  { id:"team",         label_fr:"Notre Équipe",    label_en:"Our Team",       label_es:"Nuestro Equipo", emoji:"👥", visible:true,  in_navbar:true,  section_order:4,  is_custom:false, type:"builtin" },
  { id:"restaurants",  label_fr:"Restaurants",     label_en:"Restaurants",    label_es:"Restaurantes",   emoji:"🍽️", visible:true,  in_navbar:false, section_order:5,  is_custom:false, type:"builtin" },
  { id:"hotels",       label_fr:"Hébergements",    label_en:"Accommodations", label_es:"Alojamientos",   emoji:"🏨", visible:true,  in_navbar:false, section_order:6,  is_custom:false, type:"builtin" },
  { id:"food",         label_fr:"Commander Repas", label_en:"Order Food",     label_es:"Ordenar Comida", emoji:"🛒", visible:true,  in_navbar:false, section_order:7,  is_custom:false, type:"builtin" },
  { id:"activities",   label_fr:"Activités",       label_en:"Activities",     label_es:"Actividades",    emoji:"🎯", visible:true,  in_navbar:false, section_order:8,  is_custom:false, type:"builtin" },
  { id:"testimonials", label_fr:"Témoignages",     label_en:"Testimonials",   label_es:"Testimonios",    emoji:"⭐", visible:true,  in_navbar:false, section_order:9,  is_custom:false, type:"builtin" },
];

export function useSiteSections() {
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from("site_sections")
        .select("*")
        .order("section_order");
      if (!error && data && data.length > 0) setSections(data as SectionConfig[]);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateSection = async (id: string, changes: Partial<SectionConfig>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s));
    await supabase.from("site_sections").update({ ...changes, updated_at: new Date().toISOString() }).eq("id", id);
  };

  const reorder = async (id: string, direction: "up" | "down") => {
    const sorted = [...sections].sort((a, b) => a.section_order - b.section_order);
    const idx = sorted.findIndex(s => s.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    const newOrder = sections.map(s => {
      if (s.id === a.id) return { ...s, section_order: b.section_order };
      if (s.id === b.id) return { ...s, section_order: a.section_order };
      return s;
    });
    setSections(newOrder);
    await Promise.all([
      supabase.from("site_sections").update({ section_order: b.section_order }).eq("id", a.id),
      supabase.from("site_sections").update({ section_order: a.section_order }).eq("id", b.id),
    ]);
  };

  const addCustom = async (s: Omit<SectionConfig, "id" | "section_order">) => {
    const id = "custom_" + Date.now();
    const newS: SectionConfig = { ...s, id, section_order: sections.length };
    setSections(prev => [...prev, newS]);
    await supabase.from("site_sections").insert(newS);
  };

  const deleteCustom = async (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    await supabase.from("site_sections").delete().eq("id", id);
  };

  return { sections, loading, updateSection, reorder, addCustom, deleteCustom, reload: load };
}
