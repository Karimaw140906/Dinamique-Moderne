import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Section = {
  id: number;
  key: string;
  label: string;
  active: boolean;
  sort_order: number;
};

const ICONS: Record<string, string> = {
  restaurants: "🍽️",
  hotels:      "🏨",
  activities:  "🏄",
  transport:   "🚗",
  tours:       "🗺️",
  menu:        "🍜",
};

export function SectionsAdmin() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_sections")
        .select("*")
        .order("sort_order");
      if (data) setSections(data);
      setLoading(false);
    };
    load();
  }, []);

  const toggle = async (section: Section) => {
    setSaving(section.key);
    const newActive = !section.active;
    const { error } = await supabase
      .from("site_sections")
      .update({ active: newActive, updated_at: new Date().toISOString() })
      .eq("key", section.key);

    if (!error) {
      setSections((prev) =>
        prev.map((s) => s.key === section.key ? { ...s, active: newActive } : s)
      );
      showToast(`${section.label} : ${newActive ? "activé ✅" : "désactivé 🔴"}`);
    } else {
      showToast("Erreur lors de la mise à jour");
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  const activeCount = sections.filter((s) => s.active).length;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sections du site</h2>
        <p className="text-gray-500 text-sm mt-1">
          {activeCount}/{sections.length} sections visibles — effet immédiat
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(activeCount / sections.length) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.key}
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
              section.active ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ICONS[section.key] || "📄"}</span>
              <div>
                <p className="font-semibold text-gray-900">{section.label}</p>
                <p className="text-xs text-gray-400">{section.key}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                section.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
              }`}>
                {section.active ? "Visible" : "Masquée"}
              </span>

              <button
                onClick={() => toggle(section)}
                disabled={saving === section.key}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  section.active ? "bg-green-500" : "bg-gray-300"
                } ${saving === section.key ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  section.active ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        💡 Les changements sont appliqués immédiatement sur le site public sans redéploiement.
      </div>
    </div>
  );
}
