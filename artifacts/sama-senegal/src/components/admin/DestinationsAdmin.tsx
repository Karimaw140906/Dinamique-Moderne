import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import { CrudSection } from "./CrudSection";
import { Upload } from "lucide-react";

const REGIONS = ["Dakar", "Thiès", "Saint-Louis", "Casamance", "Sine-Saloum", "Ferlo"];

const DEFAULT_DATA = [
  { id: 1, name: "Île de Gorée", region: "Dakar", desc_fr: "Île historique classée UNESCO.", desc_en: "UNESCO-listed historic island.", desc_es: "Isla histórica declarada Patrimonio de la UNESCO.", rating: 5, highlights: ["Maison des Esclaves", "Vue sur Dakar"], photo: "", gallery: [], active: true },
];

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
        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Points forts</label>
        <div className="flex gap-2 mb-2">
          <input type="text" value={newHighlight} onChange={(e) => setNewHighlight(e.target.value)} placeholder="Ex: Vue sur mer"
            className="flex-1 border rounded-lg px-3 py-2 text-sm" />
          <button type="button" onClick={() => { if (newHighlight) { onChange("highlights", [...highlights, newHighlight]); setNewHighlight(""); } }}
            className="px-3 py-2 bg-[#2C7A5C] text-white rounded-lg text-sm">Ajouter</button>
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
          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${item.active ? "bg-[#2C7A5C]" : "bg-gray-300"}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.active ? "translate-x-7" : "translate-x-1"}`} />
        </div>
        <span className="text-sm font-semibold text-gray-700">{item.active ? "Destination active" : "Destination inactive"}</span>
      </label>
    </div>
  );
}

export function DestinationsAdmin() {
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
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2C7A5C] to-[#1A1A2E] flex items-center justify-center text-xl shrink-0">📍</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#1A1A2E] truncate">{item.name}</div>
        <div className="text-xs text-gray-500">{item.region}</div>
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
      defaultItem={{ name: "", region: "Dakar", active: true, rating: 5, highlights: [], desc_fr: "", desc_en: "", desc_es: "", photo: "", gallery: [] }}
      renderForm={renderForm}
      renderCard={renderCard}
    />
  );
}
