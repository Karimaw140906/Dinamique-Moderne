import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import { CrudSection } from "./CrudSection";
import { Upload } from "lucide-react";

const CATEGORIES = ["Berline", "SUV", "Minibus", "Bus", "Moto", "Pirogue", "4x4", "Van"];

const DEFAULT_DATA = [
  { id: 1, name: "Toyota Land Cruiser", category: "4x4", desc_fr: "4x4 luxueux idéal pour les excursions en brousse et les routes difficiles du Sénégal.", desc_en: "Luxurious 4x4 ideal for bush excursions and difficult roads in Senegal.", desc_es: "4x4 lujoso ideal para excursiones por el campo y carreteras difíciles de Senegal.", seats: 7, aircon: true, driver_included: true, price_day: 60000, price_half: 35000, whatsapp: "+221774188107", active: true, photo: "" },
  { id: 2, name: "Mercedes Classe E", category: "Berline", desc_fr: "Berline de luxe avec chauffeur professionnel pour transferts aéroport et city tours.", desc_en: "Luxury sedan with professional driver for airport transfers and city tours.", desc_es: "Sedán de lujo con conductor profesional para traslados al aeropuerto y city tours.", seats: 4, aircon: true, driver_included: true, price_day: 45000, price_half: 25000, whatsapp: "+221774188107", active: true, photo: "" },
  { id: 3, name: "Minibus 14 places", category: "Minibus", desc_fr: "Minibus confortable pour groupes, transferts et excursions jusqu'à 14 personnes.", desc_en: "Comfortable minibus for groups, transfers and excursions up to 14 people.", desc_es: "Minibús cómodo para grupos, traslados y excursiones de hasta 14 personas.", seats: 14, aircon: true, driver_included: true, price_day: 75000, price_half: 45000, whatsapp: "+221774188107", active: true, photo: "" },
];

function TransportForm({ item, onChange }: { item: any; onChange: (f: string, v: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

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
          <label className="text-xs font-bold text-gray-500 uppercase">Nom du véhicule *</label>
          <input type="text" value={item.name || ""} onChange={(e) => onChange("name", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Catégorie</label>
          <select value={item.category || "SUV"} onChange={(e) => onChange("category", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Places</label>
          <input type="number" min={1} value={item.seats || 4} onChange={(e) => onChange("seats", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Prix/jour (FCFA)</label>
          <input type="number" min={0} value={item.price_day || 0} onChange={(e) => onChange("price_day", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Prix demi-journée</label>
          <input type="number" min={0} value={item.price_half || 0} onChange={(e) => onChange("price_half", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label>
        <input type="tel" value={item.whatsapp || ""} onChange={(e) => onChange("whatsapp", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="flex flex-wrap gap-4 pt-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={!!item.aircon} onChange={(e) => onChange("aircon", e.target.checked)} className="w-4 h-4 accent-[#2C7A5C]" />
          Climatisé
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={!!item.driver_included} onChange={(e) => onChange("driver_included", e.target.checked)} className="w-4 h-4 accent-[#2C7A5C]" />
          Chauffeur inclus
        </label>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Photo</label>
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
        <span className="text-sm font-semibold text-gray-700">{item.active ? "Véhicule actif" : "Véhicule inactif"}</span>
      </label>
    </div>
  );
}

export function TransportAdmin() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from("transport").select("*").order("id");
        if (!error && data && data.length > 0) {
          setItems(data);
          localStorage.setItem("transportData", JSON.stringify(data));
          return;
        }
      } catch {}
      try {
        const saved = localStorage.getItem("transportData");
        setItems(saved ? JSON.parse(saved) : DEFAULT_DATA);
      } catch { setItems(DEFAULT_DATA); }
    };
    load();
  }, []);
  const saveItems = async (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem("transportData", JSON.stringify(newItems));
    window.dispatchEvent(new Event("transportDataUpdated"));
    for (const item of newItems) {
      try {
        const { id, ...fields } = item;
        if (typeof id === "number") {
          await supabase.from("transport").upsert({ ...fields }, { onConflict: "name" });
        } else {
          await supabase.from("transport").update(fields).eq("id", id);
        }
      } catch {}
    }
  };

  const renderForm = (item: any, onChange: (f: string, v: any) => void) => (
    <TransportForm item={item} onChange={onChange} />
  );

  const renderCard = (item: any) => (
    <div className="flex items-center gap-3">
      {item.photo ? (
        <img src={item.photo} className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1A1A2E] to-[#2C7A5C] flex items-center justify-center text-xl shrink-0">🚗</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#1A1A2E] truncate">{item.name}</div>
        <div className="text-xs text-gray-500">{item.category} · {item.seats} places · {(item.price_day || 0).toLocaleString()} FCFA/jour</div>
        <div className="text-xs text-gray-400">
          {item.aircon ? "✓ Clim " : ""}
          {item.driver_included ? "✓ Chauffeur" : ""}
        </div>
        <div className="mt-1">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {item.active ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <CrudSection
      sectionTitle="🚗 Transport"
      items={items}
      setItems={saveItems}
      defaultItem={{ name: "", category: "SUV", active: true, seats: 4, aircon: true, driver_included: true, price_day: 0, price_half: 0, desc_fr: "", desc_en: "", desc_es: "", whatsapp: "", photo: "" }}
      renderForm={renderForm}
      renderCard={renderCard}
    />
  );
}
