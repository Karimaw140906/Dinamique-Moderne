import { X, PlayCircle } from "lucide-react";
import { useEffect } from "react";

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  videoUrl?: string; // URL YouTube/Vimeo/MP4 — vide pour l'instant, à brancher plus tard depuis l'admin
}

export function VideoModal({ open, onClose, videoUrl }: VideoModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl aspect-video bg-[#0B0F1F] rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {videoUrl ? (
          <video src={videoUrl} controls autoPlay className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/60">
            <PlayCircle className="w-16 h-16 text-[#F5B942]/70" />
            <p className="text-sm font-medium">Vidéo bientôt disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
