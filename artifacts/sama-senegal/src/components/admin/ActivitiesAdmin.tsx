import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import { CrudSection } from "./CrudSection";
import { usePhotoUpload } from "@/lib/photoUpload";
import { Upload } from "lucide-react";

const DEFAULT_DATA = [
  {
    id: 1,
    nameFR: "Balade en Pirogue",
    nameEN: "Pirogue Ride",
    nameES: "Paseo en Piragua",
    photo: "",
    category: "Sport nautique",
    descFR: "Exploration des côtes en pirogue traditionnelle",
    descEN: "Coastal exploration by traditional pirogue",
    descES: "Exploración costera en piragua tradicional",
    duration: "2h",
    price: 8000,
    minParticipants: 2,
    location: "Île de Gorée",
    active: true,
  },
  {
    id: 2,
    nameFR: "Cours de Cuisine Sénégalaise",
    nameEN: "Senegalese Cooking Class",
    nameES: "Clase de Cocina Senegalesa",
    photo: "",
    category: "Culturel",
    descFR: "Apprenez à cuisiner le thiéboudienne",
    descEN: "Learn to cook thiéboudienne",
    descES: "Aprende a cocinar thiéboudienne",
    duration: "3h",
    price: 12000,
    minParticipants: 1,
    location: "Gorée",
    active: true,
  },
];

const CATEGORIES = [
  "Sport nautique",
  "Culturel",
  "Bien-être",
  "Musique",
  "Art",
  "Aventure",
  "Enfants",
];

// ✅ Composant séparé pour le formulaire — les hooks peuvent y être appelés légalement
function ActivityForm({
  item,
  onChange,
}: {
  item: any;
  onChange: (f: string, v: any) => void;
}) {
  const { fileRef, trigger, handleChange } = usePhotoUpload((b64) =>
    onChange("photo", b64),
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">
          Nom FR
        </label>
        <input
          type="text"
          value={item.nameFR || ""}
          onChange={(e) => onChange("nameFR", e.target.value)}
          className="w-full mt-1 border rounded-lg p-2"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">
          Nom EN
        </label>
        <input
          type="text"
          value={item.nameEN || ""}
          onChange={(e) => onChange("nameEN", e.target.value)}
          className="w-full mt-1 border rounded-lg p-2"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">
          Nom ES
        </label>
        <input
          type="text"
          value={item.nameES || ""}
          onChange={(e) => onChange("nameES", e.target.value)}
          className="w-full mt-1 border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
          Catégorie
        </label>
        <select
          value={item.category || ""}
          onChange={(e) => onChange("category", e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          <option value="">Sélectionner...</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
          Photo
        </label>
        <div className="flex items-center gap-4 mb-2">
          {item.photo ? (
            <img
              src={item.photo}
              alt=""
              className="w-16 h-16 object-cover border rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
              Aucune
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input
              type="text"
              placeholder="URL"
              value={item.photo || ""}
              onChange={(e) => onChange("photo", e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
            <button
              onClick={trigger}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2"
            >
              <Upload className="w-3 h-3" /> Télécharger
            </button>
            <input
              type="file"
              ref={fileRef}
              onChange={handleChange}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">
          Description FR
        </label>
        <textarea
          value={item.descFR || ""}
          onChange={(e) => onChange("descFR", e.target.value)}
          className="w-full mt-1 border rounded-lg p-2 resize-none"
          rows={2}
        />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">
          Description EN
        </label>
        <textarea
          value={item.descEN || ""}
          onChange={(e) => onChange("descEN", e.target.value)}
          className="w-full mt-1 border rounded-lg p-2 resize-none"
          rows={2}
        />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">
          Description ES
        </label>
        <textarea
          value={item.descES || ""}
          onChange={(e) => onChange("descES", e.target.value)}
          className="w-full mt-1 border rounded-lg p-2 resize-none"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">
            Durée
          </label>
          <input
            type="text"
            placeholder="ex: 2h"
            value={item.duration || ""}
            onChange={(e) => onChange("duration", e.target.value)}
            className="w-full mt-1 border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">
            Prix (FCFA)
          </label>
          <input
            type="number"
            value={item.price || 0}
            onChange={(e) => onChange("price", parseInt(e.target.value))}
            className="w-full mt-1 border rounded-lg p-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">
            Lieu
          </label>
          <input
            type="text"
            value={item.location || ""}
            onChange={(e) => onChange("location", e.target.value)}
            className="w-full mt-1 border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">
            Participants min.
          </label>
          <input
            type="number"
            min="1"
            value={item.minParticipants || 1}
            onChange={(e) =>
              onChange("minParticipants", parseInt(e.target.value))
            }
            className="w-full mt-1 border rounded-lg p-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          checked={!!item.active}
          onChange={(e) => onChange("active", e.target.checked)}
          className="w-4 h-4"
        />
        <label className="font-bold text-gray-700">Actif</label>
      </div>
    </div>
  );
}

export function ActivitiesAdmin() {
  const { session } = useAuth();
  const isSuperAdmin = session?.role === "superadmin" || session?.role === "dg";
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from("activities").select("*").order("id");
        if (!error && data && data.length > 0) {
          setItems(data);
          localStorage.setItem("activitiesData", JSON.stringify(data));
          return;
        }
      } catch {}
      try {
        const saved = localStorage.getItem("activitiesData");
        setItems(saved ? JSON.parse(saved) : DEFAULT_DATA);
      } catch { setItems(DEFAULT_DATA); }
    };
    load();
  }, []);
  const saveItems = async (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem("activitiesData", JSON.stringify(newItems));
    window.dispatchEvent(new Event("activitiesDataUpdated"));
    for (const item of newItems) {
      try {
        const { id, ...fields } = item;
        if (typeof id === "number") {
          await supabase.from("activities").upsert({ ...fields }, { onConflict: "name_fr" });
        } else {
          await supabase.from("activities").update(fields).eq("id", id);
        }
      } catch {}
    }
  };

  // ✅ renderForm retourne maintenant un composant React, pas un appel de hook
  const renderForm = (item: any, onChange: (f: string, v: any) => void) => (
    <ActivityForm item={item} onChange={onChange} />
  );

  const renderCard = (item: any) => (
    <div className="flex gap-3">
      {item.photo ? (
        <img
          src={item.photo}
          className="w-16 h-16 rounded object-cover shrink-0"
          alt=""
        />
      ) : (
        <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xl shrink-0">
          🎯
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 truncate">{item.nameFR}</h3>
        <div className="text-xs text-gray-500 mt-1">
          {item.category} • {item.duration}
        </div>
        <div className="text-sm font-bold text-[#D4A017] mt-1">
          {item.price} FCFA
        </div>
        <div className="mt-2">
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            {item.active ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <CrudSection
      sectionTitle="🎯 Activités"
      items={items}
      setItems={saveItems}
      defaultItem={{
        nameFR: "",
        category: "Culturel",
        active: true,
        price: 0,
        minParticipants: 1,
        duration: "",
      }}
      canManage={(item: any) => isSuperAdmin || item.created_by === session?.identifier}
      stampNew={(item: any) => ({ ...item, created_by: session?.identifier || null, created_by_role: session?.role || null })}
    />
  );
}
