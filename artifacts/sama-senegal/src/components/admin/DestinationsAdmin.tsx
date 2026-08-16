import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import { CrudSection } from "./CrudSection";
import { Upload, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

const REGIONS = ["Dakar", "Thiès", "Saint-Louis", "Casamance", "Sine-Saloum", "Ferlo"];
const CATEGORIES = ["plage", "culture", "nature", "patrimoine", "aventure", "gastronomie", "ville", "faune", "désert", "loisirs"];

const DEFAULT_DATA: any[] = [];

// ============================================================
// Gestion des sections dynamiques d'une destination
// (Climat, Culture, Sécurité, Transport... configurables par l'admin)
// ============================================================
function SectionsManager({ destinationId }: { destinationId: string | number | undefined }) {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("📌");

  const isNewDestination = typeof destinationId !== "string";

  const loadSections = async () => {
    if (isNewDestination) return;
    setLoading(true);
    const { data } = await supabase
      .from("destination_sections")
      .select("*")
      .eq("destination_id", destinationId)
      .order("position");
    setSections(data || []);
    setLoading(false);
  };

  useEffect(() => { loadSections(); }, [destinationId]);

  const addSection = async () => {
    if (!newTitle.trim() || isNewDestination) return;
    const position = sections.length;
    const { error } = await supabase.from("destination_sections").insert({
      destination_id: destinationId,
      icon: newIcon || "📌",
      title_fr: newTitle,
      content_fr: "",
      position,
    });
    if (!error) {
      setNewTitle("");
      setNewIcon("📌");
      loadSections();
    }
  };

  const updateSection = async (id: string, field: string, value: any) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const saveSection = async (section: any) => {
    await supabase
      .from("destination_sections")
      .update({
        icon: section.icon,
        title_fr: section.title_fr,
        title_en: section.title_en,
        title_es: section.title_es,
        content_fr: section.content_fr,
        content_en: section.content_en,
        content_es: section.content_es,
        updated_at: new Date().toISOString(),
      })
      .eq("id", section.id);
  };

  const deleteSection = async (id: string) => {
    await supabase.from("destination_sections").delete().eq("id", id);
    loadSections();
  };

  const moveSection = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const reordered = [...sections];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSections(reordered);
    await Promise.all(
      reordered.map((s, i) => supabase.from("destination_sections").update({ position: i }).eq("id", s.id))
    );
  };

  if (isNewDestination) {
    return (
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
        Enregistre d'abord la destination pour pouvoir ajouter des sections (Climat, Culture, Sécurité...).
      </div>
    );
  }

  return (
    <div className="mt-4 border-t pt-4">
      <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Sections dynamiques</label>
      {loading && <div className="text-sm text-gray-400">Chargement...</div>}

      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={s.id} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
              <input
                type="text"
                value={s.icon || ""}
                onChange={(e) => updateSection(s.id, "icon", e.target.value)}
                onBlur={() => saveSection(s)}
                className="w-12 text-center border rounded px-1 py-1 text-sm"
              />
              <input
                type="text"
                value={s.title_fr || ""}
                onChange={(e) => updateSection(s.id, "title_fr", e.target.value)}
                onBlur={() => saveSection(s)}
                placeholder="Titre (ex: Climat)"
                className="flex-1 border rounded px-2 py-1 text-sm font-semibold"
              />
              <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                <ChevronDown className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => deleteSection(s.id)} className="p-1 text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={s.content_fr || ""}
              onChange={(e) => updateSection(s.id, "content_fr", e.target.value)}
              onBlur={() => saveSection(s)}
              rows={2}
              placeholder="Contenu FR..."
              className="w-full border rounded px-2 py-1 text-sm resize-none"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={newIcon}
          onChange={(e) => setNewIcon(e.target.value)}
          className="w-12 text-center border rounded-lg px-1 py-2 text-sm"
        />
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSection())}
          placeholder="Nouvelle section (ex: Sécurité, Gastronomie...)"
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button type="button" onClick={addSection}
          className="px-3 py-2 bg-[#6C3EF5] text-white rounded-lg text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
    </div>
  );
}

