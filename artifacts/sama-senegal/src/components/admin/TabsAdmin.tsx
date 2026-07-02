import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Link,
  FileText,
  Image,
  Table,
  Phone,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface SectionConfig {
  id: string;
  labelFR: string;
  labelEN: string;
  labelES: string;
  emoji: string;
  visible: boolean;
  order: number;
  inNavbar: boolean;
  isCustom: boolean;
  type: "builtin" | "cards" | "free" | "link" | "cta" | "gallery" | "table";
  href?: string;
}

const BUILTIN_DEFAULTS: Omit<SectionConfig, "order">[] = [
  {
    id: "stats",
    labelFR: "Statistiques",
    labelEN: "Stats",
    labelES: "EstadÃ­sticas",
    emoji: "ð",
    visible: true,
    inNavbar: false,
    isCustom: false,
    type: "builtin",
  },
  {
    id: "tours",
    labelFR: "Nos Tours",
    labelEN: "Our Tours",
    labelES: "Nuestros Tours",
    emoji: "ðºï¸",
    visible: true,
    inNavbar: true,
    isCustom: false,
    type: "builtin",
  },
  {
    id: "transport",
    labelFR: "Transport",
    labelEN: "Transport",
    labelES: "Transporte",
    emoji: "ð",
    visible: true,
    inNavbar: false,
    isCustom: false,
    type: "builtin",
  },
  {
    id: "team",
    labelFR: "Notre Ãquipe",
    labelEN: "Our Team",
    labelES: "Nuestro Equipo",
    emoji: "ð¥",
    visible: false,
    inNavbar: false,
    isCustom: false,
    type: "builtin",
  },
  {
    id: "restaurants",
    labelFR: "Restaurants",
    labelEN: "Restaurants",
    labelES: "Restaurantes",
    emoji: "ð½ï¸",
    visible: true,
    inNavbar: false,
    isCustom: false,
    type: "builtin",
  },
  {
    id: "hotels",
    labelFR: "HÃ©bergements",
    labelEN: "Accommodations",
    labelES: "Alojamientos",
    emoji: "ð¨",
    visible: true,
    inNavbar: false,
    isCustom: false,
    type: "builtin",
  },
  {
    id: "food",
    labelFR: "Commander Repas",
    labelEN: "Order Food",
    labelES: "Ordenar Comida",
    emoji: "ð",
    visible: true,
    inNavbar: false,
    isCustom: false,
    type: "builtin",
  },
  {
    id: "activities",
    labelFR: "ActivitÃ©s",
    labelEN: "Activities",
    labelES: "Actividades",
    emoji: "ð¯",
    visible: true,
    inNavbar: false,
    isCustom: false,
    type: "builtin",
  },
  {
    id: "testimonials",
    labelFR: "TÃ©moignages",
    labelEN: "Testimonials",
    labelES: "Testimonios",
    emoji: "â­",
    visible: true,
    inNavbar: false,
    isCustom: false,
    type: "builtin",
  },
  {
    id: "booking",
    labelFR: "RÃ©servation",
    labelEN: "Book Now",
    labelES: "Reservar",
    emoji: "ð",
    visible: true,
    inNavbar: true,
    isCustom: false,
    type: "builtin",
  },
  {
    id: "sos",
    labelFR: "Bouton SOS",
    labelEN: "SOS Button",
    labelES: "Botón SOS",
    emoji: "🆘",
    visible: true,
    inNavbar: false,
    isCustom: false,
    type: "builtin",
  },
];

const TYPE_OPTIONS = [
  { value: "cards", label: "ð Liste de cards", icon: Table },
  { value: "free", label: "ð Contenu libre", icon: FileText },
  { value: "link", label: "ð Lien externe", icon: Link },
  { value: "cta", label: "ð Contact / CTA", icon: Phone },
  { value: "gallery", label: "ð¼ï¸ Galerie photos", icon: Image },
];

function loadConfig(): SectionConfig[] {
  try {
    const saved = localStorage.getItem("sectionsConfig");
    if (saved) return JSON.parse(saved);
  } catch {}
  return BUILTIN_DEFAULTS.map((s, i) => ({ ...s, order: i }));
}
async function saveConfigToSupabase(config: SectionConfig[]) {
  localStorage.setItem("sectionsConfig", JSON.stringify(config));
  window.dispatchEvent(new Event("sectionsConfigUpdated"));
  try {
    for (const section of config) {
      await supabase.from("site_sections").upsert({
        key: section.id,
        active: section.visible,
        label: section.labelFR || section.id,
        sort_order: section.order ?? 0,
      }, { onConflict: "key" });
    }
  } catch {}
}
function saveConfig(config: SectionConfig[]) {
  saveConfigToSupabase(config);
}

