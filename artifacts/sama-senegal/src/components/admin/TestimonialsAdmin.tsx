import { useState, useEffect } from "react";
import { Star, RefreshCw, Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULT_TEMOIGNAGES = [
  { id: "1", author: "Marie Dupont", nationality: "France", rating: 5, comment: "Une expérience inoubliable ! L'équipe de Sama Senegal nous a offert un séjour parfait.", active: true },
  { id: "2", author: "John Smith", nationality: "USA", rating: 5, comment: "Incredible experience! The guides were professional and the tours were amazing.", active: true },
  { id: "3", author: "Carlos García", nationality: "España", rating: 5, comment: "¡Experiencia increíble! Todo fue perfecto desde el principio hasta el final.", active: true },
];

const EMPTY_FORM = { author: "", nationality: "", rating: 5, comment: "", active: true };

export function TestimonialsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        setItems(data);
        setSource("supabase");
        setLoading(false);
        return;
      }
    } catch {}
    // Fallback localStorage
    try {
      const saved = localStorage.getItem("adminTemoignages");
      setItems(saved ? JSON.parse(saved) : DEFAULT_TEMOIGNAGES);
    } catch { setItems(DEFAULT_TEMOIGNAGES); }
    setSource("local");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (item: any) => {
    const updated = { ...item, active: !item.active };
    setItems(prev => prev.map(t => t.id === item.id ? updated : t));
    try {
      await supabase.from("testimonials").update({ active: updated.active }).eq("id", item.id);
    } catch {}
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    setItems(prev => prev.filter(t => t.id !== id));
    try { await supabase.from("testimonials").delete().eq("id", id); } catch {}
  };

  const saveNew = async () => {
    if (!form.author || !form.comment) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("testimonials")
        .insert([{ ...form }]).select().single();
      if (!error && data) {
        setItems(prev => [data, ...prev]);
        setForm({ ...EMPTY_FORM });
        setShowForm(false);
        setSaving(false);
        return;
      }
    } catch {}
    // Fallback local
    const newItem = { ...form, id: Date.now().toString(), created_at: new Date().toISOString() };
    setItems(prev => [newItem, ...prev]);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Témoignages clients</h2>
          <p className="text-xs text-gray-400 mt-0.5">{items.filter(t => t.active).length} publié(s) · {items.length} total</p>
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
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C7A5C] text-white rounded-xl text-sm font-bold hover:bg-[#245f49]">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nom *</label>
              <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" placeholder="Prénom Nom" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nationalité</label>
              <input value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" placeholder="France" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Note</label>
            <div className="flex gap-2 mt-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setForm({ ...form, rating: n })}
                  className={`text-xl ${n <= form.rating ? "text-yellow-400" : "text-gray-200"}`}>⭐</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Témoignage *</label>
            <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
              rows={3} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={saveNew} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#2C7A5C] text-white rounded-xl text-sm font-bold hover:bg-[#245f49] disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200">
              Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(t => (
            <div key={t.id} className={`bg-white rounded-xl p-5 shadow-sm border ${t.active ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-gray-800">{t.author || t.name}</span>
                    <span className="text-xs text-gray-400">· {t.nationality || t.country}</span>
                    <span className="text-yellow-400 text-sm">{"⭐".repeat(t.rating || 5)}</span>
                  </div>
                  <p className="text-sm text-gray-600 italic">"{t.comment || t.text}"</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(t)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {t.active ? "Publié" : "Masqué"}
                  </button>
                  <button onClick={() => deleteItem(t.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
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
