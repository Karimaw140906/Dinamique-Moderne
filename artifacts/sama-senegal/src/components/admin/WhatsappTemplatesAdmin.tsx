import { useState, useEffect } from "react";
import { Save, RefreshCw, MessageCircle, CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const EMPTY_FORM = {
  key: "", label: "", body_fr: "", body_en: "", body_es: "",
  variables: [] as string[], active: true,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  queued:    { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  sent:      { label: "Envoyé",     color: "bg-blue-100 text-blue-700",     icon: CheckCircle },
  delivered: { label: "Livré",      color: "bg-green-100 text-green-700",  icon: CheckCircle },
  failed:    { label: "Échoué",     color: "bg-red-100 text-red-600",      icon: XCircle },
};

export function WhatsappTemplatesAdmin() {
  const [tab, setTab] = useState<"templates" | "queue">("templates");
  const [templates, setTemplates] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_templates")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) setTemplates(data);
    } catch {}
    setLoading(false);
  };

  const loadQueue = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) setQueue(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "templates") loadTemplates();
    else loadQueue();
  }, [tab]);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditingKey(null);
    setShowForm(true);
  };

  const openEdit = (t: any) => {
    setForm({
      key: t.key, label: t.label, body_fr: t.body_fr,
      body_en: t.body_en || "", body_es: t.body_es || "",
      variables: t.variables || [], active: t.active,
    });
    setEditingKey(t.key);
    setShowForm(true);
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{([a-z_]+)\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, "")))];
  };

  const handleSave = async () => {
    if (!form.key || !form.label || !form.body_fr) return;
    setSaving(true);
    const variables = extractVariables(form.body_fr);
    try {
      await supabase.from("whatsapp_templates").upsert({
        key: form.key,
        label: form.label,
        body_fr: form.body_fr,
        body_en: form.body_en || null,
        body_es: form.body_es || null,
        variables,
        active: form.active,
      }, { onConflict: "key" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setShowForm(false);
      loadTemplates();
    } catch {}
    setSaving(false);
  };

  const toggleActive = async (key: string, active: boolean) => {
    try {
      await supabase.from("whatsapp_templates").update({ active: !active }).eq("key", key);
      loadTemplates();
    } catch {}
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-600" /> Templates WhatsApp
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Gérez les messages automatiques envoyés aux clients. Aucun envoi réel pour l'instant — file d'attente uniquement.
          </p>
        </div>
        {tab === "templates" && (
          <button onClick={openAdd} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
            + Nouveau template
          </button>
        )}
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setTab("templates")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${tab === "templates" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}>
          Templates
        </button>
        <button onClick={() => setTab("queue")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${tab === "queue" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}>
          File d'attente ({queue.length})
        </button>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          ✅ Template enregistré avec succès
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : tab === "templates" ? (
        <div className="space-y-3">
          {templates.length === 0 && (
            <p className="text-gray-400 text-sm py-10 text-center">Aucun template pour le moment.</p>
          )}
          {templates.map((t) => (
            <div key={t.key} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-semibold text-gray-900">{t.label}</span>
                  <span className="ml-2 text-xs text-gray-400 font-mono">{t.key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(t.key, t.active)}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {t.active ? "Actif" : "Inactif"}
                  </button>
                  <button onClick={() => openEdit(t)} className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    Modifier
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{t.body_fr}</p>
              {t.variables && t.variables.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.variables.map((v: string) => (
                    <span key={v} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-mono">{`{${v}}`}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {queue.length === 0 && (
            <p className="text-gray-400 text-sm py-10 text-center">Aucun message en file d'attente.</p>
          )}
          {queue.map((q) => {
            const cfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.queued;
            const Icon = cfg.icon;
            return (
              <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{q.phone}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{q.rendered_message}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${cfg.color}`}>
                  <Icon className="w-3 h-3" /> {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editingKey ? "Modifier le template" : "Nouveau template"}</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Clé technique (ex: booking_confirmed)" value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                disabled={!!editingKey}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm disabled:bg-gray-50" />
              <input type="text" placeholder="Libellé" value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <textarea placeholder="Message FR — utilisez {variable_name} pour les champs dynamiques" value={form.body_fr}
                onChange={(e) => setForm({ ...form, body_fr: e.target.value })}
                rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <textarea placeholder="Message EN (optionnel)" value={form.body_en}
                onChange={(e) => setForm({ ...form, body_en: e.target.value })}
                rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <textarea placeholder="Mensaje ES (optionnel)" value={form.body_es}
                onChange={(e) => setForm({ ...form, body_es: e.target.value })}
                rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Actif
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                <Save className="w-4 h-4" /> {saving ? "..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
