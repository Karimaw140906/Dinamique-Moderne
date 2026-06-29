import { useState } from "react";
import { supabase } from "@/lib/supabase";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function useTwoFactor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async (clientId: string, email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      await supabase.from("two_factor_codes")
        .delete()
        .eq("client_id", clientId)
        .eq("used", false);

      const { error: insertError } = await supabase.from("two_factor_codes").insert({
        client_id: clientId,
        code,
        expires_at: expiresAt,
        used: false,
      });

      if (insertError) throw insertError;

      const { error: emailError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          data: { custom_code: code },
        },
      });

      // fallback : stocker le code en session pour affichage dev
      sessionStorage.setItem("sama_2fa_code", code);
      sessionStorage.setItem("sama_2fa_client", clientId);

      return true;
    } catch (e: any) {
      setError("Erreur lors de l'envoi du code.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (clientId: string, inputCode: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("two_factor_codes")
        .select("*")
        .eq("client_id", clientId)
        .eq("code", inputCode)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !data) {
        // fallback dev : vérifier sessionStorage
        const stored = sessionStorage.getItem("sama_2fa_code");
        const storedClient = sessionStorage.getItem("sama_2fa_client");
        if (stored === inputCode && storedClient === clientId) {
          sessionStorage.removeItem("sama_2fa_code");
          sessionStorage.removeItem("sama_2fa_client");
          return true;
        }
        setError("Code incorrect ou expiré.");
        return false;
      }

      await supabase.from("two_factor_codes").update({ used: true }).eq("id", data.id);
      sessionStorage.removeItem("sama_2fa_code");
      sessionStorage.removeItem("sama_2fa_client");
      return true;
    } catch {
      setError("Erreur de vérification.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleTwoFactor = async (clientId: string, enabled: boolean): Promise<boolean> => {
    const { error } = await supabase
      .from("clients")
      .update({ two_factor_enabled: enabled })
      .eq("id", clientId);
    return !error;
  };

  const isTwoFactorEnabled = async (clientId: string): Promise<boolean> => {
    const { data } = await supabase
      .from("clients")
      .select("two_factor_enabled")
      .eq("id", clientId)
      .single();
    return data?.two_factor_enabled ?? false;
  };

  return { sendCode, verifyCode, toggleTwoFactor, isTwoFactorEnabled, loading, error, setError };
}
