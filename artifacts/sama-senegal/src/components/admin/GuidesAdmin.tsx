import { useState, useEffect } from "react";
import { CrudSection } from "./CrudSection";
import { usePhotoUpload } from "@/lib/photoUpload";
import { Upload } from "lucide-react";

const DEFAULT_GUIDES = [{
  id: 1,
  name: "Bachirou Henry Sy",
  photo: "",
  bioFR: "Né sur l'île de Gorée, guide certifié depuis 5 ans, passionné par l'histoire et la culture sénégalaise.",
  bioEN: "Born on Gorée Island, certified guide for 5 years, passionate about Senegalese history and culture.",
  bioES: "Nacido en la isla de Gorée, guía certificado desde hace 5 años, apasionado por la historia y cultura senegalesa.",
  languages: ["FR", "EN", "Wolof"],
  certifications: ["Guide Officiel", "UNESCO Partner"],
  whatsapp: "+221774188107",
  instagram: "@sama__senegal",
  rating: 5,
  specialities: ["Histoire", "Culture", "City Tour"],
  active: true
}];

const LANGS = ["FR", "EN", "ES", "Wolof", "Arabic", "Portuguese", "Italian", "German"];
const SPECS = ["Histoire", "Culture", "City Tour", "Safari", "Nature", "Gastronomie", "Bien-être"];

export function GuidesAdmin() {
  const [guides, setGuides] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("guidesData");
    if (saved) {
      try { setGuides(JSON.parse(saved)); } catch { setGuides(DEFAULT_GUIDES); }
    } else {
      setGuides(DEFAULT_GUIDES);
    }
  }, []);

  const saveGuides = (newGuides: any[]) => {
    setGuides(newGuides);
    localStorage.setItem("guidesData", JSON.stringify(newGuides));
    window.dispatchEvent(new Event("guidesDataUpdated"));
  };

  const { fileRef, trigger, handleChange: handleFile } = usePhotoUpload((b64) => {
    // Hack: We need a way to pass this to the form... we can dispatch an event or just use state inside renderForm?
    // Let's just use the fileUpload inside renderForm directly.
  });

  const renderForm = (item: any, onChange: (f: string, v: any) => void) => {
    const { fileRef, trigger, handleChange } = usePhotoUpload((b64) => onChange("photo", b64));

    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Nom</label>
          <input type="text" value={item.name || ""} onChange={(e) => onChange("name", e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
        </div>
        
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Photo (URL ou Fichier)</label>
          <div className="flex items-center gap-4 mb-2">
            {item.photo ? (
              <img src={item.photo} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">?</div>
            )}
            <div className="flex-1 space-y-2">
              <input type="text" placeholder="URL de l'image" value={item.photo || ""} onChange={(e) => onChange("photo", e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
              <button onClick={trigger} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Upload className="w-3 h-3" /> Télécharger image
              </button>
              <input type="file" ref={fileRef} onChange={handleChange} className="hidden" accept="image/*" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Bio FR</label>
          <textarea value={item.bioFR || ""} onChange={(e) => onChange("bioFR", e.target.value)} className="w-full mt-1 border rounded-lg p-2 resize-none" rows={2} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Bio EN</label>
          <textarea value={item.bioEN || ""} onChange={(e) => onChange("bioEN", e.target.value)} className="w-full mt-1 border rounded-lg p-2 resize-none" rows={2} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Bio ES</label>
          <textarea value={item.bioES || ""} onChange={(e) => onChange("bioES", e.target.value)} className="w-full mt-1 border rounded-lg p-2 resize-none" rows={2} />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Langues</label>
          <div className="flex flex-wrap gap-2">
            {LANGS.map(l => (
              <label key={l} className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded">
                <input type="checkbox" checked={(item.languages || []).includes(l)} onChange={(e) => {
                  const arr = new Set(item.languages || []);
                  if (e.target.checked) arr.add(l); else arr.delete(l);
                  onChange("languages", Array.from(arr));
                }} /> {l}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Spécialités</label>
          <div className="flex flex-wrap gap-2">
            {SPECS.map(s => (
              <label key={s} className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded">
                <input type="checkbox" checked={(item.specialities || []).includes(s)} onChange={(e) => {
                  const arr = new Set(item.specialities || []);
                  if (e.target.checked) arr.add(s); else arr.delete(s);
                  onChange("specialities", Array.from(arr));
                }} /> {s}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Certifications (séparées par virgule)</label>
          <input type="text" value={(item.certifications || []).join(", ")} onChange={(e) => onChange("certifications", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} className="w-full mt-1 border rounded-lg p-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label>
            <input type="tel" value={item.whatsapp || ""} onChange={(e) => onChange("whatsapp", e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Instagram</label>
            <input type="text" value={item.instagram || ""} onChange={(e) => onChange("instagram", e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Note (1-5)</label>
            <input type="number" min="1" max="5" value={item.rating || 5} onChange={(e) => onChange("rating", parseInt(e.target.value))} className="w-full mt-1 border rounded-lg p-2" />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" checked={!!item.active} onChange={(e) => onChange("active", e.target.checked)} className="w-4 h-4" />
            <label className="font-bold text-gray-700">Guide Actif</label>
          </div>
        </div>
      </div>
    );
  };

  const renderCard = (item: any) => (
    <div className="flex gap-4 items-start">
      {item.photo ? (
        <img src={item.photo} className="w-12 h-12 rounded-full object-cover shrink-0" alt="" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 shrink-0">
          {item.name ? item.name.substring(0, 2).toUpperCase() : "?"}
        </div>
      )}
      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="font-bold text-gray-800">{item.name}</h3>
          <span className="text-yellow-500 text-xs">{"⭐".repeat(item.rating || 5)}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1 truncate">
          {(item.languages || []).join(", ")}
        </div>
        <div className="text-xs text-gray-400 mt-1 truncate">
          {item.whatsapp}
        </div>
        <div className="mt-2">
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {item.active ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <CrudSection
      sectionTitle="👥 Guides"
      items={guides}
      setItems={saveGuides}
      defaultItem={{ name: "", active: true, rating: 5, languages: ["FR"], specialities: [] }}
      renderForm={renderForm}
      renderCard={renderCard}
    />
  );
}
