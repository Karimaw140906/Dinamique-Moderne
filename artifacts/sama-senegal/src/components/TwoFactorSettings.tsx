import { useState, useEffect } from "react";
import { useTwoFactor } from "@/lib/useTwoFactor";
import { TwoFactorVerify } from "@/components/TwoFactorVerify";

interface Props {
  clientId: string;
  email: string;
}

export function TwoFactorSettings({ clientId, email }: Props) {
  const { toggleTwoFactor, isTwoFactorEnabled, sendCode, loading } = useTwoFactor();
  const [enabled, setEnabled] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    isTwoFactorEnabled(clientId).then(setEnabled);
  }, [clientId]);

  const handleToggle = async () => {
    if (!enabled) {
      await sendCode(clientId, email);
      setShowVerify(true);
    } else {
      setSaving(true);
      await toggleTwoFactor(clientId, false);
      setEnabled(false);
      setSuccess("Double authentification désactivée.");
      setSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleVerifySuccess = async () => {
    setShowVerify(false);
    setSaving(true);
    await toggleTwoFactor(clientId, true);
    setEnabled(true);
    setSuccess("Double authentification activée avec succès !");
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <>
      {showVerify && (
        <TwoFactorVerify
          clientId={clientId}
          email={email}
          onSuccess={handleVerifySuccess}
          onCancel={() => setShowVerify(false)}
        />
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6C3EF5]/10 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C3EF5" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[#0B0A14]">Double authentification</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {enabled
                  ? "Votre compte est protégé par un code email à chaque connexion."
                  : "Ajoutez une couche de sécurité supplémentaire à votre compte."}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={saving || loading}
            className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50 ${enabled ? "bg-[#6C3EF5]" : "bg-gray-300"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${enabled ? "translate-x-7" : "translate-x-1"}`} />
          </button>
        </div>

        {success && (
          <div className="mt-4 p-3 rounded-xl bg-[#6C3EF5]/10 text-[#6C3EF5] text-sm font-medium text-center">
            {success}
          </div>
        )}

        <div className="mt-4 p-3 rounded-xl bg-[#F5B942]/10 text-[#0B0A14] text-xs">
          <span className="font-semibold text-[#F5B942]">ℹ️ </span>
          Un code à 6 chiffres sera envoyé à <strong>{email}</strong> à chaque connexion.
        </div>
      </div>
    </>
  );
}