function DestinationForm({ item, onChange }: { item: any; onChange: (f: string, v: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const highlights: string[] = item.highlights || [];
  const [newHighlight, setNewHighlight] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange("photo", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Nom *</label>
          <input type="text" value={item.name || ""} onChange={(e) => onChange("name", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Région</label>
          <select value={item.region || "Dakar"} onChange={(e) => onChange("region", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Catégorie</label>
          <select value={item.category || "plage"} onChange={(e) => onChange("category", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Durée recommandée (jours)</label>
          <input type="number" min={1} value={item.recommended_days || 2} onChange={(e) => onChange("recommended_days", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Description FR</label>
        <textarea value={item.desc_fr || ""} onChange={(e) => onChange("desc_fr", e.target.value)} rows={2} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Description EN</label>
        <textarea value={item.desc_en || ""} onChange={(e) => onChange("desc_en", e.target.value)} rows={2} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Description ES</label>
        <textarea value={item.desc_es || ""} onChange={(e) => onChange("desc_es", e.target.value)} rows={2} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none" />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Note (1-5)</label>
        <input type="number" min={1} max={5} value={item.rating || 5} onChange={(e) => onChange("rating", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp (prestataire / guide responsable)</label>
        <input type="tel" value={item.whatsapp || ""} onChange={(e) => onChange("whatsapp", e.target.value)} placeholder="+221..." className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Points forts</label>
        <div className="flex gap-2 mb-2">
          <input type="text" value={newHighlight} onChange={(e) => setNewHighlight(e.target.value)} placeholder="Ex: Vue sur mer"
            className="flex-1 border rounded-lg px-3 py-2 text-sm" />
          <button type="button" onClick={() => { if (newHighlight) { onChange("highlights", [...highlights, newHighlight]); setNewHighlight(""); } }}
            className="px-3 py-2 bg-[#6C3EF5] text-white rounded-lg text-sm">Ajouter</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {highlights.map((h, i) => (
            <span key={i} onClick={() => onChange("highlights", highlights.filter((_, j) => j !== i))}
              className="px-3 py-1 rounded-full text-xs font-bold border bg-white text-gray-600 border-gray-200 cursor-pointer hover:bg-red-50 hover:text-red-500">
              {h} ✕
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Photo principale</label>
        <div className="flex items-center gap-3">
          {item.photo && <img src={item.photo} className="w-16 h-16 rounded-lg object-cover" alt="" />}
          <div className="flex-1 space-y-2">
            <input type="text" placeholder="URL image"
              value={item.photo?.startsWith("data:") ? "" : (item.photo || "")}
              onChange={(e) => onChange("photo", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
              <Upload className="w-4 h-4" /> Choisir photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer pt-1">
        <div onClick={() => onChange("active", !item.active)}
          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${item.active ? "bg-[#6C3EF5]" : "bg-gray-300"}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.active ? "translate-x-7" : "translate-x-1"}`} />
        </div>
        <span className="text-sm font-semibold text-gray-700">{item.active ? "Destination active" : "Destination inactive"}</span>
      </label>

      <SectionsManager destinationId={item.id} />
    </div>
  );
}

export function DestinationsAdmin() {
  const { session } = useAuth();
  const isSuperAdmin = session?.role === "superadmin" || session?.role === "dg";
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from("destinations").select("*").order("name");
        if (!error && data) { setItems(data); return; }
      } catch {}
      setItems(DEFAULT_DATA);
    };
    load();
  }, []);

  const saveItems = async (newItems: any[]) => {
    setItems(newItems);
    for (const item of newItems) {
      try {
        const { id, ...fields } = item;
        if (typeof id === "number") {
          await supabase.from("destinations").insert(fields);
        } else {
          await supabase.from("destinations").update(fields).eq("id", id);
        }
      } catch {}
    }
    const { data } = await supabase.from("destinations").select("*").order("name");
    if (data) setItems(data);
  };

  const renderForm = (item: any, onChange: (f: string, v: any) => void) => (
    <DestinationForm item={item} onChange={onChange} />
  );

  const renderCard = (item: any) => (
    <div className="flex items-center gap-3">
      {item.photo ? (
        <img src={item.photo} className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#6C3EF5] to-[#0B0A14] flex items-center justify-center text-xl shrink-0">📍</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#0B0A14] truncate">{item.name}</div>
        <div className="text-xs text-gray-500">{item.region}{item.category ? ` · ${item.category}` : ""}</div>
        <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-bold rounded-full ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {item.active ? "Actif" : "Inactif"}
        </span>
      </div>
    </div>
  );

  return (
    <CrudSection
      sectionTitle="📍 Destinations"
      items={items}
      setItems={saveItems}
      defaultItem={{ name: "", region: "Dakar", category: "plage", recommended_days: 2, active: true, rating: 5, highlights: [], desc_fr: "", desc_en: "", desc_es: "", photo: "", gallery: [], whatsapp: "" }}
      renderForm={renderForm}
      renderCard={renderCard}
      canManage={(item: any) => isSuperAdmin || item.created_by === session?.identifier}
      stampNew={(item: any) => ({ ...item, created_by: session?.identifier || null, created_by_role: session?.role || null })}
    />
  );
}
