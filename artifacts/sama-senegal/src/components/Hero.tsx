import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useBooking } from "@/context/BookingContext";
import { ArrowRight, Star, MapPin, ShieldCheck, PlayCircle, Tag } from "lucide-react";
import { useHeroVideo } from "@/lib/heroVideos";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { usePageConfig, type PageConfig } from "@/lib/usePageConfig";

// =============================================================
// Statistiques reelles issues de Supabase (jamais de chiffres
// inventes). Comportement inchange par rapport a l'existant.
// ==========================================================
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

// Recupere une offre existante (table promo_codes) quand le Hero
// est configure en mode "special_offer" + "existing_offer".
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

// ------------------------------------------------------------
// Mode Classique
// ------------------------------------------------------------
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

  // Contenu par defaut (comportement actuel, inchange) ‚Äî utilise tant que
  // l'admin n'a pas rempli le Hero depuis la nouvelle interface.
  const defaultTitles: Record<string, string> = {
    FR: "D√©couvrez le S√©n√©gal Autrement",
    EN: "Discover Senegal, Differently",
    ES: "Descubre Senegal de Otra Manera",
  };
  const defaultSubtitles: Record<string, string> = {
    FR: "Gor√©e, le Lac Rose, Casamance et bien plus ‚Äî vivez le S√©n√©gal authentique, en toute simplicit√©.",
    EN: "Gor√©e, Pink Lake, Casamance and more ‚Äî experience authentic Senegal, made simple.",
    ES: "Gor√©e, el Lago Rosa, Casamance y m√°s ‚Äî vive el Senegal aut√©ntico, sin complicaciones.",
  };
  const videoLabels: Record<string, string> = {
    FR: "Voir la vid√©o", EN: "Watch the video", ES: "Ver el video",
  };
  const statLabels: Record<string, { travelers: string; rating: string; sites: string }> = {
    FR: { travelers: "Voyageurs", rating: "Note moyenne", sites: "Sites couverts" },
    EN: { travelers: "Travelers", rating: "Average rating", sites: "Sites covered" },
    ES: { travelers: "Viajeros", rating: "Valoraci√≥n media", sites: "Sitios cubiertos" },
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
            className="inline-flex items-center gap-2 bg-'&ÊB÷vˆ∆BÛ#&6∂G&˜÷&«W"◊6“&˜&FW"&˜&FW"÷'&ÊB÷vˆ∆BÛ3&˜VÊFVB÷gV∆¬Ç”Rí”"#‡¢ƒ÷ñ‚6∆74Ê÷S“'r”BÇ”BFWáB÷'&ÊB÷vˆ∆B"Û‡¢«7‚6∆74Ê÷S“'FWáB÷'&ÊB÷vˆ∆BfˆÁB◊6V÷ñ&ˆ∆BFWáB◊6“G&6∂ñÊr◊vñFR#‰∆R<:ñÏ:ñv¬f˜W267VVñ∆∆S¬˜7„‡¢¬ˆ÷˜Fñˆ‚ÊFóc‡†¢∆É6∆74Ê÷S“'FWáB”GÜ¬6”ßFWáB”WÜ¬÷CßFWáB”gÜ¬∆sßFWáB”wÜ¬fˆÁB◊6W&ñbóF∆ñ2fˆÁB÷&ˆ∆BFWáB◊vÜóFR∆VFñÊr◊FñváBG&6∂ñÊr◊FñváBG&˜◊6ÜF˜r◊Ü¬#‡¢∑FóF∆W–¢¬ˆÉ‡†¢«6∆74Ê÷S“'FWáB÷&6R6”ßFWáB÷∆r÷CßFWáB◊Ü¬FWáB◊vÜóFRÛÉfˆÁB÷∆ñváB∆VFñÊr◊&V∆ÜVB÷Ç◊r◊Ü¬◊Ç÷WFÚ∆s¶◊Ç”#‡¢∑7V'FóF∆W–¢¬˜‡†¢∆Fób6∆74Ê÷S“&f∆WÇf∆WÇ÷6ˆ¬6”¶f∆WÇ◊&˜róFV◊2÷6VÁFW"∆s¶ßW7Fñgí◊7F'BßW7Fñgí÷6VÁFW"v”2B”"#‡¢∂'WGFˆÁ2ÚÄ¢'WGFˆÁ2Ê÷ÇÜ'F‚¬íí”‚Ä¢∆¢∂Wì◊∂ó–¢á&Vc◊∂'F‚Ê∆ñÊ∑–¢6∆74Ê÷S◊∂f∆WÇóFV◊2÷6VÁFW"ßW7Fñgí÷6VÁFW"v”"r÷gV∆¬6”ßr÷WFÚÇ”Çí”BfˆÁB÷&ˆ∆B&˜VÊFVB”'Ü¬FWáB÷&6R6”ßFWáB÷∆rG&Á6óFñˆ‚÷∆¬6ÜF˜r◊Ü¬Ü˜fW#ß6ÜF˜r”'Ü¬Ü˜fW#ß66∆R”R7FófSß66∆R”÷ñ‚÷Ç’≥S'Ö“G∞¢'F‚Á7Gñ∆R””“'6V6ˆÊF'í ¢Ú&&r◊vÜóFRÛÜ˜fW#¶&r◊vÜóFRÛ#&6∂G&˜÷&«W"◊6“&˜&FW"&˜&FW"◊vÜóFRÛ3FWáB◊vÜóFR ¢¢&&r÷'&ÊB÷vˆ∆BÜ˜fW#¶&r÷'&ÊB÷vˆ∆B÷F&≤FWáB◊vÜóFR ¢÷”‡¢∂'F‚Ê∆&V«–¢ƒ'&˜u&ñváB6∆74Ê÷S“'r”RÇ”R"Û‡¢¬ˆ‡¢íê¢í¢Ä¢√‡¢∆'WGFˆ‡¢ˆ‰6∆ñ6≥◊≤Çí”‚˜V‰&ˆˆ∂ñÊrÇó–¢6∆74Ê÷S“&f∆WÇóFV◊2÷6VÁFW"ßW7Fñgí÷6VÁFW"v”"r÷gV∆¬6”ßr÷WFÚÇ”Çí”B&r÷'&ÊB÷vˆ∆BÜ˜fW#¶&r÷'&ÊB÷vˆ∆B÷F&≤FWáB◊vÜóFRfˆÁB÷&ˆ∆B&˜VÊFVB”'Ü¬FWáB÷&6R6”ßFWáB÷∆rG&Á6óFñˆ‚÷∆¬6ÜF˜r◊Ü¬Ü˜fW#ß6ÜF˜r”'Ü¬Ü˜fW#ß66∆R”R7FófSß66∆R”÷ñ‚÷Ç’≥S'Ö“#‡¢,:ó6W'fW"÷ñÁFVÊÁ@¢ƒ'&˜u&ñváB6∆74Ê÷S“'r”RÇ”R"Û‡¢¬ˆ'WGFˆ„‡¢∑fñFVıW&¬bb6Ü˜ufñFVÚbbÄ¢∆'WGFˆ‡¢ˆ‰6∆ñ6≥◊≤Çí”‚6WE∆ññÊráG'VRó–¢6∆74Ê÷S“&f∆WÇóFV◊2÷6VÁFW"ßW7Fñgí÷6VÁFW"v”"r÷gV∆¬6”ßr÷WFÚÇ”Çí”B&r◊vÜóFRÛÜ˜fW#¶&r◊vÜóFRÛ#&6∂G&˜÷&«W"◊6“&˜&FW"&˜&FW"◊vÜóFRÛ3FWáB◊vÜóFRfˆÁB◊6V÷ñ&ˆ∆B&˜VÊFVB”'Ü¬FWáB÷&6R6”ßFWáB÷∆rG&Á6óFñˆ‚÷∆¬÷ñ‚÷Ç’≥S'Ö“#‡¢≈∆î6ó&6∆R6∆74Ê÷S“'r”RÇ”R"Û‡¢∑fñFVÙ∆&V«5∂∆ÊwVvU◊–¢¬ˆ'WGFˆ„‡¢ó–¢¬Û‡¢ó–¢¬ˆFóc‡†¢∑7FG2Á&FñÊr‚bbÄ¢∆Fób6∆74Ê÷S“&f∆WÇóFV◊2÷6VÁFW"ßW7Fñgí÷6VÁFW"∆s¶ßW7Fñgí◊7F'Bv”2#‡¢∆Fób6∆74Ê÷S“&f∆WÇ#‡¢µ≤‚‚‰'&íÉRï“Ê÷ÇÖÚ¬íí”‚Ä¢≈7F"∂Wì◊∂ó“6∆74Ê÷S◊∂r”BÇ”BG∂í¬÷FÇÁ&˜VÊBá7FG2Á&FñÊríÚ'FWáB÷'&ÊB÷vˆ∆Bfñ∆¬÷'&ÊB÷vˆ∆B"¢'FWáB◊vÜóFRÛ#'÷“Û‡¢íó–¢¬ˆFóc‡¢¬7‚6∆74Ê÷S“'FWáB◊vÜóFRÛÉFWáB◊6“fˆÁB÷÷VFóV“#‡¢∑7FG2Á&FñÊw“ÛP¢∑7FG2ÁG&fV∆W'2‚bbÄ¢√‚+r«7‚6∆74Ê÷S“'FWáB◊vÜóFRfˆÁB÷&ˆ∆B#Á∑7FG2ÁG&fV∆W'7”¬˜7„‚∂∆&V«2ÁG&fV∆W'2ÁFÙ∆˜vW$66RÇó”¬Û‡¢ó–¢¬˜7„‡¢¬ˆFóc‡¢ó–¢¬ˆ÷˜Fñˆ‚ÊFóc‡†¢∂Ü57FG2bbÄ¢∆Fób6∆74Ê÷S“&ÜñFFV‚∆s¶f∆WÇf∆WÇ÷6ˆ¬v”2#‡¢∆÷˜Fñˆ‚ÊFóbñÊóFñ√◊∑≤˜6óGì¢¬É¢#◊“Êñ÷FS◊∑≤˜6óGì¢¬É¢◊“G&Á6óFñˆ„◊∑≤FV∆ì¢„R◊–¢6∆74Ê÷S“&&r◊vÜóFRÛ&6∂G&˜÷&«W"÷÷B&˜&FW"&˜&FW"◊vÜóFRÛ#&˜VÊFVB”'Ü¬”BFWáB◊vÜóFR#‡¢∆Fób6∆74Ê÷S“&f∆WÇóFV◊2÷6VÁFW"v”2÷"”2#‡¢∆Fób6∆74Ê÷S“'r”Ç”&˜VÊFVB◊Ü¬&r÷'&ÊB◊fñˆ∆WB÷v∆˜rÛCf∆WÇóFV◊2÷6VÁFW"ßW7Fñgí÷6VÁFW"#‡¢≈6ÜñV∆D6ÜV6≤6∆74Ê÷S“'r”RÇ”RFWáB÷'&ÊB÷vˆ∆B"Û‡¢¬ˆFóc‡¢∆Fóc‡¢∆Fób6∆74Ê÷S“&fˆÁB÷&ˆ∆BFWáB◊6“#‰6ˆÊfñÊ6Rb<:ñ7W&óL:ì¬ˆFóc‡¢∆Fób6∆74Ê÷S“'FWáB◊vÜóFRÛcFWáB◊á2#Â,:ó6W'fFñˆ‚R<:ñ7W&ó<:ñS¬ˆFóc‡¢¬ˆFóc‡¢¬ˆFóc‡¢∆Fób6∆74Ê÷S“&w&ñBw&ñB÷6ˆ«2”"v”"#‡¢µ∞¢≤c¢7FG2ÁG&fV∆W'2‚Ú7G&ñÊrá7FG2ÁG&fV∆W'2í¢.(	B"¬√¢∆&V«2ÁG&fV∆W'2“¿¢≤c¢7FG2Á&FñÊr‚ÚG∑7FG2Á&FñÊwﬁ)àV¢.(	B"¬√¢∆&V«2Á&FñÊr“¿¢≤c¢7FG2Á6óFW2‚Ú7G&ñÊrá7FG2Á6óFW2í¢.(	B"¬√¢∆&V«2Á6óFW2“¿¢“Ê÷Çá2¬íí”‚Ä¢∆Fób∂Wì◊∂ó“6∆74Ê÷S“&&r◊vÜóFRÛ&˜VÊFVB◊Ü¬”"FWáB÷6VÁFW"#‡¢∆Fób6∆74Ê÷S“&fˆÁB÷&ˆ∆BFWáB÷'&ÊB÷vˆ∆BFWáB÷&6R#Á∑2Ág”¬ˆFóc‡¢∆Fób6∆74Ê÷S“'FWáB◊vÜóFRÛcFWáB◊á2#Á∑2Ê«”¬ˆFóc‡¢¬ˆFóc‡¢íó–¢¬ˆFóc‡¢¬ˆ÷˜Fñˆ‚ÊFóc‡¢¬ˆFóc‡¢ó–¢¬ˆFóc‡¢¬ˆFóc‡†¢∆Fób6∆74Ê÷S“&'6ˆ«WFR&˜GFˆ“”∆VgB”r÷gV∆¬Ç”3"&r÷w&FñVÁB◊FÚ◊Bg&ˆ“÷'&ÊB◊fñˆ∆WB÷FVWFÚ◊G&Á7&VÁB¢”"Û‡¢¬˜6V7Fñˆ„‡¢ì∞ß–†¢ÚÚ“““““““““““““““““““““““““““““““““““““““““““““““““““““““““““–¢ÚÚ÷ˆFRˆfg&R7V6ñ∆P¢ÚÚ“““““““““““““““““““““““““““““““““““““““““““““““““““““““““““–¶gVÊ7Fñˆ‚7V6ñƒˆffW$ÜW&Úá≤6ˆÊfñr”¢ÜW&Ù6ˆÁFVÁE&˜2í∞¢6ˆÁ7B≤˜V‰&ˆˆ∂ñÊr““W6T&ˆˆ∂ñÊrÇì∞¢6ˆÁ7B∂WÜó7FñÊtˆffW"¬6WDWÜó7FñÊtˆffW%““W6U7FFS∆Áì‚ÜÁV∆¬ì∞†¢6ˆÁ7B÷ˆFR“6ˆÊfñsÚÊÜW&ıˆˆffW%ˆ÷ˆFS∞¢6ˆÁ7BˆffW$ñB“6ˆÊfñsÚÊÜW&ıˆˆffW%ˆñC∞†¢W6TVffV7BÇÇí”‚∞¢ñbÜ÷ˆFR””“&WÜó7FñÊuˆˆffW""bbˆffW$ñBí∞¢∆ˆDWÜó7FñÊtˆffW"ÜˆffW$ñBíÁFÜV‚á6WDWÜó7FñÊtˆffW"ì∞¢–¢“¬∂÷ˆFR¬ˆffW$ñE“ì∞†¢6ˆÁ7B7W7Fˆ““6ˆÊfñsÚÊÜW&ıˆˆffW%ˆ7W7Fˆ”∞†¢ÚÚÊ˜&÷∆ó6R∆W2FWWÇ6˜W&6W2Üˆfg&RWÜó7FÁFRg2ˆfg&R7W7Fˆ“ífW'2VÊP¢ÚÚ6WV∆Rf˜&÷RBvffñ6ÜvR‡¢6ˆÁ7BFó7∆í“÷ˆFR””“&WÜó7FñÊuˆˆffW""bbWÜó7FñÊtˆffW ¢Ú∞¢ñ÷vS¢WÜó7FñÊtˆffW"Êñ÷vR«¬"ˆÜW&Ú◊&VÊó76Ê6RÁÊr"¿¢FóF∆S¢WÜó7FñÊtˆffW"Ê6◊ñvÂˆÊ÷R«¬""¿¢FW67&óFñˆ„¢WÜó7FñÊtˆffW"ÊFW67&óFñˆ‚«¬""¿¢&FvS¢WÜó7FñÊtˆffW"ÊFó66˜VÁE˜GóR””“'W&6VÁFvR ¢Ú“G∂WÜó7FñÊtˆffW"ÊFó66˜VÁE˜f«VW“V ¢¢WÜó7FñÊtˆffW"ÊFó66˜VÁE˜GóR””“&fóÜVB ¢Ú“G∂WÜó7FñÊtˆffW"ÊFó66˜VÁE˜f«VW“d4d ¢¢$ˆffW'B"¿¢'WGFˆ‰∆&V√¢%,:ó6W'fW"÷ñÁFVÊÁB"¿¢'WGFˆ‰∆ñÊ≥¢ÁV∆¬¿¢–¢¢∞¢ñ÷vS¢7W7Fˆ”ÚÊñ÷vSÚÁG&ñ“Çí«¬"ˆÜW&Ú◊&VÊó76Ê6RÁÊr"¿¢FóF∆S¢7W7Fˆ”ÚÁFóF∆SÚÁG&ñ“Çí«¬$ˆfg&R7:ñ6ñ∆R"¿¢FW67&óFñˆ„¢7W7Fˆ”ÚÊFW67&óFñˆ‚«¬""¿¢&FvS¢7W7Fˆ”ÚÊ&FvR«¬Ü7W7Fˆ”ÚÊFó66˜VÁBÚ“G∂7W7Fˆ“ÊFó66˜VÁG“V¢""í¿¢'WGFˆ‰∆&V√¢7W7Fˆ”ÚÊ'WGFˆ„ÚÊ∆&V√ÚÁG&ñ“Çí«¬$V‚&ˆfóFW""¿¢'WGFˆ‰∆ñÊ≥¢7W7Fˆ”ÚÊ'WGFˆ„ÚÊ∆ñÊ≥ÚÁG&ñ“Çí«¬ÁV∆¬¿¢”∞†¢&WGW&‚Ä¢«6V7Fñˆ‚6∆74Ê÷S“'&V∆FófR÷ñ‚÷Ç’≥GfÖ“f∆WÇóFV◊2÷6VÁFW"ßW7Fñgí÷6VÁFW"˜fW&f∆˜r÷ÜñFFV‚#‡¢∆Fób6∆74Ê÷S“&'6ˆ«WFRñÁ6WB”¢”#‡¢∆ñ÷r7&3◊∂Fó7∆íÊñ÷vW“«C◊∂Fó7∆íÁFóF∆W“6∆74Ê÷S“'r÷gV∆¬Ç÷gV∆¬ˆ&¶V7B÷6˜fW"ˆ&¶V7B÷6VÁFW""Û‡¢∆Fób6∆74Ê÷S“&'6ˆ«WFRñÁ6WB”&r÷w&FñVÁB◊FÚ÷'"g&ˆ“÷'&ÊB÷F&≤Ûìfñ÷'&ÊB÷F&≤ÛsFÚ÷'&ÊB◊fñˆ∆WB÷v∆˜rÛS"Û‡¢¬ˆFóc‡†¢∆Fób6∆74Ê÷S“'&V∆FófR¢”r÷gV∆¬÷Ç◊r”GÜ¬◊Ç÷WFÚÇ”B6”ßÇ”bFWáB÷6VÁFW"76R◊í”b#‡¢∂Fó7∆íÊ&FvRbbÄ¢∆÷˜Fñˆ‚ÊFóbñÊóFñ√◊∑≤˜6óGì¢¬66∆S¢„í◊“Êñ÷FS◊∑≤˜6óGì¢¬66∆S¢◊–¢6∆74Ê÷S“&ñÊ∆ñÊR÷f∆WÇóFV◊2÷6VÁFW"v”"&r◊&VB”SFWáB◊vÜóFRfˆÁB÷&∆6≤FWáB◊6“Ç”Rí”"&˜VÊFVB÷gV∆¬6ÜF˜r÷∆r#‡¢≈Fr6∆74Ê÷S“'r”BÇ”B"Û‡¢∂Fó7∆íÊ&FvW–¢¬ˆ÷˜Fñˆ‚ÊFóc‡¢ó–†¢∆É6∆74Ê÷S“'FWáB”GÜ¬6”ßFWáB”WÜ¬÷CßFWáB”gÜ¬∆sßFWáB”wÜ¬fˆÁB◊6W&ñbóF∆ñ2fˆÁB÷&ˆ∆BFWáB◊vÜóFR∆VFñÊr◊FñváBG&6∂ñÊr◊FñváBG&˜◊6ÜF˜r◊Ü¬#‡¢∂Fó7∆íÁFóF∆W–¢¬ˆÉ‡†¢∂Fó7∆íÊFW67&óFñˆ‚bbÄ¢«6∆74Ê÷S“'FWáB÷&6R6”ßFWáB÷∆r÷CßFWáB◊Ü¬FWáB◊vÜóFRÛÉfˆÁB÷∆ñváB∆VFñÊr◊&V∆ÜVB÷Ç◊r”'Ü¬◊Ç÷WFÚ#‡¢∂Fó7∆íÊFW67&óFñˆÁ–¢¬˜‡¢ó–†¢≤Ü7W7Fˆ”ÚÁf∆ñE˜VÁFñ¬íbbÄ¢«6∆74Ê÷S“'FWáB◊vÜóFRÛcFWáB◊6“#‡¢ˆfg&Rf∆&∆RßW7RvR∂ÊWrFFRÜ7W7Fˆ“Áf∆ñE˜VÁFñ¬íÁFÙ∆ˆ6∆TFFU7G&ñÊrÇ&g"‘e""ó–¢¬˜‡¢ó–†¢∂Fó7∆íÊ'WGFˆ‰∆ñÊ≤ÚÄ¢∆á&Vc◊∂Fó7∆íÊ'WGFˆ‰∆ñÊ∑–¢6∆74Ê÷S“&ñÊ∆ñÊR÷f∆WÇóFV◊2÷6VÁFW"ßW7Fñgí÷6VÁFW"v”"Ç”Çí”B&r÷'&ÊB÷vˆ∆BÜ˜fW#¶&r÷'&ÊB÷vˆ∆B÷F&≤FWáB◊vÜóFRfˆÁB÷&ˆ∆B&˜VÊFVB”'Ü¬FWáB÷&6R6”ßFWáB÷∆rG&Á6óFñˆ‚÷∆¬6ÜF˜r◊Ü¬Ü˜fW#ß6ÜF˜r”'Ü¬Ü˜fW#ß66∆R”R÷ñ‚÷Ç’≥S'Ö“#‡¢∂Fó7∆íÊ'WGFˆ‰∆&V«–¢ƒ'&˜u&ñváB6∆74Ê÷S“'r”RÇ”R"Û‡¢¬ˆ‡¢í¢Ä¢∆'WGFˆ‚ˆ‰6∆ñ6≥◊≤Çí”‚˜V‰&ˆˆ∂ñÊrÜFó7∆íÁFóF∆Ró–¢6∆74Ê÷S“&ñÊ∆ñÊR÷f∆WÇóFV◊2÷6VÁFW"ßW7Fñgí÷6VÁFW"v”"Ç”Çí”B&r÷'&ÊB÷vˆ∆BÜ˜fW#¶&r÷'&ÊB÷vˆ∆B÷F&≤FWáB◊vÜóFRfˆÁB÷&ˆ∆B&˜VÊFVB”'Ü¬FWáB÷&6R6”ßFWáB÷∆rG&Á6óFñˆ‚÷∆¬6ÜF˜r◊Ü¬Ü˜fW#ß6ÜF˜r”'Ü¬Ü˜fW#ß66∆R”R÷ñ‚÷Ç’≥S'Ö“#‡¢∂Fó7∆íÊ'WGFˆ‰∆&V«–¢ƒ'&˜u&ñváB6∆74Ê÷S“'r”RÇ”R"Û‡¢¬ˆ'WGFˆ„‡¢ó–¢¬ˆFóc‡†¢∆Fób6∆74Ê÷S“&'6ˆ«WFR&˜GFˆ“”∆VgB”r÷gV∆¬Ç”3"&r÷w&FñVÁB◊FÚ◊Bg&ˆ“÷'&ÊB◊fñˆ∆WB÷FVWFÚ◊G&Á7&VÁB¢”"Û‡¢¬˜6V7Fñˆ„‡¢ì∞ß–†¢ÚÚ“““““““““““““““““““““““““““““““““““““““““““““““““““““““““““–¢ÚÚw&W"¢6Üˆó6óB∆R÷ˆFR6V∆ˆ‚∆6ˆÊfñrFR∆vP¢ÚÚ““““““““““““““““““““““““““““““““““““““““““““““““““““““““““““““–¶ñÁFW&f6RÜW&ı&˜2∞¢vU6«VsÛ¢7G&ñÊs∞ß–†¶Wá˜'BgVÊ7Fñˆ‚ÜW&Úá≤vU6«Vr“&67VVñ¬"”¢ÜW&ı&˜2í∞¢6ˆÁ7B≤6ˆÊfñr¬∆ˆFñÊr““W6UvT6ˆÊfñrávU6«Vrì∞†¢ÚÚVÊFÁB∆R6Ü&vV÷VÁBñÊóFñ¬¬ˆ‚ffñ6ÜRFV¶∆R÷ˆFR6∆76óVR ¢ÚÚFVfWB˜W"WfóFW"F˜WBf∆6ÇÚ∆ñ˜WB6ÜñgB‡¢ñbÜ∆ˆFñÊr«¬6ˆÊfñr«¬6ˆÊfñrÊÜW&ı˜GóR””“&6∆76ñ2"í∞¢&WGW&‚ƒ6∆76ñ4ÜW&Ú6ˆÊfñs◊∂6ˆÊfñw“Û„∞¢–†¢&WGW&‚≈7V6ñƒˆffW$ÜW&Ú6ˆÊfñs◊∂6ˆÊfñw“Û„∞ß–†