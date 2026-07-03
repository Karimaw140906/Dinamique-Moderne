import { useState, useEffect, useRef } from "react";
import { Star, RefreshCw, Plus, Trash2, Save, Image, Video, Check, X, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

type MediaType = "text" | "photo" | "video";
type Status = "approved" | "pending";

const DEFAULT_TEMOIGNAGES: any[] = [];

const EMPTY_FORM = {
  author: "", nationality: "", rating: 5, comment: "",
  media_type: "text" as MediaType, media_urls: [] as string[], active: true,
};

export function TestimonialsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const [tab, setTab] = useState<"publies" | "attente">("publies");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        setItems(data.map((t: any) => ({
          ...t,
          media_type: t.media_type || "text",
          media_urls: t.media_urls || [],
          status: t.status || "approved",
        })));
        setSource("supabase");
        setLoading(false);
        return;
      }
    } catch {}
    try {
      const saved = localStorage.getItem("adminTemoignages");
      setItems(saved ? JSON.parse(saved) : DEFAULT_TEMOIGNAGES);
    } catch {
      setItems(DEFAULT_TEMOIGNAGES);
    }
    setSource("local");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (item: any) => {
    const updated = { ...item, active: !item.active };
    setItems((prev) => prev.map((t) => (t.id === item.id ? updated : t)));
    try {
      await supabase.from("testimonials").update({ active: updated.active }).eq("id", item.id);
      window.dispatchEvent(new Event("testimonialsUpdated"));
    } catch {}
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    setItems((prev) => prev.filter((t) => t.id !== id));
    try {
      await supabase.from("testimonials").delete().eq("id", id);
      window.dispatchEvent(new Event("testimonialsUpdated"));
    } catch {}
  };

  const approve = async (item: any) => {
    const updated = { ...item, status: "approved", active: true };
    setItems((prev) => prev.map((t) => (t.id === item.id ? updated : t)));
    try {
      await supabase.from("testimonials").update({ status: "approved", active: true }).eq("id", item.id);
      window.dispatchEvent(new Event("testimonialsUpdated"));
    } catch {}
  };

  const reject = async (id: string) => {
    if (!confirm("Rejeter (supprimer) ce témoignage en attente ?")) return;
    await deleteItem(id);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((f) => ({ ...f, media_urls: [...f.media_urls, ev.target?.result as string] }));
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeMediaAt = (idx: number) => {
    setForm((f) => ({ ...f, media_urls: f.media_urls.filter((_, i) => i !== idx) }));
  };

  const saveNew = async () => {
    if (!form.author) return;
    if (form.media_type === "text" && !form.comment) return;
    if (form.media_type !== "text" && form.media_urls.length === 0) return;
    setSaving(true);

    const payload = {
      author: form.author,
      nationality: form.nationality,
      rating: form.rating,
      comment: form.comment,
      media_type: form.media_type,
      media_urls: form.media_urls,
      status: "approved",
      submitted_by: "admin",
      active: form.active,
    };

    try {
      const { data, error } = await supabase.from("testimonials").insert([payload]).select().single();
      if (!error && data) {
        setItems((prev) => [data, ...prev]);
        setForm({ ...EMPTY_FORM });
        setShowForm(false);
        setSaving(false);
        window.dispatchEvent(new Event("testimonialsUpdated"));
        return;
      }
    } catch {}

    const newItem = { ...payload, id: Date.now().toString(), created_at: new Date().toISOString() };
    setItems((prev) => [newItem, ...prev]);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    setSaving(false);
  };

  const published = items.filter((t) => (t.status || "approved") === "approved");
  const pending = items.filter((t) => t.status === "pending");
  const visible = tab === "publies" ? published : pending;

  const MediaTypeIcon = ({ type }: { type: MediaType }) =>
    type === "video" ? <Video className="w-3.5 h-3.5" /> : type === "photo" ? <Image className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Témoignages clients</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {published.length} publié(s) · {pending.length} en attente de validation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            source === "supabase" ? "bg-green-50 text-green-600 border border-green-200" : "bg-yellow-50 text-yellow-600 border border-yellow-200"
          }`}>
            {source === "supabase" ? "✅ Supabase" : "⚠️ Local"}
          </div>
          <button onClick={load} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6C3EF5] text-white rounded-xl text-sm font-bold hover:bg-[#8B5CF6]"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("publies")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            tab === "publies" ? "bg-[#0B0A14] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Publiés ({published.length})
        </button>
        <button
          onClick={() => setTab("attente")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors relative ${
            tab === "attente" ? "bg-[#0B0A14] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          En attente ({pending.length})
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Type de témoignage</label>
            <div className="flex gap-2">
              {(["text", "photo", "video"] as MediaType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, media_type: t })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    form.media_type === t ? "bg-[#6C3EF5] text-white border-[#6C3EF5]" : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  <MediaTypeIcon type={t} /> {t === "text" ? "Texte" : t === "photo" ? "Photo(s)" : "Vidéo(s)"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nom *</label>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                placeholder="Prénom Nom"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nationalité</label>
              <input
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                placeholder="France"
              />
            </div>
          </div>

          {form.media_type === "text" ? (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Note</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setForm({ ...form, rating: n })} className={`text-xl ${n <= form.rating ? "text-yellow-400" : "text-gray-200"}`}>
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Témoignage *</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={3}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Légende (optionnel)</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={2}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Un petit mot du client..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  {form.media_type === "photo" ? "Photos" : "Vidéos"} (plusieurs possibles)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.media_urls.map((url, i) => (
                    <div key={i} className="relative">
                      {form.media_type === "photo" ? (
                        <img src={url} className="w-20 h-20 object-cover rounded-lg" alt="" />
                      ) : (
                        <video src={url} className="w-20 h-20 object-cover rounded-lg bg-black" />
                      )}
                      <button
                        onClick={() => removeMediaAt(i)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4" /> Ajouter {form.media_type === "photo" ? "des photos" : "des vidéos"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept={form.media_type === "photo" ? "image/*" : "video/*"}
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                />
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              onClick={saveNew}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#6C3EF5] text-white rounded-xl text-sm font-bold hover:bg-[#8B5CF6] disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Enregistrement..." : "Publier"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-400 shadow-sm">
          {tab === "attente" ? "Aucun témoignage en attente de validation." : "Aucun témoignage publié."}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((t) => (
            <div key={t.id} className={`bg-white rounded-xl p-5 shadow-sm border ${t.active ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-gray-800">{t.author || t.name}</span>
                    <span className="text-xs text-gray-400">· {t.nationality || t.country}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <MediaTypeIcon type={t.media_type || "text"} />
                      {t.media_type === "photo" ? "Photo" : t.media_type === "video" ? "Vidéo" : "Texte"}
                    </span>
                    {t.media_type === "text" && t.rating && <span className="text-yellow-400 text-sm">{"⭐".repeat(t.rating)}</span>}
                  </div>
                  {t.comment && <p className="text-sm text-gray-600 italic">"{t.comment}"</p>}
                  {(t.media_urls || []).length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {t.media_urls.map((url: string, i: number) =>
                        t.media_type === "video" ? (
                          <video key={i} src={url} controls className="w-24 h-24 object-cover rounded-lg bg-black" />
                        ) : (
                          <img key={i} src={url} className="w-24 h-24 object-cover rounded-lg" alt="" />
                        )
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.status === "pending" ? (
                    <>
                      <button onClick={() => approve(t)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200">
                        <Check className="w-3.5 h-3.5" /> Valider
                      </button>
                      <button onClick={() => reject(t.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100">
                        <X className="w-3.5 h-3.5" /> Rejeter
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleActive(t)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {t.active ? "Publié" : "Masqué"}
                    </button>
                  )}
                  <button onClick={() => deleteItem(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
