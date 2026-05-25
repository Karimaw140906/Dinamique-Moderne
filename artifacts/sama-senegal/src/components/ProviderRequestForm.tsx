import { useState } from "react";
import { X, Upload, Check, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ROLES = [
  { value: "guide", label: "Guide touristique", icon: "🌴" },
  { value: "chauffeur", label: "Chauffeur / Transport", icon: "🚗" },
  { value: "restaurant", label: "Restaurateur", icon: "🍽️" },
  { value: "hotel", label: "Hébergement", icon: "🏨" },
  { value: "activites", label: "Animateur d'activités", icon: "🎯" },
  { value: "autre", label: "Autre", icon: "✨" },
];

const DOCS_BY_ROLE: Record<string, { key: string; label: string; required: boolean }[]> = {
  guide: [
    { key: "id_doc_url", label: "Pièce d'identité recto-verso", required: true },
    { key: "guide_card_url", label: "Carte professionnelle de guide", required: true },
    { key: "diploma_url", label: "Diplômes / Certifications", required: false },
  ],
  chauffeur: [
    { key: "id_doc_url", label: "Pièce d'identité recto-verso", required: true },
    { key: "driving_license_url", label: "Permis de conduire valide", required: true },
    { key: "insurance_url", label: "Assurance véhicule", required: false },
  ],
  restaurant: [
    { key: "id_doc_url", label: "Pièce d'identité recto-verso", required: true },
    { key: "business_license_url", label: "Licence de restauration", required: true },
    { key: "commercial_register_url", label: "Registre de commerce", required: true },
    { key: "sanitary_url", label: "Autorisation sanitaire", required: false },
  ],
  hotel: [
    { key: "id_doc_url", label: "Pièce d'identité recto-verso", required: true },
    { key: "business_license_url", label: "Licence d'exploitation", required: true },
    { key: "commercial_register_url", label: "Registre de commerce", required: true },
    { key: "quality_cert_url", label: "Certifications qualité", required: false },
  ],
  activites: [
    { key: "id_doc_url", label: "Pièce d'identité recto-verso", required: true },
    { key: "activity_license_url", label: "Licence / Autorisation selon activité", required: true },
    { key: "qualification_url", label: "Certificats de qualification", required: false },
  ],
  autre: [
    { key: "id_doc_url", label: "Pièce d'identité recto-verso", required: true },
  ],
};

function getUniqueDocs(roles: string[]) {
  const seen = new Set<string>();
  const result: { key: string; label: string; required: boolean }[] = [];
  for (const role of roles) {
    for (const doc of DOCS_BY_ROLE[role] || []) {
      if (!seen.has(doc.key)) {
        seen.add(doc.key);
        result.push(doc);
      }
    }
  }
  return result;
}

interface Props {
  onClose: () => void;
}

export function ProviderRequestForm({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", whatsapp: "", other_role: "",
    roles: [] as string[],
  });
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const toggleRole = (role: string) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role]
    }));
  };

  const handleFileUpload = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setDocs(d => ({ ...d, [key]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const uniqueDocs = getUniqueDocs(form.roles);
  const requiredDocs = uniqueDocs.filter(d => d.required);
  const optionalDocs = uniqueDocs.filter(d => !d.required);
  const allRequiredFilled = requiredDocs.every(d => docs[d.key]);

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.whatsapp || form.roles.length === 0) {
      setError("Veuillez remplir tous les champs obligatoires et choisir au moins un rôle.");
      return;
    }
    if (!allRequiredFilled) {
      setError("Veuillez fournir tous les documents obligatoires (📌).");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.from("provider_requests").insert({
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp,
        roles: form.roles,
        other_role: form.other_role,
        ...docs,
      });
      if (err) throw err;
      setSuccess(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-3">Demande envoyée !</h2>
          <p className="text-gray-500 mb-6">Votre demande a été transmise à l'équipe Sama Senegal. Vous recevrez une réponse sur votre WhatsApp dans les plus brefs délais.</p>
          <button onClick={onClose} className="w-full py-3 bg-[#2C7A5C] text-white font-bold rounded-xl hover:bg-[#245f49] transition-colors">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C7A5C] to-[#1A1A2E] p-6 text-white flex justify-between items-center">
          <div>
            <div className="text-xl font-bold">🌴 Devenir Prestataire</div>
            <div className="text-white/70 text-sm mt-1">Étape {step}/2 — {step === 1 ? "Informations" : "Documents"}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex h-1">
          <div className={`h-full bg-[#2C7A5C] transition-all duration-300`} style={{ width: `${step === 1 ? 50 : 100}%` }} />
          <div className="flex-1 bg-gray-200" />
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nom complet *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Prénom et Nom"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp dédié * <span className="text-gray-400 font-normal">(recevra les réservations)</span></label>
                <input type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+221 7X XXX XX XX"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@email.com"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Vos activités * <span className="text-gray-400 font-normal">(cochez tout ce que vous faites)</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => toggleRole(r.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${form.roles.includes(r.value) ? "bg-[#2C7A5C] text-white border-[#2C7A5C]" : "bg-white text-gray-600 border-gray-200 hover:border-[#2C7A5C]/30"}`}>
                      <span>{r.icon}</span>
                      <span className="text-xs">{r.label}</span>
                      {form.roles.includes(r.value) && <Check className="w-3 h-3 ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
                {form.roles.includes("autre") && (
                  <input type="text" value={form.other_role} onChange={e => setForm({ ...form, other_role: e.target.value })}
                    placeholder="Précisez votre activité..."
                    className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30" />
                )}
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button
                onClick={() => {
                  if (!form.name || !form.whatsapp || form.roles.length === 0) {
                    setError("Veuillez remplir tous les champs obligatoires et choisir au moins un rôle.");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full py-3 bg-[#D4A017] hover:bg-[#c49015] text-white font-bold rounded-xl transition-colors">
                Continuer →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
                ℹ️ Si vous avez plusieurs rôles, les documents identiques ne sont demandés qu'une seule fois.
              </div>

              {requiredDocs.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-red-500">📌</span> Documents obligatoires
                  </h4>
                  <div className="space-y-3">
                    {requiredDocs.map(doc => (
                      <div key={doc.key}>
                        <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                          📌 {doc.label} <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 flex items-center gap-3">
                          {docs[doc.key] ? (
                            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg flex-1">
                              <Check className="w-4 h-4" /> Document chargé
                            </div>
                          ) : (
                            <label className="flex-1 cursor-pointer">
                              <div className="border-2 border-dashed border-gray-300 hover:border-[#2C7A5C] rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-[#2C7A5C] flex items-center gap-2 transition-colors">
                                <Upload className="w-4 h-4" /> Choisir un fichier
                              </div>
                              <input type="file" className="hidden" accept="image/*,.pdf"
                                onChange={e => e.target.files?.[0] && handleFileUpload(doc.key, e.target.files[0])} />
                            </label>
                          )}
                          {docs[doc.key] && (
                            <button onClick={() => setDocs(d => { const nd = { ...d }; delete nd[doc.key]; return nd; })}
                              className="text-red-400 hover:text-red-600 text-xs">Supprimer</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {optionalDocs.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>⭐</span> Documents appréciés
                    <span className="text-xs text-gray-400 font-normal">(augmentent vos chances de validation)</span>
                  </h4>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 mb-3">
                    💡 Ces documents renforcent votre crédibilité et augmentent vos chances de validation.
                  </div>
                  <div className="space-y-3">
                    {optionalDocs.map(doc => (
                      <div key={doc.key}>
                        <label className="text-xs font-bold text-gray-600">⭐ {doc.label}</label>
                        <div className="mt-1 flex items-center gap-3">
                          {docs[doc.key] ? (
                            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg flex-1">
                              <Check className="w-4 h-4" /> Document chargé
                            </div>
                          ) : (
                            <label className="flex-1 cursor-pointer">
                              <div className="border-2 border-dashed border-gray-200 hover:border-amber-400 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-amber-600 flex items-center gap-2 transition-colors">
                                <Upload className="w-4 h-4" /> Choisir un fichier (optionnel)
                              </div>
                              <input type="file" className="hidden" accept="image/*,.pdf"
                                onChange={e => e.target.files?.[0] && handleFileUpload(doc.key, e.target.files[0])} />
                            </label>
                          )}
                          {docs[doc.key] && (
                            <button onClick={() => setDocs(d => { const nd = { ...d }; delete nd[doc.key]; return nd; })}
                              className="text-red-400 hover:text-red-600 text-xs">Supprimer</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => { setStep(1); setError(""); }}
                  className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                  ← Retour
                </button>
                <button onClick={handleSubmit} disabled={loading || !allRequiredFilled}
                  className="flex-1 py-3 bg-[#2C7A5C] hover:bg-[#245f49] disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                  {loading ? "Envoi en cours..." : "Soumettre ma demande"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
