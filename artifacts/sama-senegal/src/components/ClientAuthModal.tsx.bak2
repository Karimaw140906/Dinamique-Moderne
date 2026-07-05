import { useState } from "react";
import { useLocation } from "wouter";
import { CGUModal } from "@/components/CGUModal";
import { ProviderRequestForm } from "@/components/ProviderRequestForm";
import { GoogleProfileCompletion } from "@/components/GoogleProfileCompletion";
import { X, Eye, EyeOff, MessageCircle, Phone, Mail, User, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTwoFactor } from "@/lib/useTwoFactor";
import { supabase } from "@/lib/supabase";
import { TwoFactorVerify } from "@/components/TwoFactorVerify";
import { useLanguage } from "@/lib/i18n";

type AuthTab = "login" | "register";
type LoginMethod = "email" | "phone" | "whatsapp";

function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">ou</span><div className="flex-1 h-px bg-gray-200" />
      </div>
      <button onClick={onClick} type="button"
        className="w-full py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"/>
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
        </svg>
        Continuer avec Google
      </button>
    </>
  );
}

export function ClientAuthModal() {
  const {
    showModal, setShowModal, login, register, setShowDashboard,
    loginWithGoogle, pendingGoogleProfile, completeGoogleProfile, cancelGoogleProfile,
  } = useAuth();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<AuthTab>("login");
  const [pending2FA, setPending2FA] = useState<{ clientId: string; email: string } | null>(null);
  const { isTwoFactorEnabled, loading: tfaLoading } = useTwoFactor();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [showCGU, setShowCGU] = useState(false);
  const [pendingRegData, setPendingRegData] = useState<any>(null);
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [reg, setReg] = useState({
    firstName: "", lastName: "", email: "", whatsapp: "",
    password: "", nationality: "", language: "FR",
  });

  if (!showModal && !pendingGoogleProfile) return null;

  if (pendingGoogleProfile) {
    return (
      <GoogleProfileCompletion
        profile={pendingGoogleProfile}
        onSubmit={completeGoogleProfile}
        onCancel={cancelGoogleProfile}
      />
    );
  }

  if (!showModal) return null;
  if (showProviderForm) return <ProviderRequestForm onClose={() => setShowProviderForm(false)} />;

  const texts = {
    FR: { title: "Mon Compte", login: "Se connecter", register: "Créer un compte", emailLabel: "Email", pass: "Mot de passe", submit: "Se connecter", registerBtn: "Créer mon compte", firstName: "Prénom", lastName: "Nom", emailOpt: "Email (optionnel)", whatsappReq: "WhatsApp (obligatoire)", nationality: "Nationalité", lang: "Langue préférée", minPass: "Mot de passe (min. 6 caractères)", errLogin: "Identifiants incorrects. Vérifiez et réessayez.", errRegister: "Ce compte existe déjà (email ou WhatsApp).", errFields: "Veuillez remplir tous les champs obligatoires.", errPass: "Le mot de passe doit contenir au moins 6 caractères.", byEmail: "Identifiant", byPhone: "Téléphone", byWa: "WhatsApp", staffNote: "Vous êtes guide ou membre de l'équipe ? Contactez l'administrateur." },
    EN: { title: "My Account", login: "Sign In", register: "Create Account", emailLabel: "Email", pass: "Password", submit: "Sign In", registerBtn: "Create my account", firstName: "First name", lastName: "Last name", emailOpt: "Email (optional)", whatsappReq: "WhatsApp (required)", nationality: "Nationality", lang: "Preferred language", minPass: "Password (min. 6 characters)", errLogin: "Incorrect credentials. Please try again.", errRegister: "This account already exists.", errFields: "Please fill in all required fields.", errPass: "Password must be at least 6 characters.", byEmail: "Username", byPhone: "Phone", byWa: "WhatsApp", staffNote: "Are you a guide or team member? Contact the administrator." },
    ES: { title: "Mi Cuenta", login: "Iniciar sesión", register: "Crear cuenta", emailLabel: "Email", pass: "Contraseña", submit: "Iniciar sesión", registerBtn: "Crear mi cuenta", firstName: "Nombre", lastName: "Apellido", emailOpt: "Email (opcional)", whatsappReq: "WhatsApp (obligatorio)", nationality: "Nacionalidad", lang: "Idioma preferido", minPass: "Contraseña (mín. 6 caracteres)", errLogin: "Credenciales incorrectas.", errRegister: "Esta cuenta ya existe.", errFields: "Por favor completa todos los campos.", errPass: "La contraseña debe tener al menos 6 caracteres.", byEmail: "Usuario", byPhone: "Teléfono", byWa: "WhatsApp", staffNote: "¿Eres guía o miembro del equipo? Contacta al administrador." },
  };
  const T = texts[language];

  const handleLogin = async () => {
    setError("");
    if (!loginId || !loginPass) { setError(T.errFields); return; }
    setLoading(true);
    const role = await login(loginId, loginPass);
    setLoading(false);
    if (role) {
      if (role === "client") {
        const { supabase } = await import("@/lib/supabase");
        const { data: clientData } = await supabase.from("clients").select("id,email,two_factor_enabled")
          .eq("email", loginId).single();
        if (clientData?.two_factor_enabled && clientData?.email) {
          setPending2FA({ clientId: clientData.id, email: clientData.email });
          return;
        }
      }
      setShowModal(false);
      if (role === "dg") {
        navigate("/dg");
      } else if (role !== "client") {
        setShowDashboard(true);
      }
    } else {
      setError(T.errLogin);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!reg.firstName || !reg.lastName || !reg.whatsapp || !reg.password || !reg.nationality) { setError(T.errFields); return; }
    if (reg.password.length < 6) { setError(T.errPass); return; }
    setPendingRegData(reg);
    setShowCGU(true);
  };


  async function handleCGUAccept() {
    setShowCGU(false);
    setLoading(true);
    const result = await register(pendingRegData);
    if (result === "ok") {
      try {
        const logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");
        logs.unshift({ action: "CGU_ACCEPTED", user_name: `${pendingRegData.firstName} ${pendingRegData.lastName}`, user_role: "client", details: `CGU acceptées`, created_at: new Date().toISOString() });
        localStorage.setItem("activityLogs", JSON.stringify(logs.slice(0, 500)));
      } catch {}
      setShowModal(false);
    } else {
      setError(T.errRegister);
    }
    setLoading(false);
  };

  if (pending2FA) return (
    <TwoFactorVerify
      clientId={pending2FA.clientId}
      email={pending2FA.email}
      onSuccess={() => {
        setPending2FA(null);
        setShowModal(false);
        setShowDashboard(true);
      }}
      onCancel={() => {
        setPending2FA(null);
        setLoading(false);
      }}
    />
  );

  return (
    <>
      {showCGU && (
        <CGUModal
          type="client"
          onAccept={handleCGUAccept}
          onClose={() => { setShowCGU(false); setPendingRegData(null); }}
        />
      )}
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#6C3EF5] to-[#0B0A14] p-6 text-white flex justify-between items-center">
          <div>
            <div className="text-2xl font-serif italic font-bold">🌴 Sama Senegal</div>
            <div className="text-white/70 text-sm mt-1">{T.title}</div>
          </div>
          <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === "login" ? "text-[#6C3EF5] border-b-2 border-[#6C3EF5]" : "text-gray-500"}`}>
            {T.login}
          </button>
          <button onClick={() => { setTab("register"); setError(""); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === "register" ? "text-[#6C3EF5] border-b-2 border-[#6C3EF5]" : "text-gray-500"}`}>
            {T.register}
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {tab === "login" && (
            <div className="space-y-4">
              <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs">
                {(["email", "phone", "whatsapp"] as LoginMethod[]).map((m) => (
                  <button key={m} onClick={() => { setLoginMethod(m); setError(""); }}
                    className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${loginMethod === m ? "bg-[#6C3EF5] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                    {m === "email" && <><Mail className="w-3 h-3" /> {T.byEmail}</>}
                    {m === "phone" && <><Phone className="w-3 h-3" /> {T.byPhone}</>}
                    {m === "whatsapp" && <><MessageCircle className="w-3 h-3" /> {T.byWa}</>}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder={T.emailLabel}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={loginPass} onChange={(e) => setLoginPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder={T.pass}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button onClick={handleLogin} disabled={loading}
                className="w-full py-3 bg-[#F5B942] hover:bg-[#c49015] text-white font-bold rounded-xl transition-colors disabled:opacity-60">
                {loading ? "..." : T.submit}
              </button>
              <GoogleButton onClick={loginWithGoogle} />
            </div>
          )}

          {tab === "register" && (
            <div className="space-y-3">
              <div className="bg-[#6C3EF5]/5 border border-[#6C3EF5]/20 rounded-xl px-4 py-3 text-xs text-[#6C3EF5]">
                ℹ️ {T.staffNote}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={reg.firstName} onChange={(e) => setReg({ ...reg, firstName: e.target.value })}
                    placeholder={T.firstName} className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
                </div>
                <input type="text" value={reg.lastName} onChange={(e) => setReg({ ...reg, lastName: e.target.value })}
                  placeholder={T.lastName} className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })}
                  placeholder={T.emailOpt} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={reg.whatsapp} onChange={(e) => setReg({ ...reg, whatsapp: e.target.value })}
                  placeholder={T.whatsappReq} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })}
                  placeholder={T.minPass} className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input type="text" value={reg.nationality} onChange={(e) => setReg({ ...reg, nationality: e.target.value })}
                placeholder={T.nationality} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
              <select value={reg.language} onChange={(e) => setReg({ ...reg, language: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] placeholder-gray-400 focus:outline-none bg-white focus:ring-2 focus:ring-[#6C3EF5]/30">
                <option value="FR">🇫🇷 Français</option>
                <option value="EN">🇬🇧 English</option>
                <option value="ES">🇪🇸 Español</option>
              </select>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="text-center pt-2">
                <button onClick={() => { setShowModal(false); setShowProviderForm(true); }}
                  className="text-sm text-[#6C3EF5] hover:underline font-medium">
                  🌴 Vous êtes prestataire ? Faire une demande d'accès
                </button>
              </div>
              <button onClick={handleRegister} disabled={loading}
                className="w-full py-3 bg-[#F5B942] hover:bg-[#c49015] text-white font-bold rounded-xl transition-colors disabled:opacity-60">
                {loading ? "..." : T.registerBtn}
              </button>
              <GoogleButton onClick={loginWithGoogle} />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
