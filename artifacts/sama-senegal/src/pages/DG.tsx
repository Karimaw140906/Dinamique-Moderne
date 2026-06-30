import { useAuth } from "@/lib/auth";

export default function DG() {
  const { session, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Tableau de bord Direction Générale</h1>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">
            Déconnexion
          </button>
        </div>
        <p className="text-gray-600">
          Bienvenue, {session?.name || "Directeur Général"}.
        </p>
        {/* Contenu DG à enrichir : vue globale réservations, paiements, staff, alertes */}
      </div>
    </div>
  );
}
