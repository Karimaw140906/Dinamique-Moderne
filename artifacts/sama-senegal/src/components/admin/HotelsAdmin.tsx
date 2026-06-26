import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { usePhotoUpload } from "@/lib/photoUpload";
import { Upload, Plus, Edit2, Trash2, Save } from "lucide-react";

const TYPES = ["Hôtel","Appartement","Villa","Auberge","Resort","Maison d'hôtes"];
const AMENITIES = ["WiFi","Piscine","Clim","Parking","Restaurant","Bar","Spa","Salle de sport","Vue mer"];
const EMPTY = { name:"", type:"Hôtel", desc_fr:"", desc_en:"", desc_es:"", address:"", rating:5, rooms:1, price_night:0, amenities:[], whatsapp:"", booking_link:"", active:true, photo:"" };

export function HotelsAdmin() {
  const { session } = useAuth();
  const isSuperAdmin = session?.role === "superadmin";
  const identifier = session?.identifier || "";
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = async () => {
    setLoading(true);
    let query = supabase.from("hotels").select("*").order("id");
    if (!isSuperAdmin) query = query.eq("whatsapp", identifier);
    const { data } = await query;
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (editing.id) {
      await supabase.from("hotels").update(editing).eq("id", editing.id);
    } else {
      await supabase.from("hotels").insert({ ...editing, whatsapp: editing.whatsapp || identifier });
    }
    setEditing(null);
    setIsNew(false);
    await load();
  };

  const remove = async (id: number) => {
    if (!confirm("Supprimer cet hébergement ?")) return;
    await supabase.from("hotels").delete().eq("id", id);
    await load();
  };

  const toggle = async (item: any) => {
    await supabase.from("hotels").update({ active: !item.active }).eq("id", item.id);
    await load();
  };

  function EditForm({ item, onChange }: { item: any; onChange: (f: string, v: any) => void }) {
    const { fileRef, trigger, handleChange } = usePhotoUpload((b64) => onChange("photo", b64));
    const amenities = item.amenities || [];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <div><label className="text-xs text-gray-500">Nom *</label><input value={item.name||""} onChange={e=>onChange("name",e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
        <div><label className="text-xs text-gray-500">Type</label>
          <select value={item.type||"Hôtel"} onChange={e=>onChange("type",e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
            {TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="md:col-span-2"><label className="text-xs text-gray-500">Description FR</label><textarea value={item.desc_fr||""} onChange={e=>onChange("desc_fr",e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
        <div className="md:col-span-2"><label className="text-xs text-gray-500">Description EN</label><textarea value={item.desc_en||""} onChange={e=>onChange("desc_en",e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
        <div><label className="text-xs text-gray-500">Adresse</label><input value={item.address||""} onChange={e=>onChange("address",e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
        <div><label className="text-xs text-gray-500">WhatsApp</label><input value={item.whatsapp||""} onChange={e=>onChange("whatsapp",e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
        <div><label className="text-xs text-gray-500">Chambres</label><input type="number" min={1} value={item.rooms||1} onChange={e=>onChange("rooms",parseInt(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
        <div><label className="text-xs text-gray-500">Prix/nuit (FCFA)</label><input type="number" min={0} value={item.price_night||0} onChange={e=>onChange("price_night",parseInt(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
        <div><label className="text-xs text-gray-500">Note (1-5)</label><input type="number" min={1} max={5} value={item.rating||5} onChange={e=>onChange("rating",parseInt(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
        <div><label className="text-xs text-gray-500">Lien réservation</label><input value={item.booking_link||""} onChange={e=>onChange("booking_link",e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Équipements</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {AMENITIES.map(a => (
              <button key={a} type="button" onClick={() => {
                const next = amenities.includes(a) ? amenities.filter((x:string)=>x!==a) : [...amenities, a];
                onChange("amenities", next);
              }} className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${amenities.includes(a) ? "bg-[#2C7A5C] text-white border-[#2C7A5C]" : "bg-white text-gray-600 border-gray-200"}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={item.active} onChange={e=>onChange("active",e.target.checked)} id="active-h"/>
          <label htmlFor="active-h" className="text-sm">Actif</label>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Photo</label>
          <div className="flex items-center gap-3 mt-1">
            {item.photo && <img src={item.photo} className="w-16 h-16 rounded-lg object-cover"/>}
            <button type="button" onClick={trigger} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
              <Upload className="w-4 h-4"/> Choisir photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleChange} className="hidden"/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Hébergements ({items.length})</h2>
        <button onClick={() => { setEditing({...EMPTY}); setIsNew(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#2C7A5C] text-white rounded-xl text-sm font-bold hover:bg-[#1A1A2E] transition-colors">
          <Plus className="w-4 h-4"/> Ajouter
        </button>
      </div>

      {isNew && editing && (
        <div className="bg-white rounded-xl shadow-sm border border-[#2C7A5C]/30 p-5">
          <h3 className="font-bold text-[#1A1A2E] mb-2">Nouvel hébergement</h3>
          <EditForm item={editing} onChange={(f,v) => setEditing((p:any)=>({...p,[f]:v}))} />
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="flex items-center gap-1 px-4 py-2 bg-[#2C7A5C] text-white rounded-xl text-sm font-bold"><Save className="w-4 h-4"/> Enregistrer</button>
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-8 text-gray-400">Chargement...</div> : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              {editing?.id === item.id ? (
                <>
                  <EditForm item={editing} onChange={(f,v) => setEditing((p:any)=>({...p,[f]:v}))} />
                  <div className="flex gap-2 mt-4">
                    <button onClick={save} className="flex items-center gap-1 px-4 py-2 bg-[#2C7A5C] text-white rounded-xl text-sm font-bold"><Save className="w-4 h-4"/> Enregistrer</button>
                    <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-xl text-sm">Annuler</button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.photo && <img src={item.photo} className="w-12 h-12 rounded-lg object-cover"/>}
                    <div>
                      <div className="font-bold text-[#1A1A2E]">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.type} · {item.rooms} chambres · {item.price_night?.toLocaleString()} FCFA/nuit</div>
                      <div className="text-xs text-gray-400">{item.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggle(item)}
                      className={`text-xs px-2 py-1 rounded-full font-bold ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.active ? "Actif" : "Inactif"}
                    </button>
                    <button onClick={() => setEditing({...item})} className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 className="w-4 h-4 text-gray-500"/></button>
                    {isSuperAdmin && <button onClick={() => remove(item.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400"/></button>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