const EMPTY_CUSTOM: Omit<SectionConfig, "id" | "order"> = {
  labelFR: "",
  labelEN: "",
  labelES: "",
  emoji: "â¨",
  visible: true,
  inNavbar: false,
  isCustom: true,
  type: "cards",
};

export function TabsAdmin() {
  const { language } = useLanguage();
  const [config, setConfig] = useState<SectionConfig[]>(() => loadConfig());
  const [showForm, setShowForm] = useState(false);
  const [newTab, setNewTab] = useState({ ...EMPTY_CUSTOM });
  const [saved, setSaved] = useState(false);

  const persist = (newConfig: SectionConfig[]) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const toggleVisible = (id: string) => {
    const updated = config.map((s) =>
      s.id === id ? { ...s, visible: !s.visible } : s,
    );
    persist(updated);
  };

  const toggleNavbar = (id: string) => {
    const updated = config.map((s) =>
      s.id === id ? { ...s, inNavbar: !s.inNavbar } : s,
    );
    persist(updated);
  };

  const moveUp = (id: string) => {
    const sorted = [...config].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx <= 0) return;
    const tmp = sorted[idx].order;
    sorted[idx].order = sorted[idx - 1].order;
    sorted[idx - 1].order = tmp;
    persist(sorted);
  };

  const moveDown = (id: string) => {
    const sorted = [...config].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx >= sorted.length - 1) return;
    const tmp = sorted[idx].order;
    sorted[idx].order = sorted[idx + 1].order;
    sorted[idx + 1].order = tmp;
    persist(sorted);
  };

  const addCustomTab = () => {
    if (!newTab.labelFR) return;
    const id = "custom_" + Date.now();
    const entry: SectionConfig = {
      ...newTab,
      id,
      order: config.length,
    };
    const updated = [...config, entry];
    persist(updated);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowForm(false);
      setNewTab({ ...EMPTY_CUSTOM });
    }, 800);
  };

  const deleteCustom = (id: string) => {
    if (!confirm("Supprimer cet onglet ?")) return;
    persist(config.filter((s) => s.id !== id));
  };

  const updateLabel = (
    id: string,
    field: "labelFR" | "labelEN" | "labelES" | "emoji",
    value: string,
  ) => {
    persist(config.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const sorted = [...config].sort((a, b) => a.order - b.order);
  const builtins = sorted.filter((s) => !s.isCustom);
  const customs = sorted.filter((s) => s.isCustom);

  const getLabel = (s: SectionConfig) =>
    language === "EN" ? s.labelEN : language === "ES" ? s.labelES : s.labelFR;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-800">
          Gestion des Onglets & Sections
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Activez/dÃ©sactivez les sections, rÃ©ordonnez-les, et crÃ©ez des onglets
          personnalisÃ©s.
        </p>
      </div>

      {/* Built-in sections */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">
            Sections intÃ©grÃ©es
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Ces sections peuvent Ãªtre masquÃ©es ou rÃ©ordonnÃ©es, mais jamais
            supprimÃ©es.
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {builtins.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${!s.visible ? "opacity-50" : ""}`}
            >
              <div className="text-xl w-8 text-center">{s.emoji}</div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={
                    language === "EN"
                      ? s.labelEN
                      : language === "ES"
                        ? s.labelES
                        : s.labelFR
                  }
                  onChange={(e) =>
                    updateLabel(
                      s.id,
                      language === "EN"
                        ? "labelEN"
                        : language === "ES"
                          ? "labelES"
                          : "labelFR",
                      e.target.value,
                    )
                  }
                  className="font-semibold text-sm text-gray-800 bg-transparent border-0 outline-none hover:bg-gray-50 focus:bg-gray-50 rounded px-1 py-0.5 w-full"
                />
                <div className="text-xs text-gray-400">ID: {s.id}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleNavbar(s.id)}
                  title="Afficher dans la navbar"
                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition-colors ${s.inNavbar ? "bg-[#6C3EF5]/10 border-[#6C3EF5]/20 text-[#6C3EF5]" : "bg-gray-50 border-gray-200 text-gray-400"}`}
                >
                  Nav
                </button>
                <button
                  onClick={() => toggleVisible(s.id)}
                  className={`p-1.5 rounded-lg transition-colors ${s.visible ? "text-[#6C3EF5] hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                >
                  {s.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveUp(s.id)}
                    disabled={i === 0}
                    className="p-0.5 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveDown(s.id)}
                    disabled={i === builtins.length - 1}
                    className="p-0.5 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">
              Onglets personnalisÃ©s
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {customs.length} onglet(s) crÃ©Ã©(s)
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#6C3EF5] text-white rounded-xl text-sm font-bold hover:bg-[#8B5CF6] transition-colors"
            >
              <Plus className="w-4 h-4" /> Nouvel onglet
            </button>
          )}
        </div>

        {showForm && (
          <div className="px-6 py-5 border-b border-gray-100 space-y-4 bg-[#6C3EF5]/2">
            <h4 className="font-bold text-sm text-gray-800">
              CrÃ©er un nouvel onglet
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Emoji
                </label>
                <input
                  type="text"
                  value={newTab.emoji}
                  onChange={(e) =>
                    setNewTab({ ...newTab, emoji: e.target.value })
                  }
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-center text-xl"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Type de contenu
                </label>
                <select
                  value={newTab.type}
                  onChange={(e) =>
                    setNewTab({ ...newTab, type: e.target.value as any })
                  }
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm bg-white"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nom FR *
                </label>
                <input
                  type="text"
                  value={newTab.labelFR}
                  onChange={(e) =>
                    setNewTab({ ...newTab, labelFR: e.target.value })
                  }
                  placeholder="Titre en franÃ§ais"
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nom EN
                </label>
                <input
                  type="text"
                  value={newTab.labelEN}
                  onChange={(e) =>
                    setNewTab({ ...newTab, labelEN: e.target.value })
                  }
                  placeholder="Title in English"
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nom ES
                </label>
                <input
                  type="text"
                  value={newTab.labelES}
                  onChange={(e) =>
                    setNewTab({ ...newTab, labelES: e.target.value })
                  }
                  placeholder="TÃ­tulo en espaÃ±ol"
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm"
                />
              </div>
              {newTab.type === "link" && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    URL externe
                  </label>
                  <input
                    type="url"
                    value={newTab.href || ""}
                    onChange={(e) =>
                      setNewTab({ ...newTab, href: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTab.inNavbar}
                  onChange={(e) =>
                    setNewTab({ ...newTab, inNavbar: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#6C3EF5]"
                />
                Afficher dans la navbar
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTab.visible}
                  onChange={(e) =>
                    setNewTab({ ...newTab, visible: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#6C3EF5]"
                />
                Visible sur le site
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addCustomTab}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${saved ? "bg-green-500" : "bg-[#6C3EF5] hover:bg-[#8B5CF6]"}`}
              >
                <Save className="w-4 h-4" />{" "}
                {saved ? "CrÃ©Ã© â" : "CrÃ©er l'onglet"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewTab({ ...EMPTY_CUSTOM });
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {customs.length === 0 && !showForm ? (
          <div className="px-6 py-10 text-center text-gray-400">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Aucun onglet personnalisÃ© crÃ©Ã©.</p>
            <p className="text-xs mt-1">
              CrÃ©ez des sections personnalisÃ©es pour votre site.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {customs.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-6 py-3 ${!s.visible ? "opacity-50" : ""}`}
              >
                <div className="text-xl w-8 text-center">{s.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800">
                    {getLabel(s)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {TYPE_OPTIONS.find((t) => t.value === s.type)?.label ||
                      s.type}{" "}
                    Â· ID: {s.id}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleNavbar(s.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold border transition-colors ${s.inNavbar ? "bg-[#6C3EF5]/10 border-[#6C3EF5]/20 text-[#6C3EF5]" : "bg-gray-50 border-gray-200 text-gray-400"}`}
                  >
                    Nav
                  </button>
                  <button
                    onClick={() => toggleVisible(s.id)}
                    className={`p-1.5 rounded-lg ${s.visible ? "text-[#6C3EF5]" : "text-gray-400"}`}
                  >
                    {s.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteCustom(s.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#F5B942]/10 border border-[#F5B942]/20 rounded-xl px-5 py-4 text-sm text-[#5C3D1E]">
        <strong>ð¡ Note :</strong> Les modifications de visibilitÃ© sont
        appliquÃ©es immÃ©diatement sur le site public. L'ordre des sections sera
        respectÃ© au prochain chargement de page.
      </div>
    </div>
  );
}
