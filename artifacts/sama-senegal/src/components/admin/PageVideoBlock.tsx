import { useEffect, useState, useRef } from "react";
import { Video, Upload, Trash2, CheckCircle } from "lucide-react";
import {
  HERO_CATEGORIES,
  getAllHeroVideoUrls,
  uploadHeroVideo,
  removeHeroVideo,
  HeroCategoryKey,
} from "@/lib/heroVideos";

interface Props {
  /** Mot(s)-clé cherchés (insensible à la casse) dans la clé ou le label de la catégorie vidéo de cette page */
  pageMatch: string | string[];
  label?: string;
}

export function PageVideoBlock({ pageMatch, label }: Props) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const needles = (Array.isArray(pageMatch) ? pageMatch : [pageMatch]).map((s) =>
    s.toLowerCase()
  );
  const category = HERO_CATEGORIES.find((c) =>
    needles.some((n) => c.key.toLowerCase().includes(n) || c.label.toLowerCase().includes(n))
  );

  const load = async () => {
    setLoading(true);
    setUrls(await getAllHeroVideoUrls());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  if (!category) return null;

  const url = urls[category.key];

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      showToast("Ce fichier n'est pas une vidéo");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      showToast("Vidéo trop lourde (max 100 Mo)");
      return;
    }
    setUploading(true);
    try {
      const publicUrl = await uploadHeroVideo(category.key as HeroCategoryKey, file);
      setUrls((prev) => ({ ...prev, [category.key]: publicUrl }));
      showToast("Vidéo mise à jour ✅");
    } catch {
      showToast("Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    await removeHeroVideo(category.key as HeroCategoryKey);
    setUrls((prev) => ({ ...prev, [category.key]: "" }));
    showToast("Vidéo supprimée");
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-[#0B0A14] flex items-center gap-2 text-sm">
          <Video className="w-4 h-4 text-[#6C3EF5]" /> {label || `Vidéo — ${category.label}`}
        </span>
        {url ? (
          <span className="flex items-center gap-1 text-xs font-bold text-green-600">
            <CheckCircle className="w-4 h-4" /> Active
          </span>
        ) : (
          <span className="text-xs font-bold text-gray-400">Aucune vidéo</span>
        )}
      </div>

      {loading ? (
        <div className="text-xs text-gray-400">Chargement…</div>
      ) : (
        <>
          {url && (
            <video src={url} controls className="w-full h-32 object-cover rounded-lg bg-black mb-3" />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Envoi en cours…" : url ? "Remplacer la vidéo" : "Ajouter une vidéo"}
            </button>
            {url && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#0B0A14] text-white px-4 py-3 rounded-xl shadow-xl text-sm font-semibold z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
