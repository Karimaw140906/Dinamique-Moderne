import { useState, useEffect } from "react";
import { Settings, Save, RefreshCw, Globe, Phone, Instagram, DollarSign, Power, CreditCard, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULT_SETTINGS: Record<string, string> = {
  maintenance_mode: "false",
  reservations_enabled: "true",
  payment_enabled: "true",
  whatsapp_enabled: "true",
  default_currency: "XOF",
  default_language: "FR",
  whatsapp_number: "+221774188107",
  instagram: "@sama__senegal",
  site_version: "2.0.0",
  rate_eur: "0.00152",
  rate_usd: "0.00166",
  rate_gbp: "0.0013",
  rate_mad: "0.01658",
  rate_cad: "0.00226",
};

export function SettingsAdmin() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [source, setSource] = useState<"supabase" | "local">("local");

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (!error && data && data.length > 0) {
        const map: Record<string, string> = { ...DEFAULT_SETTINGS };
        data.forEach((row: any) => { map[row.key] = row.value; });
        setSettings(map);
        setSource("supabase");
        setLoading(false);
        return;
      }
    } catch {}
    try {
      const saved = localStorage.getItem("siteSettings");
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {}
    setSource("local");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key: string) => {
    const current = settings[key] === "true";
    updateSetting(key, (!current).toString());
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({
        key, value, updated_at: new Date().toISOString()
      }));
      await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      localStorage.setItem("siteSettings", JSON.stringify(settings));
      window.dispatchEvent(new Event("siteSettingsUpdated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      localStorage.setItem("siteSettings", JSON.stringify(settings));
    }
    setSaving(false);
  };

  const Toggle = ({ settingKey, label, icon: Icon, color = "#2C7A5C" }: { settingKey: string; label: string; icon: any; color?: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <button onClick={() => toggleSetting(settingKey)}
        className={`relative w-12 h-6 rounded-full transition-colors ${settings[settingKey] === "true" ? "bg-[#2C7A5C]" : "bg-gray-300"}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings[settingKey] === "true" ? "translate-x-7" : "translate-x-1"}`} />
      </button>
    </div>
  );

  const Field = ({ settingKey, label, icon: Icon, type = "text", placeholder = "" }: { settingKey: string; label: string; icon: any; type?: string; placeholder?: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <input type={type} value={settings[settingKey] || ""} onChange={e => updateSetting(settingKey, e.target.value)}
        placeholder={placeholder}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30 w-48" />
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <RefreshCw className="w-8 h-8 animate-spin opacity-30" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Source + Save */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${
          source === "supabase" ? "bg-green-50 text-green-600 border border-green-200" : "bg-yellow-50 text-yellow-600 border border-yellow-200"
        }`}>
          {source === "supabase" ? "✅ Supabase" : "⚠️ Local"}
        </div>
        <button onClick={saveAll} disabled={saving}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-colors ${saved ? "bg-green-500" : "bg-[#2C7A5C] hover:bg-[#245f49]"} disabled:opacity-50`}>
          <Save className="w-4 h-4" /> {saved ? "Enregistré ✓" : saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      {/* Fonctionnalités */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg border-b pb-3 mb-3 flex items-center gap-2">
          <Power className="w-5 h-5 text-[#2C7A5C]" /> Fonctionnalités
        </h2>
        <Toggle settingKey="reservations_enabled" label="Réservations activées" icon={Settings} />
        <Toggle settingKey="payment_enabled" label="Paiement en ligne activé" icon={CreditCard} />
        <Toggle settingKey="whatsapp_enabled" label="Notifications WhatsApp" icon={MessageCircle} />
        <Toggle settingKey="maintenance_mode" label="Mode maintenance" icon={Settings} />
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg border-b pb-3 mb-3 flex items-center gap-2">
          <Phone className="w-5 h-5 text-[#2C7A5C]" /> Contact & Réseaux
        </h2>
        <Field settingKey="whatsapp_number" label="WhatsApp" icon={Phone} placeholder="+221..." />
        <Field settingKey="instagram" label="Instagram" icon={Instagram} placeholder="@sama__senegal" />
      </div>

      {/* Langue & Devise */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg border-b pb-3 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#2C7A5C]" /> Langue & Devise
        </h2>
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">Langue par défaut</span>
          </div>
          <select value={settings.default_language} onChange={e => updateSetting("default_language", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30">
            <option value="FR">🇫🇷 Français</option>
            <option value="EN">🇬🇧 English</option>
            <option value="ES">🇪🇸 Español</option>
          </select>
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">Devise par défaut</span>
          </div>
          <select value={settings.default_currency} onChange={e => updateSetting("default_currency", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30">
            <option value="XOF">XOF (FCFA)</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
      </div>

      {/* Taux de conversion */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg border-b pb-3 mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#D4A017]" /> Taux de conversion
        </h2>
        <p className="text-xs text-gray-400 mb-4">Base : 1 FCFA = X devise</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "rate_eur", flag: "🇪🇺", code: "EUR" },
            { key: "rate_usd", flag: "🇺🇸", code: "USD" },
            { key: "rate_gbp", flag: "🇬🇧", code: "GBP" },
            { key: "rate_mad", flag: "🇲🇦", code: "MAD" },
            { key: "rate_cad", flag: "🇨🇦", code: "CAD" },
          ].map(({ key, flag, code }) => (
            <div key={key} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <span className="text-lg">{flag}</span>
              <span className="font-bold text-sm w-10 text-gray-700">{code}</span>
              <input type="number" step="0.00001" value={settings[key] || ""}
                onChange={e => updateSetting(key, e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30" />
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">Version {settings.site_version}</div>
    </div>
  );
}
