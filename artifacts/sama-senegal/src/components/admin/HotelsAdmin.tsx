import { useState, useEffect } from "react";
import { CrudSection } from "./CrudSection";
import { usePhotoUpload } from "@/lib/photoUpload";
import { Upload } from "lucide-react";

const DEFAULT_DATA = [
  {"id":1,"name":"Maison des Esclaves Guesthouse","photo":"","type":"Maison d'hôtes","descFR":"Chambre d'hôtes historique sur Gorée","descEN":"Historic guesthouse on Gorée","descES":"Casa de huéspedes histórica en Gorée","address":"Île de Gorée","priceNight":45000,"rooms":5,"amenities":["WiFi","Petit-déjeuner","Vue mer"],"whatsapp":"+221774188107","bookingLink":"","rating":5,"active":true},
  {"id":2,"name":"Hôtel Gorée Island","photo":"","type":"Hôtel","descFR":"Hôtel avec vue panoramique","descEN":"Hotel with panoramic view","descES":"Hotel con vista panorámica","address":"Île de Gorée","priceNight":75000,"rooms":12,"amenities":["WiFi","Climatisation","Piscine","Vue mer"],"whatsapp":"+221774188107","bookingLink":"","rating":4,"active":true}
];

const TYPES = ["Hôtel", "Maison d'hôtes", "Auberge", "Villa", "Campement"];
const AMENITIES = ["WiFi", "Piscine", "Climatisation", "Petit-déjeuner", "Vue mer", "Parking"];

export function HotelsAdmin() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("hotelsData");
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { setItems(DEFAULT_DATA); }
    } else {
      setItems(DEFAULT_DATA);
    }
  }, []);

  const saveItems = (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem("hotelsData", JSON.stringify(newItems));
    window.dispatchEvent(new Event("hotelsDataUpdated"));
  };

  const renderForm = (item: any, onChange: (f: string, v: any) => void) => {
    const { fileRef, trigger, handleChange } = usePhotoUpload((b64) => onChange("photo", b64));

    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Nom de l'hébergement</label>
          <input type="text" value={item.name || ""} onChange={(e) => onChange("name", e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
        </div>
        
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Type</label>
          <select value={item.type || ""} onChange={(e) => onChange("type", e.target.value)} className="w-full border rounded-lg p-2">
            <option value="">Sélectionner...</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
              <input type="text" placeholder="URL" value={item.photo || ""} onChange={(e) => onChange("photo", e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
              <button onClick={trigger} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Upload className="w-3 h-3" /> Télécharger
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

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Adresse</label>
          <input type="text" value={item.address || ""} onChange={(e) => onChange("address", e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Prix / Nuit (FCFA)</label>
            <input type="number" value={item.priceNight || 0} onChange={(e) => onChange("priceNight", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg p-2" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre de chambres</label>
            <input type="number" value={item.rooms || 1} onChange={(e) => onChange("rooms", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg p-2" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Équipements</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(a => (
              <label key={a} className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded">
                <input type="checkbox" checked={(item.amenities || []).includes(a)} onChange={(e) => {
                  const arr = new Set(item.amenities || []);
                  if (e.target.checked) arr.add(a); else arr.delete(a);
                  onChange("amenities", Array.from(arr));
                }} /> {a}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label>
            <input type="tel" value={item.whatsapp || ""} onChange={(e) => onChange("whatsapp", e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Lien Réservation (Booking...)</label>
            <input type="url" value={item.bookingLink || ""} onChange={(e) => onChange("bookingLink", e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Note (1-5)</label>
            <input type="number" min="1" max="5" value={item.rating || 5} onChange={(e) => onChange("rating", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg p-2" />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" checked={!!item.active} onChange={(e) => onChange("active", e.target.checked)} className="w-4 h-4" />
            <label className="font-bold text-gray-700">Actif</label>
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
        <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xl shrink-0">🏨</div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
        <div className="text-xs text-gray-500 mt-1">{item.type}</div>
        <div className="text-sm font-bold text-[#D4A017] mt-1">{item.priceNight} FCFA/n</div>
        <div className="mt-2 flex justify-between items-center">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {item.active ? "Actif" : "Inactif"}
          </span>
          <span className="text-yellow-500 text-xs">{"⭐".repeat(item.rating || 5)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <CrudSection
      sectionTitle="🏨 Hébergements"
      items={items}
      setItems={saveItems}
      defaultItem={{ name: "", type: "Hôtel", active: true, rating: 5, priceNight: 0, amenities: [] }}
      renderForm={renderForm}
      renderCard={renderCard}
    />
  );
}
