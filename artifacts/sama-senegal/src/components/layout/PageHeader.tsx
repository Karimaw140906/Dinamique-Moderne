import { useState } from "react";
import { Link } from "wouter";
import { PlayCircle, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useBooking } from "@/context/BookingContext";
import { useHeroVideo, HeroCategoryKey } from "@/lib/heroVideos";

export function PageHeader({
  title,
  subtitle,
  image,
  category,
}: {
  title: string;
  subtitle?: string;
  image?: string;
  category?: HeroCategoryKey;
}) {
  const { language } = useLanguage();
  const { openBooking } = useBooking();
  const [playing, setPlaying] = useState(false);
  const videoUrl = useHeroVideo(category);

  const videoLabels: Record<string, string> = { FR: "Voir la vidéo", EN: "Watch the video", ES: "Ver el video" };
  const bookLabels: Record<string, string> = { FR: "Réserver maintenant", EN: "Book now", ES: "Reservar ahora" };

  const showVideo = playing && !!videoUrl;

  return (
    <div className={`relative overflow-hidden pt-32 md:pt-40 pb-14 md:pb-20 ${image || videoUrl ? "" : "bg-gradient-to-b from-brand-dark to-brand-violet-deep"}`}>
      {(image || videoUrl) && (
        <div className="absolute inset-0 z-0">
          {showVideo ? (
            <video src={videoUrl!} autoPlay loop muted playsInline className="w-full h-full object-cover object-center" />
          ) : (
            image && <img src={image} alt={title} className="w-full h-full object-cover object-center" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/90 via-brand-violet-deep/80 to-brand-violet-deep" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-xs text-white/50 mb-3">
          <Link href="/" className="hover:text-brand-gold">Accueil</Link> <span className="mx-1">›</span> {title}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold text-white">{title}</h1>
        {subtitle && <p className="text-white/70 mt-3 max-w-2xl">{subtitle}</p>}

        <div className="flex flex-col sm:flex-row items-start gap-3 mt-6">
          <button onClick={() => openBooking()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold hover:bg-brand-gold-dark text-white font-bold rounded-xl text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 min-h-[48px]">
            {bookLabels[language]}
            <ArrowRight className="w-4 h-4" />
          </button>

          {videoUrl && !showVideo && (
            <button onClick={() => setPlaying(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl text-sm sm:text-base transition-all min-h-[48px]">
              <PlayCircle className="w-4 h-4" />
              {videoLabels[language]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
