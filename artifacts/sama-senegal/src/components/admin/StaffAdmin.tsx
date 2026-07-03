import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Shield, Power, ChevronDown, ChevronUp, Eye, EyeOff, RefreshCw, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activityLogger";
import { PERMISSION_CATALOG, ROLE_DEFS, DEFAULT_PERMISSIONS_BY_ROLE, StaffRole } from "@/lib/permissions";

interface StaffAdminProps {
  mode?: "full" | "ops";
}

const EMPTY_FORM = {
  name: "", role: "agent" as StaffRole,
  identifier: "", password: "", whatsapp: "", email: "",
  permissions: [] as string[], active: true,
  delegation_permission: "", delegation_expires: "",
};

function loadLocalStaff(): any[] {
  try { return JSON.parse(localStorage.getItem("staffAccounts") || "[]"); } catch { return []; }
}

export function StaffAdmin({ mode = "full" }: StaffAdminProps) {
  const { session } = useAuth();
  const isFull = mode === "full";

  const [staff, setStaff] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showPass, setShowPass] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const [delegatingId, setDelegatingId] = useState<string | null>(null);

  const actor = () => ({
    user_identifier: session?.identifier || "unknown",
    user_role: session?.role || "unknown",
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("staff_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        const filtered = data.filter((s: any) => s.role !== "superadmin" && s.role !== "dg");
        setStaff(filtered);
        localStorage.setItem("staffAccounts", JSON.stringify(filtered));
        setSource("supabase");
        setLoading(false);
        return;
      }
    } catch {}
    setStaff(loadLocalStaff().filter((s: any) => s.role !== "superadmin" && s.role !== "dg"));
    setSource("local");
    setLoading(false);
  };

  useEffect(() => {
    load();
    window.addEventListener("staffAccountsUpdated", load);
    return () => window.removeEventListener("staffAccountsUpdated", load);
  }, []);

  const handleRoleChange = (role: StaffRole) => {
    setForm({ ...form, role, permissions: DEFAULT_PERMISSIONS_BY_ROLE[role] || [] });
  };

  const togglePermission = (key: string) => {
    const current = form.permissions;
    setForm({ ...form, permissions: current.includes(key) ? current.filter(k => k !== key) : [...current, key] });
  };

  const handleSave = async () => {
    if (!isFull) return;
    if (!form.name || !form.identifier || !form.password) return;

    if (editId) {
      try {
        await supabase.from("staff_accounts").update({
          name: form.name, role: form.role, identifier: form.identifier,
          password: form.password, whatsapp: form.whatsapp, email: form.email,
          permissions: form.permissions, active: form.active,
        }).eq("id", editId);
      } catch {}
      const all = loadLocalStaff();
      localStorage.setItem("staffAccounts", JSON.stringify(
        all.map(s => s.id === editId ? { ...s, ...form } : s)
      ));
      logActivity({ ...actor(), action: "update", target: form.name, details: { type: "staff_account", role: form.role, identifier: form.identifier } });
    } else {
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke("create-staff-account", {
          body: {
            name: form.name, role: form.role, identifier: form.identifier,
            password: form.password, whatsapp: form.whatsapp, email: form.email,
            permissions: form.permissions,
          },
        });
        if (fnError) throw fnError;
        if (fnData?.error) throw new Error(fnData.error);
        if (fnData?.data) {
          const all = loadLocalStaff();
          localStorage.setItem("staffAccounts", JSON.stringify([fnData.data, ...all]));
        }
        logActivity({ ...actor(), action: "create", target: form.name, details: { type: "staff_account", role: form.role, identifier: form.identifier } });
      } catch (err) {
        console.error("Erreur création compte staff:", err);
        alert("Échec de la création du compte : " + (err instanceof Error ? err.message : String(err)));
        return;
      }
    }

    setSaved(true);
    await load();
    setTimeout(() => { setSaved(false); setShowForm(false); setEditId(null); setForm({ ...EMPTY_FORM }); }, 1000);
    window.dispatchEvent(new Event("staffAccountsUpdated"));
  };

  const handleEdit = (s: any) => {
    if (!isFull) return;
    setForm({ ...EMPTY_FORM, name: s.name, role: s.role, identifier: s.identifier, password: s.password, whatsapp: s.whatsapp || "", email: s.email || "", permissions: s.permissions || [], active: s.active });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!isFull) return;
    const target = staff.find(s => s.id === id);
    if (!confirm("Supprimer ce compte ?")) return;
    try { await supabase.from("staff_accounts").delete().eq("id", id); } catch {}
    localStorage.setItem("staffAccounts", JSON.stringify(loadLocalStaff().filter(s => s.id !== id)));
    logActivity({ ...actor(), action: "delete", target: target?.name || id, details: { type: "staff_account" } });
    await load();
  };

  const handleToggle = async (id: string, current: boolean) => {
    const target = staff.find(s => s.id === id);
    try { await supabase.from("staff_accounts").update({ active: !current }).eq("id", id); } catch {}
    localStorage.setItem("staffAccounts", JSON.stringify(
      loadLocalStaff().map(s => s.id === id ? { ...s, active: !current } : s)
    ));
    logActivity({ ...actor(), action: !current ? "activate" : "deactivate", target: target?.name || id, details: { type: "staff_account" } });
    await load();
  };

  const applyDelegation = async (s: any) => {
    if (!isFull || !form.delegation_permission || !form.delegation_expires) return;
    const updatedPerms = Array.from(new Set([...(s.permissions || []), form.delegation_permission]));
    const delegations = { ...(s.delegations || {}), [form.delegation_permission]: form.delegation_expires };
    try {
      await supabase.from("staff_accounts").update({ permissions: updatedPerms, delegations }).eq("id", s.id);
    } catch {}
    localStorage.setItem("staffAccounts", JSON.stringify(
      loadLocalStaff().map(x => x.id === s.id ? { ...x, permissions: updatedPerms, delegations } : x)
    ));
    logActivity({ ...actor(), action: "delegate", target: s.name, details: { permission: form.delegation_permission, expires: form.delegation_expires } });
    setDelegatingId(null);
    setForm({ ...form, delegation_permission: "", delegation_expires: "" });
    await load();
  };

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 10);
    staff.forEach(async (s: any) => {
      if (!s.delegations) return;
      const expired = Object.entries(s.delegations).filter(([, exp]: any) => exp < now);
      if (expired.length === 0) return;
      const remainingPerms = (s.permissions || []).filter((p: string) => !expired.some(([k]) => k === p));
      const remainingDeleg = { ...s.delegations };
      expired.forEach(([k]) => delete remainingDeleg[k]);
      try { await supabase.from("staff_accounts").update({ permissions: remainingPerms, delegations: remainingDeleg }).eq("id", s.id); } catch {}
    });
  }, [staff]);

  const cancel = () => { setShowForm(false); setEditId(null); setForm({ ...EMPTY_FORM }); };

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {isFull ? "Gestion des Accès Staff" : "Équipe — Suivi quotidien"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {staff.length} compte(s){!isFull && " · Création et modification réservées au DG"}
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
          {isFull && !showForm && (
            <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY_FORM }); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#6C3EF5] text-white rounded-xl text-sm font-bold hover:bg-[#8B5CF6] transition-colors">
              <Plus className="w-4 h-4" /> Nouveau compte
            </button>
          )}
        </div>
      </div>

      {isFull && showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h3 className="font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6C3EF5]" />
            {editId ? "Modifier le compte" : "Nouveau compte staff"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nom complet *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" placeholder="Prénom Nom" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Rôle *</label>
              <select value={form.role} onChange={e => handleRoleChange(e.target.value as StaffRole)}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30 bg-white">
                {ROLE_DEFS.map(r => <option key={r.value} value={r.value}>{r.icon} {r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Identifiant *</label>
              <input type="text" value={form.identifier} onChange={e => setForm({ ...form, identifier: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" placeholder="ex: resp.hotels1" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Mot de passe *</label>
              <div className="relative mt-1">
                <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" placeholder="+221..." />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Permissions (périmètre réel du compte)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 rounded-xl p-4">
              {PERMISSION_CATALOG.map(p => (
                <label key={p.key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePermission(p.key)} className="w-4 h-4 accent-[#6C3EF5] rounded" />
                  {p.label}
                  <span className="text-[10px] text-gray-400">({p.module})</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-[#6C3EF5] rounded" />
            Compte actif
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${saved ? "bg-green-500" : "bg-[#6C3EF5] hover:bg-[#8B5CF6]"}`}>
              <Save className="w-4 h-4" /> {saved ? "Enregistré ✓" : "Enregistrer"}
            </button>
            <button onClick={cancel} className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Annuler</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
          <p className="text-sm">Chargement...</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center text-gray-400">
          <Shield className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Aucun compte staff créé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map(s => {
            const role = ROLE_DEFS.find(r => r.value === s.role);
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id} className={`bg-white rounded-xl shadow-sm border transition-all ${!s.active ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-full bg-[#0B0A14]/10 flex items-center justify-center text-xl shrink-0">{role?.icon || "👤"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800">{s.name}</div>
                    <div className="text-xs text-gray-500">{role?.label || s.role} · @{s.identifier}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {s.active ? "Actif" : "Suspendu"}
                    </span>
                    <button onClick={() => handleToggle(s.id, s.active)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title={s.active ? "Suspendre" : "Réactiver"}>
                      <Power className="w-4 h-4" />
                    </button>
                    {isFull && (
                      <>
                        <button onClick={() => setDelegatingId(delegatingId === s.id ? null : s.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500" title="Déléguer une permission">
                          <Clock className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 text-xs font-bold">Édit</button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                    <button onClick={() => setExpandedId(isExpanded ? null : s.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isFull && delegatingId === s.id && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-amber-50/50 flex flex-wrap gap-2 items-end">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Permission à déléguer</label>
                      <select value={form.delegation_permission} onChange={e => setForm({ ...form, delegation_permission: e.target.value })}
                        className="block mt-1 border rounded-lg px-2 py-1.5 text-xs bg-white">
                        <option value="">— choisir —</option>
                        {PERMISSION_CATALOG.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Expire le</label>
                      <input type="date" value={form.delegation_expires} onChange={e => setForm({ ...form, delegation_expires: e.target.value })}
                        className="block mt-1 border rounded-lg px-2 py-1.5 text-xs" />
                    </div>
                    <button onClick={() => applyDelegation(s)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600">
                      Déléguer
                    </button>
                  </div>
                )}

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-2">Permissions</div>
                    <div className="flex flex-wrap gap-2">
                      {(s.permissions || []).length === 0 ? (
                        <span className="text-xs text-gray-400">Aucune permission</span>
                      ) : (s.permissions || []).map((p: string) => {
                        const perm = PERMISSION_CATALOG.find(ap => ap.key === p);
                        const isDelegated = s.delegations && s.delegations[p];
                        return perm ? (
                          <span key={p} className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDelegated ? "bg-amber-100 text-amber-700" : "bg-[#6C3EF5]/10 text-[#6C3EF5]"}`}>
                            {isDelegated ? "⏳" : "✅"} {perm.label}{isDelegated ? ` (jusqu'au ${s.delegations[p]})` : ""}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
