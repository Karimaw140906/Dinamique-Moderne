import { useState, useEffect, useRef } from "react";
import { CrudSection } from "./CrudSection";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const CATEGORIES = ["Sénégalaise", "Internationale", "Fruits de mer", "Végétarienne", "Street food", "Fusion", "Grillades"];
const PRICE_RANGES = ["€", "€€", "€€€", "€€€€"];

const DEFAULT_DATA = [
  { id: 1, name: "Le Baobab Gourmand", cuisine: "Sénégalaise", desc_fr: "Restaurant gastronomique sénégalais en bord de mer.", desc_en: "Senegalese gastronomic restaurant by the sea.", desc_es: "Restaurante gastronómico senegalés junto al mar.", address: "Île de Gorée, Dakar", price_range: "€€€", hours: "12h-23h", rating: 5, whatsapp: "+221774188107", map_link: "", active: true, photo: "" },
  { id: 2, name: "Teranga Fish House", cuisine: "Fruits de mer", desc_fr: "Meilleure poissonnerie-restaurant de Gorée.", desc_en: "Best fish restaurant in Gorée.", desc_es: "Mejor pescadería-restaurante de Gorée.", address: "Gorée, Dakar", price_range: "€€", hours: "11h-22h", rating: 5, whatsapp: "+221774188107", map_link: "", active: true, photo: "" },
  { id: 3, name: "Chez Aminata", cuisine: "Street food", desc_fr: "Cuisine de rue authentique.", desc_en: "Authentic street food.", desc_es: "Comida callejera auténtica.", address: "Plateau, Dakar", price_range: "€", hours: "8h-20h", rating: 4, whatsapp: "+221774188107", map_link: "", active: true, photo: "" },
];

function RestaurantForm({ item, onChange }: { item: any; onChange: (f: string, v: any) => void }) {
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
          <label className="text-xs font-bold text-gray-500 uppercase">Nom *</label>
          <input type="text" value={item.name || ""} onChange={(e) => onChange("name", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Cuisine</label>
          <select value={item.cuisine || "Sénégalaise"} onChange={(e) => onChange("cuisine", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Adresse</label>
          <input type="text" value={item.address || ""} onChange={(e) => onChange("address", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Horaires</label>
          <input type="text" value={item.hours || ""} onChange={(e) => onChange("hours", e.target.value)} placeholder="ex: 12h-23h" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label>
          <input type="tel" value={item.whatsapp || ""} onChange={(e) => onChange("whatsapp", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Prix</label>
          <select value={item.price_range || "€€"} onChange={(e) => onChange("price_range", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
            {PRICE_RANGES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Note (1-5)</label>
          <input type="number" min={1} max={5} value={item.rating || 5} onChange={(e) => onChange("rating", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Lien Google Maps</label>
        <input type="text" value={item.map_link || ""} onChange={(e) => onChange("map_link", e.target.value)} placeholder="https://maps.google.com/..." className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
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
          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${item.active ? "bg-[#6C3EF5]" : "bg-gray-300"}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.active ? "translate-x-7" : "translate-x-1"}`} />
        </div>
        <span className="text-sm font-semibold text-gray-700">{item.active ? "Restaurant actif" : "Restaurant inactif"}</span>
      </label>
    </div>
  );
}

export function RestaurantsAdmin() {
  const { session } = useAuth();
  const isSuperAdmin = session?.role === "superadmin" || session?.role === "dg";
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from("restaurants").select("*").order("id");
        if (!error && data && data.length > 0) {
          setItems(data);
          localStorage.setItem("restaurantsData", JSON.stringify(data));
          return;
        }
      } catch {}
      // Fallback localStorage
      try {
        const saved = localStorage.getItem("restaurantsData");
        setItems(saved ? JSON.parse(saved) : DEFAULT_DATA);
      } catch { setItems(DEFAULT_DATA); }
    };
    load();
  }, []);

  const saveItems = async (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem("restaurantsData", JSON.stringify(newItems));
    window.dispatchEvent(new Event("restaurantsDataUpdated"));

    // Sync Supabase — upsert chaque item
    for (const item of newItems) {
      try {
        const { id, ...fields } = item;
        if (typeof id === "number") {
          // ID numérique = donnée par défaut, on insert
          await supabase.from("restaurants").upsert({ ...fields }, { onConflict: "name" });
        } else {
          // UUID Supabase = update
          await supabase.from("restaurants").update(fields).eq("id", id);
        }
      } catch {}
    }
  };

  const renderForm = (item: any, onChange: (f: string, v: any) => void) => (
    <RestaurantForm item={item} onChange={onChange} />
  );

  const renderCard = (item: any) => (
    <div className="flex items-center gap-3">
      {item.photo ? (
        <img src={item.photo} className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#C2622D] to-[#5C3D1E] flex items-center justify-center text-xl shrink-0">🍽️</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#0B0A14] truncate">{item.name}</div>
        <div className="text-xs text-gray-500">{item.cuisine} · {item.price_range} · {item.hours}</div>
        <div className="text-xs text-gray-400 truncate">{item.address}</div>
        <div className="mt-1 flex gap-1 flex-wrap">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {item.active ? "Actif" : "Inactif"}
          </span>
          <span className="text-xs text-yellow-500">{"⭐".repeat(Math.min(item.rating || 5, 5))}</span>
        </div>
      </div>
    </div>
  );

  return (
    <CrudSection
      sectionTitle="🍽️ Restaurants"
      items={items}
      setItems={saveItems}
      defaultItem={{ name: "", cuisine: "Sénégalaise", active: true, rating: 5, price_range: "€€", hours: "", desc_fr: "", desc_en: "", desc_es: "", address: "", whatsapp: "", map_link: "", photo: "" }}
      renderForm={renderForm}
      renderCard={renderCard}
      canManage={(item: any) => isSuperAdmin || item.created_by === session?.identifier}
      stampNew={(item: any) => ({ ...item, created_by: session?.identifier || null, created_by_role: session?.role || null })}
    />
  );
}
