import { useState } from "react";
import { X, User, Calendar, Clock, FileText, Key, LogOut } from "lucide-react";
import { useClientAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";

type DashTab = "reservations" | "historique" | "profil" | "identifiants";

export function ClientDashboard() {
  const { clientSession, clientLogout, showClientDashboard, setShowClientDashboard } = useClientAuth();
  const { language } = useLanguage();
  const [tab, setTab] = useState<DashTab>("reservations");

  if (!showClientDashboard || !clientSession) return null;

  const user = clientSession.user;

  const texts = {
    FR: {
      title: "Mon Espace", reservations: "Mes Réservations", historique: "Mon Historique",
      profil: "Mon Profil", identifiants: "Mes Identifiants", logout: "Déconnexion",
      noRes: "Aucune réservation pour le moment.", noHist: "Aucun historique.",
      firstName: "Prénom", lastName: "Nom", email: "Email", whatsapp: "WhatsApp",
      nationality: "Nationalité", lang: "Langue", joinedOn: "Membre depuis",
      loginEmail: "Email / WhatsApp", passHidden: "Mot de passe",
    },
    EN: {
      title: "My Space", reservations: "My Bookings", historique: "My History",
      profil: "My Profile", identifiants: "My Credentials", logout: "Sign Out",
      noRes: "No bookings yet.", noHist: "No history yet.",
      firstName: "First name", lastName: "Last name", email: "Email", whatsapp: "WhatsApp",
      nationality: "Nationality", lang: "Language", joinedOn: "Member since",
      loginEmail: "Email / WhatsApp", passHidden: "Password",
    },
    ES: {
      title: "Mi Espacio", reservations: "Mis Reservas", historique: "Mi Historial",
      profil: "Mi Perfil", identifiants: "Mis Credenciales", logout: "Cerrar sesión",
      noRes: "Sin reservas por ahora.", noHist: "Sin historial.",
      firstName: "Nombre", lastName: "Apellido", email: "Email", whatsapp: "WhatsApp",
      nationality: "Nacionalidad", lang: "Idioma", joinedOn: "Miembro desde",
      loginEmail: "Email / WhatsApp", passHidden: "Contraseña",
    },
  };
  const T = texts[language];

  const tabs = [
    { id: "reservations" as DashTab, label: T.reservations, icon: Calendar },
    { id: "historique" as DashTab, label: T.historique, icon: Clock },
    { id: "profil" as DashTab, label: T.profil, icon: User },
    { id: "identifiants" as DashTab, label: T.identifiants, icon: Key },
  ];

  const handleLogout = () => {
    clientLogout();
    setShowClientDashboard(false);
  };

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm font-medium text-gray-800">{value || "—"}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowClientDashboard(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#2C7A5C] to-[#1A1A2E] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D4A017] flex items-center justify-center font-bold text-white text-lg">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <div className="font-bold text-lg">{user.firstName} {user.lastName}</div>
              <div className="text-white/70 text-sm">{T.title}</div>
            </div>
          </div>
          <button onClick={() => setShowClientDashboard(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 min-w-[80px] py-3 text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${tab === id ? "text-[#2C7A5C] border-b-2 border-[#2C7A5C]" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {tab === "reservations" && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Calendar className="w-12 h-12 mb-3 opacity-30" />
              <p>{T.noRes}</p>
            </div>
          )}
          {tab === "historique" && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Clock className="w-12 h-12 mb-3 opacity-30" />
              <p>{T.noHist}</p>
            </div>
          )}
          {tab === "profil" && (
            <div>
              <Field label={T.firstName} value={user.firstName} />
              <Field label={T.lastName} value={user.lastName} />
              <Field label={T.email} value={user.email || ""} />
              <Field label={T.whatsapp} value={user.whatsapp} />
              <Field label={T.nationality} value={user.nationality} />
              <Field label={T.lang} value={user.language} />
              <Field label={T.joinedOn} value={new Date(user.createdAt).toLocaleDateString()} />
            </div>
          )}
          {tab === "identifiants" && (
            <div>
              <Field label={T.loginEmail} value={user.email || user.whatsapp} />
              <div className="py-3 border-b border-gray-100">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{T.passHidden}</div>
                <div className="text-sm font-medium text-gray-800">{"•".repeat(user.password.length)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout}
            className="w-full py-2.5 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors">
            <LogOut className="w-4 h-4" />
            {T.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
