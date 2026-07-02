import { useEffect, useState, useRef } from "react";
import { Video, Upload, Trash2, CheckCircle } from "lucide-react";
import { HERO_CATEGORIES, getAllHeroVideoUrls, uploadHeroVideo, removeHeroVideo, HeroCategoryKey } from "@/lib/heroVideos";

export function HeroVideosAdmin() {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    setLoading(true);
    setUrls(await getAllHeroVideoUrls());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleFile = async (category: HeroCategoryKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { showToast("Ce fichier n'est pas une vidéo"); return; }
    if (file.size > 100 * 1024 * 1024) { showToast("Vidéo trop lourde (max 100 Mo)"); return; }

    setUploadingKey(category);
    try {
      const publicUrl = await uploadHeroVideo(category, file);
      setUrls((prev) => ({ ...prev, [category]: publicUrl }));
      showToast("Vidéo mise à jour ✅");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'upload");
    } finally {
      setUploadingKey(null);
      if (fileRefs.current[category]) fileRefs.current[category]!.value = "";
    }
  };

  const handleRemove = async (category: HeroCategoryKey) => {
    await removeHeroVideo(category);
    setUrls((prev) => ({ ...prev, [category]: "" }));
    showToast("Vidéo supprimée");
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Chargement…</div>;

  return (
    <div className="space-y-4 p-1">
      <h2 className="text-lg font-bold text-[#0B0A14] flex items-center gap-2">
        <Video className="w-5 h-5 text-[#6C3EF5]" /> Vidéos des pages
      </h2>
      <p className="text-sm text-gray-500 -mt-2">
        Une vidéo par catégorie. Elle se joue en fond quand le visiteur clique sur "Voir la vidéo" sur la page correspondante.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HERO_CATEGORIES.map(({ key, label }) => {
          const url = urls[key];
          const isUploading = uploadingKey === key;
          return (
            <div key={key} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0B0A14]">{label}</span>
                {url ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                    <CheckCircle className="w-4 h-4" /> Vidéo active
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-400">Aucune vidéo</span>
                )}
              </div>

              {url && <video src={url} controls className="w-full h-32 object-cover rounded-lg bg-black" />}

              <div className="flex items-center gap-2">
                <button type="button" disabled={isUploading} onClick={() => fileRefs.current[key]?.click()}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                  <Upload className="w-4 h-4" />
                  {isUploading ? "Envoi en cours…" : url ? "Remplacer" : "Choisir vidéo"}
                </button>
                {url && (
                  <button type="button" onClick={() => handleRemove(key)}
                    className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <input ref={(el) => { fileRefs.current[key] = el; }} type="file" accept="video/*"
                  onChange={(e) => handleFile(key, e)} className="hidden" />
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#0B0A14] text-white px-4 py-3 rounded-xl shadow-xl text-sm font-semibold z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
