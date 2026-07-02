import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import { CrudSection } from "./CrudSection";
import { Upload } from "lucide-react";

const GRADIENTS = [
  { label: "Vert → Nuit",       value: "from-[#2C7A5C] to-[#1A1A2E]" },
  { label: "Terracotta → Café", value: "from-[#C2622D] to-[#5C3D1E]" },
  { label: "Or → Café",         value: "from-[#D4A017] to-[#5C3D1E]" },
  { label: "Vert → Terracotta", value: "from-[#2C7A5C] to-[#C2622D]" },
  { label: "Nuit → Or",         value: "from-[#1A1A2E] to-[#D4A017]" },
  { label: "Terracotta → Vert", value: "from-[#C2622D] to-[#2C7A5C]" },
  { label: "Nuit → Vert",       value: "from-[#1A1A2E] to-[#2C7A5C]" },
  { label: "Or → Vert",         value: "from-[#D4A017] to-[#2C7A5C]" },
];

export const DEFAULT_TOURS = [
  { id: 1, emoji: "🏛️", nameFR: "Visite guidée Île de Gorée", nameEN: "Guided Tour Gorée Island",    nameES: "Visita Guiada Isla de Gorée",   descFR: "Découvrez l'histoire et l'architecture coloniale de Gorée.",                      descEN: "Discover the history and colonial architecture of Gorée.",          descES: "Descubre la historia y arquitectura colonial de Gorée.",          duration: "4-5h",      price: 15000, location: "Île de Gorée",   photo: "", gradient: "from-[#2C7A5C] to-[#1A1A2E]", active: true },
  { id: 2, emoji: "🏙",  nameFR: "City Tour Dakar",            nameEN: "Dakar City Tour",             nameES: "Tour por la Ciudad de Dakar",   descFR: "Explorez les quartiers emblématiques de Dakar avec un guide expert.",            descEN: "Explore Dakar's iconic neighborhoods with an expert guide.",       descES: "Explora los barrios icónicos de Dakar con un guía experto.",      duration: "3-4h",      price: 20000, location: "Dakar",         photo: "", gradient: "from-[#C2622D] to-[#5C3D1E]", active: true },
  { id: 3, emoji: "🦒",  nameFR: "Excursion Bandia",           nameEN: "Bandia Safari Excursion",     nameES: "Excursión Safari Bandia",        descFR: "Safari au cœur de la réserve naturelle de Bandia, rencontrez girafes et lions.", descEN: "Safari in the heart of the Bandia nature reserve.",               descES: "Safari en el corazón de la reserva natural de Bandia.",           duration: "1 journée", price: 35000, location: "Bandia",        photo: "", gradient: "from-[#D4A017] to-[#5C3D1E]", active: true },
  { id: 4, emoji: "🎒",  nameFR: "Combo Gorée+Dakar",          nameEN: "Gorée+Dakar Combo",           nameES: "Combo Gorée+Dakar",              descFR: "Profitez du meilleur des deux mondes : île historique et capitale vibrante.",   descEN: "Enjoy the best of both worlds: historic island and vibrant capital.", descES: "Disfruta lo mejor de ambos mundos: isla histórica y capital vibrante.", duration: "1 journée", price: 30000, location: "Gorée & Dakar", photo: "", gradient: "from-[#2C7A5C] to-[#C2622D]", active: true },
  { id: 5, emoji: "🌅",  nameFR: "Coucher de soleil Gorée",   nameEN: "Gorée Sunset Tour",           nameES: "Atardecer en Gorée",             descFR: "Vivez la magie du coucher de soleil depuis l'île de Gorée.",               descEN: "Experience the magic of sunset from Gorée Island.",             descES: "Vive la magia del atardecer desde la isla de Gorée.",            duration: "2h",        price: 10000, location: "Île de Gorée",   photo: "", gradient: "from-[#1A1A2E] to-[#D4A017]", active: true },
  { id: 6, emoji: "🏜️",  nameFR: "Lac Rose",                  nameEN: "Pink Lake (Lac Rose)",        nameES: "Lago Rosa",                      descFR: "Le phénomène naturel unique du Lac Rose et ses extractions de sel.",        descEN: "The unique natural phenomenon of the Pink Lake and its salt extractions.", descES: "El fenómeno natural único del Lago Rosa y sus extracciones de sal.", duration: "1 journée", price: 25000, location: "Lac Rose",      photo: "", gradient: "from-[#C2622D] to-[#2C7A5C]", active: true },
];

