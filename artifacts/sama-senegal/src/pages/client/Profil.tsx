import { useState } from "react";
import ClientLayout from "./_layout";
import { PageHeader, COLORS } from "./_shared";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { TwoFactorSettings } from "@/components/TwoFactorSettings";

export default function Profil() {
  const { session } = useAuth();
  const u = session?.clientUser;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: u?.firstName || "",
    lastName: u?.lastName || "",
    email: u?.email || "",
    whatsapp: u?.whatsapp || "",
    nationality: u?.nationality || "",
  });

  const handleSave = async () => {
    if (!u?.id) return;
    setSaving(true);
    await supabase.from("clients").update({
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      whatsapp: form.whatsapp,
      nationality: form.nationality,
    }).eq("id", u.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!u) return (
    <ClientLayout>
      <PageHeader title="Mon profil" />
      <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm">
        Connectez-vous pour accéder à votre profil.
      </div>
    </ClientLayout>
  );

  return (
    <ClientLayout>
      <PageHeader title="Mon profil" subtitle="Informations personnelles et préférences" />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">Informations personnelles</p>

          {[
            { label: "Prénom", key: "firstName" },
            { label: "Nom", key: "lastName" },
            { label: "Email", key: "email" },
            { label: "WhatsApp", key: "whatsapp" },
            { label: "Nationalité", key: "nationality" },
          ].map(({ label, key }) => (
            <div key={key} className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#e5e7eb" }}
              />
            </div>
          ))}

          <button onClick={handleSave} disabled={saving}
            className="mt-2 w-full py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: saved ? "#16a34a" : COLORS.vert }}>
            {saving ? "Enregistrement..." : saved ? "✓ Enregistré" : "Enregistrer"}
          </button>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">Sécurité</p>
          <div className="py-2 border-b mb-4" style={{ borderColor: "#f3f4f6" }}>
            <p className="text-sm font-medium mb-1" style={{ color: COLORS.noir }}>Mot de passe</p>
            <p className="text-xs text-gray-400">Modifiable sur demande</p>
          </div>
          {u.email && (
            <TwoFactorSettings clientId={u.id} email={u.email} />
          )}
          <div className="py-3 mt-4 border-t" style={{ borderColor: "#f3f4f6" }}>
            <p className="text-sm font-medium" style={{ color: COLORS.noir }}>Points fidélité</p>
            <p className="text-xs text-gray-400">{u.points || 0} points</p>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
