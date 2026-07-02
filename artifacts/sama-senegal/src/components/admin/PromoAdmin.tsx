import { useState, useEffect } from "react";
import { Plus, Save, Trash2, RefreshCw, Tag, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:     { label: "Brouillon",  color: "bg-gray-100 text-gray-600" },
  pending:   { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  active:    { label: "Actif",      color: "bg-green-100 text-green-700" },
  suspended: { label: "Suspendu",   color: "bg-orange-100 text-orange-600" },
  expired:   { label: "Expiré",     color: "bg-red-100 text-red-600" },
};

const DISCOUNT_TYPES = [
  { value: "percentage",    label: "Pourcentage (%)" },
  { value: "fixed",         label: "Montant fixe (FCFA)" },
  { value: "free_service",  label: "Service gratuit" },
];

const SERVICE_TYPES = [
  { value: "all",         label: "Tous les services" },
  { value: "tours",       label: "🌴 Tours" },
  { value: "transport",   label: "🚗 Transport" },
  { value: "activities",  label: "🎯 Activités" },
  { value: "restaurants", label: "🍽️ Restaurants" },
  { value: "hotels",      label: "🏨 Hôtels" },
];

const TARGET_AUDIENCE = [
  { value: "all",   label: "Tous les clients" },
  { value: "new",   label: "Nouveaux clients" },
  { value: "loyal", label: "Clients fidèles" },
  { value: "vip",   label: "Clients VIP" },
];

const EMPTY_FORM = {
  code: "", campaign_name: "", description: "",
  discount_type: "percentage", discount_value: 10,
  service_type: "all", target_audience: "all",
  min_amount: 0, max_uses: 100, max_uses_per_client: 1,
  start_date: "", end_date: "", status: "draft",
};

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return "SAMA" + Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function PromoAdmin() {
  const { session } = useAuth();
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [source, setSource] = useState<"supabase" | "local">("local");

  const isSuperAdmin = session?.role === "superadmin";

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setPromos(data);
        setSource("supabase");
        setLoading(false);
        return;
      }
    } catch {}
    setSource("local");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.campaign_name) return;
    setSaving(true);

    const payload = {
      ...form,
      discount_value: Number(form.discount_value),
      min_amount: Number(form.min_amount),
      max_uses: Number(form.max_uses),
      max_uses_per_client: Number(form.max_uses_per_client),
      created_by: session?.identifier || "admin",
      created_by_role: session?.role || "superadmin",
      status: isSuperAdmin ? form.status : "pending",
      active: form.status === "active" && isSuperAdmin,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("promo_codes").insert([payload]);
      if (!error) {
        await load();
        setForm({ ...EMPTY_FORM });
        setShowForm(false);
        setSaved(true);
        window.dispatchEvent(new Event("promosUpdated"));
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {}
    setSaving(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await supabase.from("promo_codes").update({
        status,
        active: status === "active",
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      setPromos(prev => prev.map(p => p.id === id ? { ...p, status, active: status === "active" } : p));
      window.dispatchEvent(new Event("promosUpdated"));
    } catch {}
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Supprimer cette offre ?")) return;
    try {
      await supabase.from("promo_codes").delete().eq("id", id);
      setPromos(prev => prev.filter(p => p.id !== id));
      window.dispatchEvent(new Event("promosUpdated"));
    } catch {}
  };

  const filtered = filter === "all" ? promos : promos.filter(p => p.status === filter);

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Offres & Codes Promo</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {promos.filter(p => p.status === "active").length} actif(s) · {promos.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            source === "supabase" ? "bg-green-50 text-green-600 border border-green-200" : "bg-yellow-50 text-yellow-600 border border-yellow-200"
          }`}>
            {source === "supabase" ? "✅ Supabase" : "⚠️ Local"}
          </div>
          <button onClick={load} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => { setShowForm(!showForm); setForm({ ...EMPTY_FORM }); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#6C3EF5] text-white rounded-xl text-sm font-bold hover:bg-[#8B5CF6]">
            <Plus className="w-4 h-4" /> Nouvelle offre
          </button>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
          <h3 className="font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#6C3EF5]" /> Créer une offre
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nom de la campagne *</label>
              <input value={form.campaign_name} onChange={e => setForm({ ...form, campaign_name: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" placeholder="Ex: Promo été 2026" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Code *</label>
              <div className="flex gap-2 mt-1">
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono uppercase" placeholder="SAMA10" />
                <button onClick={() => setForm({ ...form, code: generateCode() })}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600">
                  Auto
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Type de réduction</label>
              <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
                {DISCOUNT_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Valeur {form.discount_type === "percentage" ? "(%)" : form.discount_type === "fixed" ? "(FCFA)" : ""}
              </label>
              <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: Number(e.target.value) })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                disabled={form.discount_type === "free_service"} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Service concerné</label>
              <select value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
                {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Date début</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Date fin</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Montant min (FCFA)</label>
              <input type="number" value={form.min_amount} onChange={e => setForm({ ...form, min_amount: Number(e.target.value) })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Utilisations max</label>
              <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: Number(e.target.value) })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Max par client</label>
              <input type="number" value={form.max_uses_per_client} onChange={e => setForm({ ...form, max_uses_per_client: Number(e.target.value) })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Public cible</label>
              <select value={form.target_audience} onChange={e => setForm({ ...form, target_audience: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
                {TARGET_AUDIENCE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {isSuperAdmin && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Statut initial</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
                  {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${saved ? "bg-green-500" : "bg-[#6C3EF5] hover:bg-[#8B5CF6]"} disabled:opacity-50`}>
              <Save className="w-4 h-4" /> {saved ? "Enregistré ✓" : saving ? "..." : "Enregistrer"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...Object.keys(STATUS_CONFIG)].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === f ? "bg-[#0B0A14] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {f === "all" ? `Tous (${promos.length})` : `${STATUS_CONFIG[f]?.label} (${promos.filter(p => p.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Aucune offre pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono font-bold text-[#0B0A14] text-sm bg-gray-100 px-2 py-0.5 rounded">{p.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${STATUS_CONFIG[p.status]?.color || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_CONFIG[p.status]?.label || p.status}
                    </span>
                    <span className="text-xs text-[#6C3EF5] font-bold">
                      {p.discount_type === "percentage" ? `${p.discount_value}%` :
                       p.discount_type === "fixed" ? `${p.discount_value?.toLocaleString()} FCFA` : "Service gratuit"}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-800 text-sm">{p.campaign_name}</div>
                  {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                  <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                    {p.service_type && <span>🎯 {SERVICE_TYPES.find(s => s.value === p.service_type)?.label || p.service_type}</span>}
                    {p.start_date && <span>📅 {p.start_date} → {p.end_date || "∞"}</span>}
                    <span>👥 {p.used_count || 0}/{p.max_uses} utilisations</span>
                    {p.created_by && <span>✍️ {p.created_by}</span>}
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    {p.status === "pending" && (
                      <button onClick={() => updateStatus(p.id, "active")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold">
                        <CheckCircle className="w-3 h-3" /> Activer
                      </button>
                    )}
                    {p.status === "active" && (
                      <button onClick={() => updateStatus(p.id, "suspended")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-bold">
                        <XCircle className="w-3 h-3" /> Suspendre
                      </button>
                    )}
                    {p.status === "suspended" && (
                      <button onClick={() => updateStatus(p.id, "active")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold">
                        <CheckCircle className="w-3 h-3" /> Réactiver
                      </button>
                    )}
                    <button onClick={() => deletePromo(p.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
