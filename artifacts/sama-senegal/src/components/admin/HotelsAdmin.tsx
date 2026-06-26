import { useState, useEffect, useRef } from "react";
import { CrudSection } from "./CrudSection";
import { Upload } from "lucide-react";

const TYPES = ["Hôtel", "Appartement", "Villa", "Auberge", "Resort", "Maison d'hôtes"];
const AMENITIES = ["WiFi", "Piscine", "Clim", "Parking", "Restaurant", "Bar", "Spa", "Salle de sport", "Vue mer", "Terrasse"];

const DEFAULT_DATA = [
  { id: 1, name: "Hôtel de Gorée", type: "Hôtel", desc_fr: "Hôtel colonial au cœur de l'île historique de Gorée, vue imprenable sur l'Atlantique.", desc_en: "Colonial hotel in the heart of historic Gorée Island, stunning Atlantic view.", desc_es: "Hotel colonial en el corazón de la isla histórica de Gorée, impresionante vista al Atlántico.", address: "Île de Gorée, Dakar", price_night: 65000, rooms: 18, rating: 5, amenities: ["WiFi", "Vue mer", "Terrasse"], whatsapp: "+221774188107", booking_link: "", active: true, photo: "" },
  { id: 2, name: "Villa Ngor", type: "Villa", desc_fr: "Villa de luxe en bord de mer à Ngor, accès privé à la plage.", desc_en: "Luxury beachfront villa in Ngor with private beach access.", desc_es: "Villa de lujo frente al mar en Ngor con acceso privado a la playa.", address: "Ngor, Dakar", price_night: 120000, rooms: 4, rating: 5, amenities: ["WiFi", "Piscine", "Clim", "Vue mer", "Parking"], whatsapp: "+221774188107", booking_link: "", active: true, photo: "" },
  { id: 3, name: "Auberge du Soleil", type: "Auberge", desc_fr: "Auberge authentique au cœur du Plateau, ambiance chaleureuse et accueil familial.", desc_en: "Authentic inn in the heart of Le Plateau, warm atmosphere and family welcome.", desc_es: "Posada auténtica en el corazón del Plateau, ambiente cálido y acogida familiar.", address: "Le Plateau, Dakar", price_night: 25000, rooms: 12, rating: 4, amenities: ["WiFi", "Clim", "Restaurant"], whatsapp: "+221774188107", booking_link: "", active: true, photo: "" },
];

function HotelForm({ item, onChange }: { item: any; onChange: (f: string, v: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const amenities: string[] = item.amenities || [];

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
          <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
          <select value={item.type || "Hôtel"} onChange={(e) => onChange("type", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
            {TYPES.map((t) => <option key={t}>{t}</option>)}
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
        <label className="text-xs font-bold text-gray-500 uppercase">Descripción ES</label>
        <textarea value={item.desc_es || ""} onChange={(e) => onChange("desc_es", e.target.value)} rows={2} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Adresse</label>
          <input type="text" value={item.address || ""} onChange={(e) => onChange("address", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label>
          <input type="tel" value={item.whatsapp || ""} onChange={(e) => onChange("whatsapp", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Chambres</label>
          <input type="number" min={1} value={item.rooms || 1} onChange={(e) => onChange("rooms", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Prix/nuit (FCFA)</label>
          <input type="number" min={0} value={item.price_night || 0} onChange={(e) => onChange("price_night", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Note (1-5)</label>
          <input type="number" min={1} max={5} value={item.rating || 5} onChange={(e) => onChange("rating", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Lien réservation</label>
        <input type="text" value={item.booking_link || ""} onChange={(e) => onChange("booking_link", e.target.value)} placeholder="https://..." className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Équipements</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button key={a} type="button" onClick={() => {
              const next = amenities.includes(a) ? amenities.filter((x) => x !== a) : [...amenities, a];
              onChange("amenities", next);
            }} className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${amenities.includes(a) ? "bg-[#2C7A5C] text-white border-[#2C7A5C]" : "bg-white text-gray-600 border-gray-200 hover:border-[#2C7A5C]"}`}>
              {a}
            </button>
          ))}
        </div>
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
        <span className="text-sm font-semibold text-gray-700">{item.active ? "Hébergement actif" : "Hébergement inactif"}</span>
      </label>
    </div>
  );
}

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

  const renderForm = (item: any, onChange: (f: string, v: any) => void) => (
    <HotelForm item={item} onChange={onChange} />
  );

  const renderCard = (item: any) => (
    <div className="flex items-center gap-3">
      {item.photo ? (
        <img src={item.photo} className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2C7A5C] to-[#1A1A2E] flex items-center justify-center text-xl shrink-0">🏨</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#1A1A2E] truncate">{item.name}</div>
        <div className="text-xs text-gray-500">{item.type} · {item.rooms} ch. · {(item.price_night || 0).toLocaleString()} FCFA/nuit</div>
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
      sectionTitle="🏨 Hébergements"
      items={items}
      setItems={saveItems}
      defaultItem={{ name: "", type: "Hôtel", active: true, rating: 5, rooms: 1, price_night: 0, amenities: [], desc_fr: "", desc_en: "", desc_es: "", address: "", whatsapp: "", booking_link: "", photo: "" }}
      renderForm={renderForm}
      renderCard={renderCard}
    />
  );
}
