import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Award, Users, MapPin, Star, Calendar, Globe, Newspaper,
  Instagram, Facebook, Youtube, Linkedin, MessageCircle, Link as LinkIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";

const STAT_ICONS: Record<string, any> = { Award, Users, MapPin, Star, Calendar, Globe };
const SOCIAL_ICONS: Record<string, any> = {
  Instagram, Facebook, YouTube: Youtube, LinkedIn: Linkedin, WhatsApp: MessageCircle, "Site web": LinkIcon, TikTok: LinkIcon,
};

interface StatItem { icon: string; value: string; label_fr: string; label_en: string; label_es: string }
interface PressItem { title: string; source: string; url: string }
interface SocialItem { platform: string; url: string }

interface AboutStoryData {
  mission: { fr: string; en: string; es: string };
  stats: StatItem[];
  press: PressItem[];
  socials: SocialItem[];
}

const EMPTY: AboutStoryData = { mission: { fr: "", en: "", es: "" }, stats: [], press: [], socials: [] };

function parseJSON<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

async function loadAboutStory(): Promise<AboutStoryData> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .in("key", ["about_mission", "about_stats", "about_press", "about_socials"]);
    if (!error && data && data.length > 0) {
      const map: Record<string, string> = {};
      data.forEach((row: any) => { map[row.key] = row.value; });
      return {
        mission: parseJSON(map.about_mission, EMPTY.mission),
        stats: parseJSON(map.about_stats, EMPTY.stats),
        press: parseJSON(map.about_press, EMPTY.press),
        socials: parseJSON(map.about_socials, EMPTY.socials),
      };
    }
  } catch {}
  try {
    const raw = localStorage.getItem("aboutStory");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        mission: parsed.mission || EMPTY.mission,
        stats: parsed.stats || EMPTY.stats,
        press: parsed.press || EMPTY.press,
        socials: parsed.socials || EMPTY.socials,
      };
    }
  } catch {}
  return EMPTY;
}

function socialHref(platform: string, url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  const handle = url.replace(/^@/, "");
  switch (platform) {
    case "Instagram": return `https://instagram.com/${handle}`;
    case "Facebook": return `https://facebook.com/${handle}`;
    case "TikTok": return `https://tiktok.com/@${handle}`;
    case "YouTube": return `https://youtube.com/${handle}`;
    case "LinkedIn": return `https://linkedin.com/${handle}`;
    case "WhatsApp": return `https://wa.me/${handle.replace(/[^0-9]/g, "")}`;
    default: return url;
  }
}

export function AboutStory() {
  const { language } = useLanguage();
  const [data, setData] = useState<AboutStoryData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = () => loadAboutStory().then((d) => { if (mounted) { setData(d); setLoading(false); } });
    load();
    window.addEventListener("aboutStoryUpdated", load);
    return () => { mounted = false; window.removeEventListener("aboutStoryUpdated", load); };
  }, []);

  if (loading) return null;

  const mission = language === "EN" ? data.mission.en : language === "ES" ? data.mission.es : data.mission.fr;
  const hasContent = mission || data.stats.length > 0 || data.press.length > 0 || data.socials.length > 0;
  if (!hasContent) return null;

  return (
    <section className="py-24 bg-foreground text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#F5B942 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
        {mission && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Notre histoire</span>
            <p className="text-2xl md:text-3xl font-serif italic font-medium text-white/90 mt-4 max-w-3xl mx-auto leading-relaxed">
              "{mission}"
            </p>
          </motion.div>
        )}

        {data.stats.length > 0 && (
          <div className={`grid grid-cols-2 md:grid-cols-${data.stats.length} gap-6 mb-16`}>
            {data.stats.map((s, i) => {
              const Icon = STAT_ICONS[s.icon] || Award;
              const label = language === "EN" ? s.label_en : language === "ES" ? s.label_es : s.label_fr;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm"
                >
                  <Icon className="w-7 h-7 text-secondary mx-auto mb-3" />
                  <div className="text-3xl font-serif font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/50 mt-1 uppercase tracking-wide">{label}</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {data.press.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Newspaper className="w-4 h-4 text-secondary" />
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Ils parlent de nous</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {data.press.map((p, i) => {
                const content = (
                  <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center hover:bg-white/10 transition-colors">
                    <div className="text-sm font-bold text-white">{p.title}</div>
                    {p.source && <div className="text-xs text-secondary mt-0.5">{p.source}</div>}
                  </div>
                );
                return p.url ? (
                  <a key={i} href={p.url} target="_blank" rel="noreferrer">{content}</a>
                ) : (
                  <div key={i}>{content}</div>
                );
              })}
            </div>
          </div>
        )}

        {data.socials.length > 0 && (
          <div className="flex justify-center gap-4">
            {data.socials.map((s, i) => {
              const Icon = SOCIAL_ICONS[s.platform] || LinkIcon;
              return (
                <a key={i} href={socialHref(s.platform, s.url)} target="_blank" rel="noreferrer"
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-foreground hover:border-secondary transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
