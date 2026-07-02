import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { MapPin } from "lucide-react";

export default function DestinationFiche() {
  const [, params] = useRoute("/destinations/:id");
  const { language } = useLanguage();
  const [dest, setDest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    supabase.from("destinations").select("*").eq("id", params.id).single()
      .then(({ data }) => { setDest(data); setLoading(false); });
  }, [params?.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!dest) return <div className="min-h-screen flex items-center justify-center">Destination introuvable.</div>;

  const desc = language === "EN" ? (dest.desc_en || dest.desc_fr) : language === "ES" ? (dest.desc_es || dest.desc_fr) : dest.desc_fr;

  return (
    <div className="min-h-screen bg-[#2B1B4D]">
      {dest.photo && <img src={dest.photo} alt={dest.name} className="w-full h-72 object-cover" />}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-serif font-bold text-[#0B0A14]">{dest.name}</h1>
            <span className="text-yellow-500">{"⭐".repeat(dest.rating || 5)}</span>
          </div>
          {dest.region && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-[#F5B942]" /> {dest.region}
            </div>
          )}
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
      </div>
    </div>
  );
}
