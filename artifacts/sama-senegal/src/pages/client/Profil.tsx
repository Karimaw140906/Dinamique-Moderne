import ClientLayout from "./_layout";
import { PageHeader, COLORS } from "./_shared";

export default function Profil() {
  return (
    <ClientLayout>
      <PageHeader
        title="Mon profil"
        subtitle="Informations personnelles et préférences"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {/* Informations */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">
            Informations personnelles
          </p>
          {["Prénom", "Nom", "Email", "Téléphone", "Pays"].map((field) => (
            <div key={field} className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">{field}</label>
              <div
                className="w-full px-3 py-2 rounded-lg border text-sm text-gray-400"
                style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}
              >
                —
              </div>
            </div>
          ))}
          <button
            className="mt-2 w-full py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: COLORS.vert }}
          >
            Modifier
          </button>
        </div>

        {/* Sécurité */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">
            Sécurité
          </p>
          {[
            { label: "Mot de passe", desc: "Dernière modification : —" },
            { label: "Double authentification", desc: "Non activée" },
            { label: "Appareils connectés", desc: "1 appareil" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-3 border-b last:border-0"
              style={{ borderColor: "#f3f4f6" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.noir }}>{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <button
                className="text-xs font-medium px-3 py-1 rounded-lg border"
                style={{ borderColor: COLORS.vert, color: COLORS.vert }}
              >
                Gérer
              </button>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
