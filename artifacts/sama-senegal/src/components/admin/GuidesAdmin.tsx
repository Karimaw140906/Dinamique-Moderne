import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import { CrudSection } from "./CrudSection";
import { Upload, Shield, Eye, EyeOff } from "lucide-react";
import { StaffAccount, useAuth } from "@/lib/auth";

const DEFAULT_GUIDES = [{
  id: 1,
  name: "Bachirou Henry Sy",
  photo: "",
  bioFR: "Né sur l'île de Gorée, guide certifié depuis 5 ans, passionné par l'histoire et la culture sénégalaise.",
  bioEN: "Born on Gorée Island, certified guide for 5 years, passionate about Senegalese history and culture.",
  bioES: "Nacido en la isla de Gorée, guía certificado desde hace 5 años, apasionado por la historia y cultura senegalesa.",
  languages: ["FR", "EN", "Wolof"],
  certifications: ["Guide Officiel", "UNESCO Partner"],
  whatsapp: "",
  instagram: "@sama__senegal",
  rating: 5,
  specialities: ["Histoire", "Culture", "City Tour"],
  active: true,
  adminAccess: false,
  adminIdentifier: "",
  adminPassword: "",
}];

const LANGS = ["FR", "EN", "ES", "Wolof", "Arabic", "Portuguese", "Italian", "German"];
const SPECS = ["Histoire", "Culture", "City Tour", "Safari", "Nature", "Gastronomie", "Bien-être"];

function syncGuideStaffAccount(guide: any, enabled: boolean) {
  try {
    const staff: StaffAccount[] = JSON.parse(localStorage.getItem("staffAccounts") || "[]");
    const existingIdx = staff.findIndex(s => s.id === `guide_${guide.id}`);
    if (enabled && guide.adminIdentifier && guide.adminPassword) {
      const account: StaffAccount = {
        id: `guide_${guide.id}`,
        name: guide.name,
        role: "guide",
        identifier: guide.adminIdentifier,
        password: guide.adminPassword,
        permissions: ["voir_reservations", "voir_clients"],
        active: true,
        createdAt: existingIdx >= 0 ? staff[existingIdx].createdAt : new Date().toISOString(),
      };
      if (existingIdx >= 0) staff[existingIdx] = account;
      else staff.push(account);
    } else {
      if (existingIdx >= 0) staff.splice(existingIdx, 1);
    }
    localStorage.setItem("staffAccounts", JSON.stringify(staff));
  } catch {}
}

function AdminAccessBlock({ item, onChange }: { item: any; onChange: (f: string, v: any) => void }) {
  const [showPass, setShowPass] = useState(false);
  return (
    <div className="mt-4 p-4 bg-[#1A1A2E]/5 rounded-xl border border-[#1A1A2E]/10 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-4 h-4 text-[#2C7A5C]" />
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Accès Tableau de Bord</span>
      </div>
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
        const newVal = !item.adminAccess;
        onChange("adminAccess", newVal);
        syncGuideStaffAccount({ ...item, adminAccess: newVal }, newVal);
      }}>
        <div className={`relative w-12 h-6 rounded-full transition-colors ${item.adminAccess ? "bg-[#2C7A5C]" : "bg-gray-300"}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.adminAccess ? "translate-x-7" : "translate-x-1"}`} />
        </div>
        <span className="text-sm font-semibold text-gray-700">{item.adminAccess ? "Accès activé" : "Accès désactivé"}</span>
      </div>

      {item.adminAccess && (
        <div className="space-y-2 pt-1">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Identifiant de connexion *</label>
            <input type="text" value={item.adminIdentifier || ""}
              onChange={(e) => onChange("adminIdentifier", e.target.value)}
              onBlur={() => syncGuideStaffAccount(item, item.adminAccess)}
              placeholder="ex: guide_bachirou"
              className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Mot de passe temporaire *</label>
            <div className="relative mt-1">
              <input type={showPass ? "text" : "password"} value={item.adminPassword || ""}
                onChange={(e) => onChange("adminPassword", e.target.value)}
                onBlur={() => syncGuideStaffAccount(item, item.adminAccess)}
                placeholder="Mot de passe"
                className="w-full border border-gray-200 rounded-lg p-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-[#2C7A5C]">💡 Enregistrez le guide pour activer le compte.</p>
        </div>
      )}
    </div>
  );
}

