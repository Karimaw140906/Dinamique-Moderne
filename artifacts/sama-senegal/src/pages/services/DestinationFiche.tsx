import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { MapPin, Clock } from "lucide-react";

export default function DestinationFiche() {
  const [, params] = useRoute("/destinations/:id");
  const { language } = useLanguage();
  const [dest, setDest] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    Promise.all([
      supabase.from("destinations").select("*").eq("id", params.id).single(),
      supabase.from("destination_sections").select("*").eq("destination_id", params.id).order("position"),
    ]).then(([destRes, sectionsRes]) => {
      setDest(destRes.data);
      setSections(sectionsRes.data || []);
      setLoading(false);
    });
  }, [params?.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!dest) return <div className="min-h-screen flex items-center justify-center">Destination introuvable.</div>;

  const desc = language === "EN" ? (dest.desc_en || dest.desc_fr) : language === "ES" ? (dest.desc_es || dest.desc_fr) : dest.desc_fr;

  const sectionText = (s: any, field: "title" | "content") => {
    if (language === "EN") return s[`${field}_en`] || s[`${field}_fr`];
    if (language === "ES") return s[`${field}_es`] || s[`${field}_fr`];
    return s[`${field}_fr`];
  };

  return (
    <div className="min-h-screen bg-[#2B1B4D]">
      {dest.photo && <img src={dest.photo} alt={dest.name} className="w-full h-56 sm:h-72 md:h-96 lg:h-[30rem] object-cover" />}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-serif font-bold text-[#0B0A14]">{dest.name}</h1>
            <span className="text-yellow-500">{"⭐".repeat(dest.rating || 5)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {dest.region && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F5B942]" /> {dest.region}
              </div>
            )}
            {dest.recommended_days && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F5B942]" /> {dest.recommended_days} jour{dest.recommended_days > 1 ? "s" : ""} recommandé{dest.recommended_days > 1 ? "s" : ""}
              </div>
            )}
            {dest.category && (
              <span className="px-2 py-1 bg-[#6C3EF5]/10 text-[#6C3EF5] rounded-full text-xs font-semibold capitalize">{dest.category}</span>
            )}
          </div>
          <p className="text-gray-600">{desc}</p>
          <div className="flex flex-wrap gap-2">
            {(dest.highlights || []).map((h: string) => (
              <span key={h} className="text-xs bg-gray-50 px-2 py-1 rounded-md border text-gray-600">{h}</span>
            ))}
          </div>
          {(dest.gallery || []).length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              {dest.gallery.map((g: string, i: number) => (
                <img key={i} src={g} className="w-full h-24 object-cover rounded-lg" alt="" />
              ))}
            </div>
          )}
        </div>

        {sections.length > 0 && (
          <div className="mt-6 space-y-3">
            {sections.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-md p-5">
                <h3 className="text-lg font-bold text-[#0B0A14] flex items-center gap-2 mb-2">
                  <span>{s.icon || "📌"}</span> {sectionText(s, "title")}
                </h3>
                <p className="text-gray-600 text-sm whitespace-pre-line">{sectionText(s, "content")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
