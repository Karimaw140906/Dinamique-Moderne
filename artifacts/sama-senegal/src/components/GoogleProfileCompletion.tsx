import { useState } from "react";
import { X, MessageCircle, Globe } from "lucide-react";

interface GoogleProfileCompletionProps {
  profile: { email: string; suggestedFirstName: string; suggestedLastName: string };
  onSubmit: (data: { whatsapp: string; nationality: string; language: string }) => Promise<boolean>;
  onCancel: () => void;
}

export function GoogleProfileCompletion({ profile, onSubmit, onCancel }: GoogleProfileCompletionProps) {
  const [whatsapp, setWhatsapp] = useState("");
  const [nationality, setNationality] = useState("");
  const [language, setLanguage] = useState("FR");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!whatsapp || !nationality) {
      setError("Merci de renseigner votre WhatsApp et votre nationalité.");
      return;
    }
    setLoading(true);
    const ok = await onSubmit({ whatsapp, nationality, language });
    setLoading(false);
    if (!ok) setError("Une erreur est survenue, réessayez.");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#6C3EF5] to-[#0B0A14] p-6 text-white flex justify-between items-center">
          <div>
            <div className="text-2xl font-serif italic font-bold">🌴 Sama Senegal</div>
            <div className="text-white/70 text-sm mt-1">Plus qu'une étape</div>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Bienvenue {profile.suggestedFirstName || profile.email} ! Complète ton profil pour finaliser la création de ton compte.
          </p>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="WhatsApp (obligatoire)"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
          </div>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)}
              placeholder="Nationalité"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0B0A14] focus:outline-none bg-white focus:ring-2 focus:ring-[#6C3EF5]/30">
            <option value="FR">🇫🇷 Français</option>
            <option value="EN">🇬🇧 English</option>
            <option value="ES">🇪🇸 Español</option>
          </select>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 bg-[#F5B942] hover:bg-[#c49015] text-white font-bold rounded-xl transition-colors disabled:opacity-60">
            {loading ? "..." : "Terminer mon inscription"}
          </button>
        </div>
      </div>
    </div>
  );
}
