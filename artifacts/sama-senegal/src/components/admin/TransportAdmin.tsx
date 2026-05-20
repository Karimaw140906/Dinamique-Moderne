import { useState, useEffect } from "react";
import { CrudSection } from "./CrudSection";
import { usePhotoUpload } from "@/lib/photoUpload";
import { Upload } from "lucide-react";

const DEFAULT_TRANSPORT = [
  {"id":1,"name":"Toyota Land Cruiser","category":"SUV","photo":"","descFR":"4x4 confortable pour toutes destinations","descEN":"Comfortable 4x4 for all destinations","descES":"4x4 cómodo para todos los destinos","priceDay":50000,"priceHalf":30000,"seats":7,"driverIncluded":true,"aircon":true,"active":true},
  {"id":2,"name":"Minibus Confort","category":"Minibus","photo":"","descFR":"Idéal pour les groupes","descEN":"Ideal for groups","descES":"Ideal para grupos","priceDay":80000,"priceHalf":45000,"seats":15,"driverIncluded":true,"aircon":true,"active":true},
  {"id":3,"name":"Peugeot 208","category":"Berline","photo":"","descFR":"Citadine économique","descEN":"Economical city car","descES":"Coche urbano económico","priceDay":25000,"priceHalf":15000,"seats":4,"driverIncluded":false,"aircon":true,"active":true}
];

const CATEGORIES = ["Berline", "SUV", "Minibus", "4x4", "Moto-taxi", "Pirogue"];

export function TransportAdmin() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("transportData");
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { setItems(DEFAULT_TRANSPORT); }
    } else {
      setItems(DEFAULT_TRANSPORT);
    }
  }, []);

  const saveItems = (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem("transportData", JSON.stringify(newItems));
    window.dispatchEvent(new Event("transportDataUpdated"));
  };

  const renderForm = (item: any, onChange: (f: string, v: any) => void) => {
    const { fileRef, trigger, handleChange } = usePhotoUpload((b64) => onChange("photo", b64));

    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Nom du véhicule</label>
          <input type="text" value={item.name || ""} onChange={(e) => onChange("name", e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
        </div>
        
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Catégorie</label>
          <select value={item.category || ""} onChange={(e) => onChange("category", e.target.value)} className="w-full border rounded-lg p-2">
            <option value="">Sélectionner...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Photo (URL ou Fichier)</label>
          <div className="flex items-center gap-4 mb-2">
            {item.photo ? (
              <img src={item.photo} alt="" className="w-16 h-16 object-cover border rounded-lg" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">Aucune</div>
            )}
            <div className="flex-1 space-y-2">
              <input type="text" placeholder="URL" value={item.photo || ""} onChange={(e) => onChange("photo", e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
              <button onClick={trigger} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Upload className="w-3 h-3" /> Télécharger image
              </button>
              <input type="file" ref={fileRef} onChange={handleChange} className="hidden" accept="image/*" />
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
            <label className="text-xs font-bold text-gray-500 uppercase">Prix / Jour (FCFA)</label>
            <input type="number" value={item.priceDay || 0} onChange={(e) => onChange("priceDay", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg p-2" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Prix / Demi-jour (FCFA)</label>
            <input type="number" value={item.priceHalf || 0} onChange={(e) => onChange("priceHalf", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg p-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Places (sièges)</label>
            <input type="number" value={item.seats || 4} onChange={(e) => onChange("seats", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg p-2" />
          </div>
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!item.driverIncluded} onChange={(e) => onChange("driverIncluded", e.target.checked)} />
              Chauffeur inclus
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!item.aircon} onChange={(e) => onChange("aircon", e.target.checked)} />
              Climatisation
            </label>
            <label className="flex items-center gap-2 text-sm font-bold pt-2 border-t">
              <input type="checkbox" checked={!!item.active} onChange={(e) => onChange("active", e.target.checked)} />
              Actif (Visible)
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderCard = (item: any) => (
    <div className="flex gap-3">
      {item.photo ? (
        <img src={item.photo} className="w-16 h-16 rounded object-cover shrink-0" alt="" />
      ) : (
        <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xl shrink-0">🚗</div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
        <div className="text-xs text-gray-500 mt-1">{item.category} • {item.seats} places</div>
        <div className="text-sm font-bold text-[#D4A017] mt-1">{item.priceDay} FCFA/j</div>
        <div className="mt-2">
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
      defaultItem={{ name: "", category: "Berline", active: true, seats: 4, priceDay: 0, priceHalf: 0, driverIncluded: true, aircon: true }}
      renderForm={renderForm}
      renderCard={renderCard}
    />
  );
}
