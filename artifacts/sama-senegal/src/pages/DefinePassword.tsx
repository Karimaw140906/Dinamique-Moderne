import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function DefinePassword() {
  const [, setLocation] = useLocation();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
      if (!data.session) setError("Lien invalide ou expiré. Demandez à l'administrateur de renvoyer une invitation.");
    });
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    setDone(true);
    setTimeout(() => setLocation("/"), 2000);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2B1B4D] px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-[#0B0A14] mb-3">Mot de passe défini !</h1>
          <p className="text-gray-500">Redirection vers l'accueil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2B1B4D] px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-[#0B0A14]">Définir votre mot de passe</h1>
        <p className="text-gray-500 text-sm">Choisissez un mot de passe pour accéder à votre espace prestataire Sama Sénégal.</p>
        {!ready && !error && <p className="text-sm text-gray-400">Vérification du lien...</p>}
        {ready && (
          <>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nouveau mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Confirmer</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3 bg-[#6C3EF5] hover:bg-[#8B5CF6] disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
              {loading ? "Enregistrement..." : "Valider"}
            </button>
          </>
        )}
        {!ready && error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      </div>
    </div>
  );
}