function TourForm({ item, onChange }: { item: any; onChange: (f: string, v: any) => void }) {
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
      {/* Photo */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Photo du Tour</label>
        {item.photo ? (
          <div className="relative rounded-xl overflow-hidden mb-2">
            <img src={item.photo} alt="" className="w-full h-40 object-cover rounded-xl" />
            <button type="button" onClick={() => onChange("photo", "")}
              className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600">✕</button>
          </div>
        ) : (
          <div className="w-full h-28 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm mb-2 border-2 border-dashed border-gray-200">
            Aucune photo
          </div>
        )}
        <div className="flex gap-2">
          <input type="text" placeholder="URL de l'image"
            value={item.photo?.startsWith("data:") ? "" : (item.photo || "")}
            onChange={(e) => onChange("photo", e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg p-2 text-sm" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg flex items-center gap-1 shrink-0">
            <Upload className="w-3 h-3" /> Upload
          </button>
          <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*" />
        </div>
      </div>

      {/* Emoji + Gradient */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Émoji</label>
          <input type="text" value={item.emoji || ""} onChange={(e) => onChange("emoji", e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-2xl text-center" maxLength={2} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Couleur</label>
          <select value={item.gradient || GRADIENTS[0].value} onChange={(e) => onChange("gradient", e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm bg-white">
            {GRADIENTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
      </div>
      <div className={`w-full h-5 rounded-lg bg-gradient-to-br ${item.gradient || GRADIENTS[0].value}`} />

      {/* Names */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Nom FR *</label>
        <input type="text" value={item.nameFR || ""} onChange={(e) => onChange("nameFR", e.target.value)}
          placeholder="Nom du tour en français"
          className="w-full mt-1 border border-gray-200 rounded-lg p-2" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Nom EN</label>
        <input type="text" value={item.nameEN || ""} onChange={(e) => onChange("nameEN", e.target.value)}
          placeholder="Tour name in English"
          className="w-full mt-1 border border-gray-200 rounded-lg p-2" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Nom ES</label>
        <input type="text" value={item.nameES || ""} onChange={(e) => onChange("nameES", e.target.value)}
          placeholder="Nombre del tour en español"
          className="w-full mt-1 border border-gray-200 rounded-lg p-2" />
      </div>

      {/* Descriptions */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Description FR</label>
        <textarea value={item.descFR || ""} onChange={(e) => onChange("descFR", e.target.value)}
          className="w-full mt-1 border border-gray-200 rounded-lg p-2 resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Description EN</label>
        <textarea value={item.descEN || ""} onChange={(e) => onChange("descEN", e.target.value)}
          className="w-full mt-1 border border-gray-200 rounded-lg p-2 resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Description ES</label>
        <textarea value={item.descES || ""} onChange={(e) => onChange("descES", e.target.value)}
          className="w-full mt-1 border border-gray-200 rounded-lg p-2 resize-none" rows={2} />
      </div>

      {/* Duration + Price + Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Durée</label>
          <input type="text" value={item.duration || ""} onChange={(e) => onChange("duration", e.target.value)}
            placeholder="ex: 4-5h, 1 journée"
            className="w-full mt-1 border border-gray-200 rounded-lg p-2" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Prix (FCFA)</label>
          <input type="number" value={item.price || 0} onChange={(e) => onChange("price", parseInt(e.target.value) || 0)}
            min="0" step="500"
            className="w-full mt-1 border border-gray-200 rounded-lg p-2" />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Lieu</label>
        <input type="text" value={item.location || ""} onChange={(e) => onChange("location", e.target.value)}
          placeholder="ex: Île de Gorée, Dakar"
          className="w-full mt-1 border border-gray-200 rounded-lg p-2" />
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer pt-2">
        <div onClick={() => onChange("active", !item.active)}
          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${item.active ? "bg-[#2C7A5C]" : "bg-gray-300"}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.active ? "translate-x-7" : "translate-x-1"}`} />
        </div>
        <span className="text-sm font-semibold text-gray-700">
          {item.active ? "Tour actif (visible sur le site)" : "Tour inactif (masqué)"}
        </span>
      </label>
    </div>
  );
}

export function ToursAdmin() {
  const { session } = useAuth();
  const isSuperAdmin = session?.role === "superadmin" || session?.role === "dg";
  const [tours, setTours] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from("tours").select("*").order("id");
        if (!error && data && data.length > 0) {
          setTours(data);
          localStorage.setItem("toursData", JSON.stringify(data));
          return;
        }
      } catch {}
      try {
        const saved = localStorage.getItem("toursData");
        setTours(saved ? JSON.parse(saved) : DEFAULT_TOURS);
      } catch { setTours(DEFAULT_TOURS); }
    };
    load();
  }, []);
  const saveTours = async (newTours: any[]) => {
    setTours(newTours);
    localStorage.setItem("toursData", JSON.stringify(newTours));
    window.dispatchEvent(new Event("toursDataUpdated"));
    for (const item of newTours) {
      try {
        const { id, ...fields } = item;
        if (typeof id === "number") {
          await supabase.from("tours").upsert({ ...fields }, { onConflict: "name" });
        } else {
          await supabase.from("tours").update(fields).eq("id", id);
        }
      } catch {}
    }
  };

  const renderForm = (item: any, onChange: (f: string, v: any) => void) => (
    <TourForm item={item} onChange={onChange} />
  );

  const renderCard = (item: any) => (
    <div>
      {item.photo ? (
        <img src={item.photo} alt={item.nameFR} className="w-full h-32 object-cover rounded-lg mb-3" />
      ) : (
        <div className={`w-full h-14 rounded-lg bg-gradient-to-br ${item.gradient || "from-[#2C7A5C] to-[#1A1A2E]"} mb-3 flex items-center justify-center text-3xl`}>
          {item.emoji}
        </div>
      )}
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-800 text-sm leading-snug truncate">{item.nameFR}</h3>
          <div className="text-xs text-gray-500 mt-0.5">{item.duration} · {item.location}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold text-[#D4A017] text-sm">{(item.price || 0).toLocaleString()}</div>
          <div className="text-[10px] text-gray-400">FCFA</div>
        </div>
      </div>
      <div className="mt-2">
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {item.active ? "Actif" : "Inactif"}
        </span>
      </div>
    </div>
  );

  return (
    <CrudSection
      sectionTitle="🗺️ Tours & Excursions"
      items={tours}
      setItems={saveTours}
      defaultItem={{
        emoji: "🌟", nameFR: "", nameEN: "", nameES: "",
        descFR: "", descEN: "", descES: "",
        duration: "", price: 0, location: "", photo: "",
        gradient: "from-[#2C7A5C] to-[#1A1A2E]", active: true,
      }}
      renderForm={renderForm}
      renderCard={renderCard}
      canManage={(item: any) => isSuperAdmin || item.created_by === session?.identifier}
      stampNew={(item: any) => ({ ...item, created_by: session?.identifier || null, created_by_role: session?.role || null })}
    />
  );
}
