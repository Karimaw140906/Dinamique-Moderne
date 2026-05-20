import { useState } from "react";
import { Plus, Trash2, Save, Shield, Power, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { StaffAccount, UserRole } from "@/lib/auth";

const ROLES: { value: Exclude<UserRole, "superadmin" | "client">; label: string; icon: string }[] = [
  { value: "guide", label: "Guide", icon: "🌴" },
  { value: "chauffeur", label: "Chauffeur", icon: "🚗" },
  { value: "restaurant", label: "Responsable Restaurant", icon: "🍽️" },
  { value: "hotel", label: "Responsable Hôtel", icon: "🏨" },
  { value: "commercial", label: "Commercial", icon: "🎯" },
];

const ALL_PERMISSIONS = [
  { key: "voir_reservations", label: "Voir réservations" },
  { key: "modifier_reservations", label: "Modifier réservations" },
  { key: "gerer_transport", label: "Gérer transport" },
  { key: "gerer_restaurants", label: "Gérer restaurants" },
  { key: "gerer_hebergements", label: "Gérer hébergements" },
  { key: "gerer_activites", label: "Gérer activités" },
  { key: "voir_clients", label: "Voir clients" },
  { key: "gerer_commandes", label: "Gérer commandes" },
];

const DEFAULT_PERMISSIONS_BY_ROLE: Record<string, string[]> = {
  guide: ["voir_reservations", "voir_clients"],
  chauffeur: ["voir_reservations", "gerer_transport"],
  restaurant: ["gerer_restaurants", "gerer_commandes"],
  hotel: ["gerer_hebergements", "voir_reservations"],
  commercial: ["voir_reservations", "voir_clients", "gerer_transport", "gerer_restaurants", "gerer_hebergements", "gerer_activites"],
};

function getStaff(): StaffAccount[] {
  try { return JSON.parse(localStorage.getItem("staffAccounts") || "[]"); } catch { return []; }
}
function saveStaff(list: StaffAccount[]) {
  localStorage.setItem("staffAccounts", JSON.stringify(list));
}

const EMPTY_FORM = {
  name: "", role: "guide" as Exclude<UserRole, "superadmin" | "client">,
  identifier: "", password: "", permissions: [] as string[], active: true,
};

export function StaffAdmin() {
  const [staff, setStaff] = useState<StaffAccount[]>(() => getStaff());
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showPass, setShowPass] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const refresh = () => {
    const updated = getStaff();
    setStaff(updated);
  };

  const handleRoleChange = (role: Exclude<UserRole, "superadmin" | "client">) => {
    setForm({ ...form, role, permissions: DEFAULT_PERMISSIONS_BY_ROLE[role] || [] });
  };

  const togglePermission = (key: string) => {
    const current = form.permissions;
    setForm({ ...form, permissions: current.includes(key) ? current.filter(k => k !== key) : [...current, key] });
  };

  const handleSave = () => {
    if (!form.name || !form.identifier || !form.password) return;
    const list = getStaff();
    if (editId) {
      const idx = list.findIndex(s => s.id === editId);
      if (idx !== -1) list[idx] = { ...list[idx], ...form };
    } else {
      const newStaff: StaffAccount = {
        id: Date.now().toString(), createdAt: new Date().toISOString(),
        name: form.name, role: form.role, identifier: form.identifier,
        password: form.password, permissions: form.permissions, active: form.active,
      };
      list.push(newStaff);
    }
    saveStaff(list);
    setStaff(list);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setEditId(null); setForm({ ...EMPTY_FORM }); }, 1000);
  };

  const handleEdit = (s: StaffAccount) => {
    setForm({ name: s.name, role: s.role, identifier: s.identifier, password: s.password, permissions: s.permissions, active: s.active });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ce compte ?")) return;
    const list = getStaff().filter(s => s.id !== id);
    saveStaff(list);
    setStaff(list);
  };

  const handleToggle = (id: string) => {
    const list = getStaff().map(s => s.id === id ? { ...s, active: !s.active } : s);
    saveStaff(list);
    setStaff(list);
  };

  const cancel = () => { setShowForm(false); setEditId(null); setForm({ ...EMPTY_FORM }); };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Gestion des Accès Staff</h2>
          <p className="text-xs text-gray-500 mt-0.5">{staff.length} compte(s) — Créé par le super admin uniquement</p>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY_FORM }); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C7A5C] text-white rounded-xl text-sm font-bold hover:bg-[#245f49] transition-colors">
            <Plus className="w-4 h-4" /> Nouveau compte
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h3 className="font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#2C7A5C]" />
            {editId ? "Modifier le compte" : "Nouveau compte staff"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nom complet *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30"
                placeholder="Prénom Nom" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Rôle *</label>
              <select value={form.role} onChange={e => handleRoleChange(e.target.value as any)}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30 bg-white">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.icon} {r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Identifiant * <span className="text-gray-400 font-normal">(pour la connexion)</span></label>
              <input type="text" value={form.identifier} onChange={e => setForm({ ...form, identifier: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30"
                placeholder="ex: guide1" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Mot de passe *</label>
              <div className="relative mt-1">
                <input type={showPass ? "text" : "password"} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30"
                  placeholder="Mot de passe temporaire" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map(p => (
                <label key={p.key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={form.permissions.includes(p.key)}
                    onChange={() => togglePermission(p.key)}
                    className="w-4 h-4 accent-[#2C7A5C] rounded" />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 accent-[#2C7A5C] rounded" />
              Compte actif
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${saved ? "bg-green-500" : "bg-[#2C7A5C] hover:bg-[#245f49]"}`}>
              <Save className="w-4 h-4" /> {saved ? "Enregistré ✓" : "Enregistrer"}
            </button>
            <button onClick={cancel}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {staff.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center text-gray-400">
          <Shield className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Aucun compte staff créé</p>
          <p className="text-sm mt-1">Cliquez sur "Nouveau compte" pour ajouter un membre de l'équipe.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map(s => {
            const role = ROLES.find(r => r.value === s.role);
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id} className={`bg-white rounded-xl shadow-sm border transition-all ${!s.active ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A2E]/10 flex items-center justify-center text-xl shrink-0">
                    {role?.icon || "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800">{s.name}</div>
                    <div className="text-xs text-gray-500">{role?.label} · @{s.identifier}</div>
                    {s.lastLogin && <div className="text-xs text-gray-400 mt-0.5">Dernière connexion : {new Date(s.lastLogin).toLocaleString("fr-FR")}</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {s.active ? "Actif" : "Suspendu"}
                    </span>
                    <button onClick={() => handleToggle(s.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Activer/Suspendre">
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(s)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors text-xs font-bold">Édit</button>
                    <button onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-2">Permissions</div>
                    <div className="flex flex-wrap gap-2">
                      {s.permissions.length === 0 ? (
                        <span className="text-xs text-gray-400">Aucune permission</span>
                      ) : s.permissions.map(p => {
                        const perm = ALL_PERMISSIONS.find(ap => ap.key === p);
                        return perm ? (
                          <span key={p} className="px-2.5 py-1 bg-[#2C7A5C]/10 text-[#2C7A5C] rounded-full text-xs font-medium">
                            ✅ {perm.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Créé le {new Date(s.createdAt).toLocaleDateString("fr-FR")}</div>
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
