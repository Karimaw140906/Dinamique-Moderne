import { useState } from "react";
import { useLocation } from "wouter";
import { X, Eye, EyeOff, Lock, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function AdminAuthModal() {
  const { showModal: showAdminLogin, setShowModal: setShowAdminLogin, setShowDashboard, login } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  if (!showAdminLogin) return null;

  const handleLogin = async () => {
    setError(false);
    const role = await login(username, password);
    if (!role) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } else {
      setShowAdminLogin(false);
      if (role === "dg") {
        navigate("/dg");
      } else {
        setShowDashboard(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0B0A14]">
      <div
        className={`w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden transition-all ${shake ? "animate-shake" : ""}`}
        style={shake ? { animation: "shake 0.5s cubic-bezier(.36,.07,.19,.97)" } : {}}
      >
        <style>{`
          @keyframes shake {
            10%, 90% { transform: translateX(-2px); }
            20%, 80% { transform: translateX(4px); }
            30%, 50%, 70% { transform: translateX(-6px); }
            40%, 60% { transform: translateX(6px); }
          }
        `}</style>

        <div className="bg-gradient-to-r from-[#0B0A14] to-[#6C3EF5] p-8 text-white text-center">
          <div className="text-4xl mb-2">🌴</div>
          <div className="text-xl font-serif italic font-bold">Sama Senegal</div>
          <div className="text-white/60 text-sm mt-1">Administration</div>
        </div>

        <div className="p-8 space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Email"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${
                error ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-[#6C3EF5]/30"
              }`}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Mot de passe"
              className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${
                error ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-[#6C3EF5]/30"
              }`}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg text-center">
              Identifiants incorrects. Veuillez reessayer.
            </p>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-[#6C3EF5] hover:bg-[#8B5CF6] text-white font-bold rounded-xl transition-colors"
          >
            Se connecter
          </button>

          <button
            onClick={() => setShowAdminLogin(false)}
            className="w-full py-2 text-gray-400 hover:text-gray-600 text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <X className="w-3 h-3" /> Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
