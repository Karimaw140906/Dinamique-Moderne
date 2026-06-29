import { useState } from "react";
import { useTwoFactor } from "@/lib/useTwoFactor";

interface Props {
  clientId: string;
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorVerify({ clientId, email, onSuccess, onCancel }: Props) {
  const { verifyCode, sendCode, loading, error, setError } = useTwoFactor();
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSend = async () => {
    setResending(true);
    await sendCode(clientId, email);
    setSent(true);
    setResending(false);
  };

  const handleVerify = async () => {
    if (code.length !== 6) { setError("Entrez les 6 chiffres."); return; }
    const ok = await verifyCode(clientId, code);
    if (ok) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#F5F0E8] rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#2C7A5C] flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1A1A2E]">Vérification 2FA</h2>
          <p className="text-sm text-gray-500 mt-1">
            {sent ? `Code envoyé à ${email}` : "Confirmez votre identité"}
          </p>
        </div>

        {!sent ? (
          <button
            onClick={handleSend}
            disabled={resending}
            className="w-full py-3 rounded-xl bg-[#2C7A5C] text-white font-semibold hover:bg-[#235f47] transition disabled:opacity-50"
          >
            {resending ? "Envoi..." : "Recevoir le code par email"}
          </button>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1A1A2E] mb-2">Code à 6 chiffres</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(null); }}
                placeholder="000000"
                className="w-full text-center text-2xl tracking-widest border-2 border-[#2C7A5C] rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full py-3 rounded-xl bg-[#2C7A5C] text-white font-semibold hover:bg-[#235f47] transition disabled:opacity-50 mb-3"
            >
              {loading ? "Vérification..." : "Confirmer"}
            </button>

            <button
              onClick={handleSend}
              disabled={resending}
              className="w-full py-2 text-sm text-[#2C7A5C] underline disabled:opacity-50"
            >
              {resending ? "Envoi..." : "Renvoyer le code"}
            </button>
          </>
        )}

        <button onClick={onCancel} className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600">
          Annuler
        </button>
      </div>
    </div>
  );
}