function GuideForm({ item, onChange }: { item: any; onChange: (f: string, v: any) => void }) {
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
            <input type="text" placeholder="URL de l'image"
              value={item.photo?.startsWith("data:") ? "" : (item.photo || "")}
              onChange={(e) => onChange("photo", e.target.value)}
              className="w-full border rounded-lg p-2 text-sm" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Upload className="w-3 h-3" /> Télécharger image
            </button>
            <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*" />
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
            <label key={l} className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded cursor-pointer">
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
            <label key={s} className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded cursor-pointer">
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
        <input type="text"
          value={(item.certifications || []).join(", ")}
          onChange={(e) => onChange("certifications", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
          className="w-full mt-1 border rounded-lg p-2" />
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
          <input type="number" min="1" max="5" value={item.rating || 5}
            onChange={(e) => onChange("rating", parseInt(e.target.value))}
            className="w-full mt-1 border rounded-lg p-2" />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={!!item.active} onChange={(e) => onChange("active", e.target.checked)} className="w-4 h-4 accent-[#2C7A5C]" />
          <label className="font-bold text-gray-700 cursor-pointer">Guide Actif</label>
        </div>
      </div>

      <AdminAccessBlock item={item} onChange={onChange} />
    </div>
  );
}
export function GuidesAdmin() {
  const { session } = useAuth();
  const isSuperAdmin = session?.role === "superadmin" || session?.role === "dg";
  const [guides, setGuides] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from("guides").select("*").order("id");
        if (!error && data && data.length > 0) {
          setGuides(data);
          localStorage.setItem("guidesData", JSON.stringify(data));
          return;
        }
      } catch {}
      try {
        const saved = localStorage.getItem("guidesData");
        setGuides(saved ? JSON.parse(saved) : DEFAULT_GUIDES);
      } catch { setGuides(DEFAULT_GUIDES); }
    };
    load();
  }, []);
  const saveGuides = async (newGuides: any[]) => {
    setGuides(newGuides);
    localStorage.setItem("guidesData", JSON.stringify(newGuides));
    window.dispatchEvent(new Event("guidesDataUpdated"));
    for (const item of newGuides) {
      try {
        const { id, ...fields } = item;
        if (typeof id === "number") {
          await supabase.from("guides").upsert({ ...fields }, { onConflict: "name" });
        } else {
          await supabase.from("guides").update(fields).eq("id", id);
        }
      } catch {}
    }
  };

  const renderForm = (item: any, onChange: (f: string, v: any) => void) => (
    <GuideForm item={item} onChange={onChange} />
  );

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
        <div className="text-xs text-gray-500 mt-1 truncate">{(item.languages || []).join(", ")}</div>
        <div className="text-xs text-gray-400 mt-1 truncate">{item.whatsapp}</div>
        <div className="mt-2 flex gap-2 flex-wrap">
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {item.active ? "Actif" : "Inactif"}
          </span>
          {item.adminAccess && (
            <span className="px-2 py-1 text-xs font-bold rounded-full bg-[#2C7A5C]/10 text-[#2C7A5C] flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <CrudSection
      sectionTitle="👥 Guides"
      items={guides}
      setItems={saveGuides}
      defaultItem={{
        name: "", active: true, rating: 5, languages: ["FR"], specialities: [],
        photo: "", bioFR: "", bioEN: "", bioES: "", certifications: [],
        whatsapp: "", instagram: "",
        adminAccess: false, adminIdentifier: "", adminPassword: "",
      }}
      canManage={(item: any) => isSuperAdmin || item.created_by === session?.identifier}
      stampNew={(item: any) => ({ ...item, created_by: session?.identifier || null, created_by_role: session?.role || null })}
    />
  );
}
