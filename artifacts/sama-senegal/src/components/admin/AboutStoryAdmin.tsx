import { useState, useEffect } from "react";
import {
  BookOpen, Save, RefreshCw, Plus, Trash2, Award, Users, MapPin,
  Star, Calendar, Globe, Newspaper, Share2, Link as LinkIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const STAT_ICONS: Record<string, any> = { Award, Users, MapPin, Star, Calendar, Globe };
const STAT_ICON_KEYS = Object.keys(STAT_ICONS);

const SOCIAL_PLATFORMS = ["Instagram", "Facebook", "TikTok", "YouTube", "LinkedIn", "WhatsApp", "Site web"];

interface StatItem { icon: string; value: string; label_fr: string; label_en: string; label_es: string }
interface PressItem { title: string; source: string; url: string }
interface SocialItem { platform: string; url: string }

const DEFAULT_MISSION = { fr: "", en: "", es: "" };
const DEFAULT_STATS: StatItem[] = [];
const DEFAULT_PRESS: PressItem[] = [];
const DEFAULT_SOCIALS: SocialItem[] = [];

function parseJSON<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

export function AboutStoryAdmin() {
  const [mission, setMission] = useState(DEFAULT_MISSION);
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [press, setPress] = useState<PressItem[]>(DEFAULT_PRESS);
  const [socials, setSocials] = useState<SocialItem[]>(DEFAULT_SOCIALS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [source, setSource] = useState<"supabase" | "local">("local");

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", ["about_mission", "about_stats", "about_press", "about_socials"]);
      if (!error && data && data.length > 0) {
        const map: Record<string, string> = {};
        data.forEach((row: any) => { map[row.key] = row.value; });
        setMission(parseJSON(map.about_mission, DEFAULT_MISSION));
        setStats(parseJSON(map.about_stats, DEFAULT_STATS));
        setPress(parseJSON(map.about_press, DEFAULT_PRESS));
        setSocials(parseJSON(map.about_socials, DEFAULT_SOCIALS));
        setSource("supabase");
        setLoading(false);
        return;
      }
    } catch {}
    try {
      const raw = localStorage.getItem("aboutStory");
      if (raw) {
        const parsed = JSON.parse(raw);
        setMission(parsed.mission || DEFAULT_MISSION);
        setStats(parsed.stats || DEFAULT_STATS);
        setPress(parsed.press || DEFAULT_PRESS);
        setSocials(parsed.socials || DEFAULT_SOCIALS);
      }
    } catch {}
    setSource("local");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveAll = async () => {
    setSaving(true);
    const payload = {
      about_mission: JSON.stringify(mission),
      about_stats: JSON.stringify(stats),
      about_press: JSON.stringify(press),
      about_socials: JSON.stringify(socials),
    };
    try {
      const rows = Object.entries(payload).map(([key, value]) => ({
        key, value, updated_at: new Date().toISOString(),
      }));
      await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      setSource("supabase");
    } catch {}
    localStorage.setItem("aboutStory", JSON.stringify({ mission, stats, press, socials }));
    window.dispatchEvent(new Event("aboutStoryUpdated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const addStat = () => {
    if (stats.length >= 4) return;
    setStats([...stats, { icon: "Award", value: "", label_fr: "", label_en: "", label_es: "" }]);
  };
  const updateStat = (i: number, field: keyof StatItem, value: string) => {
    setStats(stats.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };
  const removeStat = (i: number) => setStats(stats.filter((_, idx) => idx !== i));

  const addPress = () => setPress([...press, { title: "", source: "", url: "" }]);
  const updatePress = (i: number, field: keyof PressItem, value: string) => {
    setPress(press.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };
  const removePress = (i: number) => setPress(press.filter((_, idx) => idx !== i));

  const addSocial = () => setSocials([...socials, { platform: "Instagram", url: "" }]);
  const updateSocial = (i: number, field: keyof SocialItem, value: string) => {
    setSocials(socials.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };
  const removeSocial = (i: number) => setSocials(socials.filter((_, idx) => idx !== i));

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <RefreshCw className="w-8 h-8 animate-spin opacity-30" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${
          source === "supabase" ? "bg-green-50 text-green-600 border border-green-200" : "bg-yellow-50 text-yellow-600 border border-yellow-200"
        }`}>
          {source === "supabase" ? "✅ Supabase" : "⚠️ Local"}
        </div>
        <button onClick={saveAll} disabled={saving}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-colors ${saved ? "bg-green-500" : "bg-[#6C3EF5] hover:bg-[#8B5CF6]"} disabled:opacity-50`}>
          <Save className="w-4 h-4" /> {saved ? "Enregistré ✓" : saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <p className="text-xs text-gray-400 -mt-2">
        Ce contenu s'affiche sur la page publique "À propos", avant l'équipe et les témoignages — c'est la première impression que les clients ont de vous.
      </p>

      {/* Notre histoire / mission */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg border-b pb-3 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#6C3EF5]" /> Notre histoire / mission
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Français</label>
            <textarea value={mission.fr} onChange={(e) => setMission({ ...mission, fr: e.target.value })} rows={4}
              placeholder="Racontez qui vous êtes, votre parcours, ce qui vous distingue..."
              className="w-full mt-1 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">English</label>
            <textarea value={mission.en} onChange={(e) => setMission({ ...mission, en: e.target.value })} rows={3}
              className="w-full mt-1 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Español</label>
            <textarea value={mission.es} onChange={(e) => setMission({ ...mission, es: e.target.value })} rows={3}
              className="w-full mt-1 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
          </div>
        </div>
      </div>

      {/* Chiffres clés */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-[#F5B942]" /> Chiffres clés
          </h2>
          <button onClick={addStat} disabled={stats.length >= 4}
            className="flex items-center gap-1 text-xs font-bold text-[#6C3EF5] hover:underline disabled:opacity-30 disabled:no-underline">
            <Plus className="w-3.5 h-3.5" /> Ajouter (max 4)
          </button>
        </div>
        {stats.length === 0 && <p className="text-sm text-gray-400 italic">Aucun chiffre clé. Ex : "5 ans d'expérience", "500+ clients satisfaits".</p>}
        <div className="space-y-4">
          {stats.map((s, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <select value={s.icon} onChange={(e) => updateStat(i, "icon", e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white">
                  {STAT_ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <input type="text" value={s.value} onChange={(e) => updateStat(i, "value", e.target.value)}
                  placeholder="ex: 500+" className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold" />
                <input type="text" value={s.label_fr} onChange={(e) => updateStat(i, "label_fr", e.target.value)}
                  placeholder="Libellé FR" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                <button onClick={() => removeStat(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 pl-1">
                <input type="text" value={s.label_en} onChange={(e) => updateStat(i, "label_en", e.target.value)}
                  placeholder="Label EN" className="flex-1 border border-gray-100 rounded-lg px-2 py-1 text-xs text-gray-500" />
                <input type="text" value={s.label_es} onChange={(e) => updateStat(i, "label_es", e.target.value)}
                  placeholder="Label ES" className="flex-1 border border-gray-100 rounded-lg px-2 py-1 text-xs text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Presse & distinctions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#C2622D]" /> Presse & distinctions
          </h2>
          <button onClick={addPress} className="flex items-center gap-1 text-xs font-bold text-[#6C3EF5] hover:underline">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
        {press.length === 0 && <p className="text-sm text-gray-400 italic">Ex : "Vu dans Jeune Afrique", "Prix du meilleur guide 2025".</p>}
        <div className="space-y-3">
          {press.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={p.title} onChange={(e) => updatePress(i, "title", e.target.value)}
                placeholder="Titre / distinction" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
              <input type="text" value={p.source} onChange={(e) => updatePress(i, "source", e.target.value)}
                placeholder="Source" className="w-32 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
              <input type="url" value={p.url} onChange={(e) => updatePress(i, "url", e.target.value)}
                placeholder="Lien (optionnel)" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
              <button onClick={() => removePress(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#6C3EF5]" /> Réseaux sociaux
          </h2>
          <button onClick={addSocial} className="flex items-center gap-1 text-xs font-bold text-[#6C3EF5] hover:underline">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
        {socials.length === 0 && <p className="text-sm text-gray-400 italic">Ajoute tes liens Instagram, Facebook, TikTok, etc.</p>}
        <div className="space-y-3">
          {socials.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <select value={s.platform} onChange={(e) => updateSocial(i, "platform", e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white w-36 shrink-0">
                {SOCIAL_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="flex-1 relative">
                <LinkIcon className="w-3.5 h-3.5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={s.url} onChange={(e) => updateSocial(i, "url", e.target.value)}
                  placeholder="https://... ou @nom_de_compte"
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-2 py-1.5 text-sm" />
              </div>
              <button onClick={() => removeSocial(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
