import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import { CrudSection } from "./CrudSection";
import { Upload } from "lucide-react";

const DEFAULT_DATA = [
  { id: 1, nameFR: "Thiéboudienne", nameEN: "Thiéboudienne (Rice & Fish)", nameES: "Arroz con Pescado", photo: "", category: "Plat principal", descFR: "Le plat national sénégalais, riz au poisson et légumes", descEN: "The Senegalese national dish, rice with fish and vegetables", descES: "El plato nacional senegalés, arroz con pescado y verduras", price: 3500, prepTime: 30, spiceLevel: "Moyen", available: true },
  { id: 2, nameFR: "Yassa Poulet", nameEN: "Chicken Yassa", nameES: "Pollo Yassa", photo: "", category: "Plat principal", descFR: "Poulet mariné au citron et oignons caramélisés", descEN: "Chicken marinated in lemon and caramelized onions", descES: "Pollo marinado en limón y cebollas caramelizadas", price: 3000, prepTime: 25, spiceLevel: "Moyen", available: true },
  { id: 3, nameFR: "Café Touba", nameEN: "Touba Coffee", nameES: "Café Touba", photo: "", category: "Boisson", descFR: "Café épicé traditionnel sénégalais", descEN: "Traditional Senegalese spiced coffee", descES: "Café especiado tradicional senegalés", price: 500, prepTime: 5, spiceLevel: "Doux", available: true },
  { id: 4, nameFR: "Bissap", nameEN: "Bissap Juice", nameES: "Jugo de Bissap", photo: "", category: "Boisson", descFR: "Jus d'hibiscus frais", descEN: "Fresh hibiscus juice", descES: "Jugo fresco de hibisco", price: 700, prepTime: 2, spiceLevel: "Doux", available: true },
];

const CATEGORIES = ["Entrée", "Plat principal", "Dessert", "Boisson", "Street food"];
const SPICE_LEVELS = ["Doux", "Moyen", "Épicé"];

function MenuForm({ item, onChange }: { item: any; onChange: (f: string, v: any) => void }) {
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
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Nom FR</label>
        <input type="text" value={item.nameFR || ""} onChange={(e) => onChange("nameFR", e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Nom EN</label>
        <input type="text" value={item.nameEN || ""} onChange={(e) => onChange("nameEN", e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Nom ES</label>
        <input type="text" value={item.nameES || ""} onChange={(e) => onChange("nameES", e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Catégorie</label>
        <select value={item.category || ""} onChange={(e) => onChange("category", e.target.value)} className="w-full border rounded-lg p-2">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Photo</label>
        <div className="flex items-center gap-4 mb-2">
          {item.photo ? (
            <img src={item.photo} alt="" className="w-16 h-16 object-cover border rounded-lg" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">Aucune</div>
          )}
          <div className="flex-1 space-y-2">
            <input type="text" placeholder="URL image"
              value={item.photo?.startsWith("data:") ? "" : (item.photo || "")}
              onChange={(e) => onChange("photo", e.target.value)}
              className="w-full border rounded-lg p-2 text-sm" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Upload className="w-3 h-3" /> Télécharger
            </button>
            <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Description FR</label>
        <textarea value={item.descFR || ""} onChange={(e) => onChange("descFR", e.target.value)} className="w-full mt-1 border rounded-lg p-2 resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Description EN</label>
        <textarea value={item.descEN || ""} onChange={(e) => onChange("descEN", e.target.value)} className="w-full mt-1 border rounded-lg p-2 resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Description ES</label>
        <textarea value={item.descES || ""} onChange={(e) => onChange("descES", e.target.value)} className="w-full mt-1 border rounded-lg p-2 resize-none" rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Prix (FCFA)</label>
          <input type="number" value={item.price || 0} onChange={(e) => onChange("price", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg p-2" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Préparation (min)</label>
          <input type="number" value={item.prepTime || 15} onChange={(e) => onChange("prepTime", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg p-2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Niveau épice</label>
          <select value={item.spiceLevel || "Doux"} onChange={(e) => onChange("spiceLevel", e.target.value)} className="w-full mt-1 border rounded-lg p-2">
            {SPICE_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={!!item.available} onChange={(e) => onChange("available", e.target.checked)} className="w-4 h-4 accent-[#6C3EF5]" />
          <label className="font-bold text-gray-700 cursor-pointer">Disponible</label>
        </div>
      </div>
    </div>
  );
}

export function MenuAdmin() {
  const { session } = useAuth();
  const isSuperAdmin = session?.role === "superadmin" || session?.role === "dg";
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from("menu").select("*").order("id");
        if (!error && data && data.length > 0) {
          setItems(data);
          localStorage.setItem("menuData", JSON.stringify(data));
          return;
        }
      } catch {}
      try {
        const saved = localStorage.getItem("menuData");
        setItems(saved ? JSON.parse(saved) : DEFAULT_DATA);
      } catch { setItems(DEFAULT_DATA); }
    };
    load();
  }, []);
  const saveItems = async (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem("menuData", JSON.stringify(newItems));
    window.dispatchEvent(new Event("menuDataUpdated"));
    for (const item of newItems) {
      try {
        const { id, ...fields } = item;
        if (typeof id === "number") {
          await supabase.from("menu").upsert({ ...fields }, { onConflict: "name_fr" });
        } else {
          await supabase.from("menu").update(fields).eq("id", id);
        }
      } catch {}
    }
  };

  const renderForm = (item: any, onChange: (f: string, v: any) => void) => (
    <MenuForm item={item} onChange={onChange} />
  );

  const renderCard = (item: any) => (
    <div className="flex gap-3">
      {item.photo ? (
        <img src={item.photo} className="w-16 h-16 rounded object-cover shrink-0" alt="" />
      ) : (
        <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xl shrink-0">🛒</div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 truncate">{item.nameFR}</h3>
        <div className="text-xs text-gray-500 mt-1">{item.category} · {item.spiceLevel} · {item.prepTime}min</div>
        <div className="text-sm font-bold text-[#F5B942] mt-1">{(item.price || 0).toLocaleString()} FCFA</div>
        <div className="mt-2">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {item.available ? "Disponible" : "Épuisé"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <CrudSection
      sectionTitle="🛒 Menu & Commandes"
      items={items}
      setItems={saveItems}
      defaultItem={{ nameFR: "", category: "Plat principal", available: true, price: 0, spiceLevel: "Doux", prepTime: 15 }}
      renderForm={renderForm}
      renderCard={renderCard}
      canManage={(item: any) => isSuperAdmin || item.created_by === session?.identifier}
      stampNew={(item: any) => ({ ...item, created_by: session?.identifier || null, created_by_role: session?.role || null })}
    />
  );
}
