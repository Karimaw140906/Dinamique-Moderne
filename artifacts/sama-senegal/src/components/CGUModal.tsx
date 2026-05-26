import { useState } from "react";
import { X, Check } from "lucide-react";

interface CGUModalProps {
  type: "client" | "provider";
  onAccept: () => void;
  onClose: () => void;
}

const CGU_CLIENT = `CONDITIONS GÉNÉRALES D'UTILISATION — CLIENTS

Article 1 — Objet
Les présentes CGU définissent les règles d'accès et d'utilisation de la plateforme Sama Senegal. En s'inscrivant, le client reconnaît avoir lu et accepté sans réserve l'intégralité des présentes conditions.

Article 2 — Inscription
- L'accès nécessite la création d'un compte personnel avec des informations exactes et à jour.
- Le client est seul responsable de la confidentialité de ses identifiants.
- Le client doit être âgé d'au moins 18 ans.

Article 3 — Utilisation
Il est strictement interdit de :
- Utiliser la plateforme à des fins frauduleuses ou illégales
- Fournir de fausses informations lors de l'inscription ou d'une réservation
- Contourner le système de paiement ou de réservation
- Contacter directement un prestataire en dehors de la plateforme
- Créer plusieurs comptes pour un même utilisateur

Article 4 — Réservations
- Toute réservation constitue un engagement ferme envers le prestataire.
- Le client reçoit un PDF de confirmation avec QR code unique.
- Le client s'engage à se présenter aux rendez-vous confirmés.
- En cas d'absence non justifiée, les pénalités d'annulation s'appliquent.

Article 5 — Paiement
- Les paiements sont sécurisés.
- Toute tentative de paiement frauduleux entraîne la suspension immédiate du compte.

Article 6 — Annulation
- Annulation dans le délai autorisé : remboursement intégral.
- Annulation hors délai : aucun remboursement sauf force majeure.
- Non-présentation sans annulation : aucun remboursement.

Article 7 — Avis
- Le client s'engage à laisser des avis honnêtes basés sur son expérience réelle.
- Les faux avis sont interdits et entraînent le bannissement.

Article 8 — Sanctions
- Tout manquement peut entraîner : avertissement, suspension, ou bannissement définitif.
- Motifs de bannissement immédiat : fraude, contournement du paiement, faux avis, comportement abusif, usurpation d'identité.

Article 9 — Données personnelles
- Les données sont utilisées uniquement pour la fourniture des services.
- Les données ne sont jamais vendues à des tiers.
- Le client dispose d'un droit d'accès, modification et suppression.

Article 10 — Droit applicable
Les présentes conditions sont régies par le droit sénégalais.`;

const CGP_PROVIDER = `CONDITIONS GÉNÉRALES PRESTATAIRES

Article 1 — Objet
Les présentes CGP définissent les obligations de tout prestataire souhaitant proposer ses services sur Sama Senegal.

Article 2 — Demande d'accès
- Tout prestataire doit soumettre une demande complète avec les documents obligatoires.
- La validation est effectuée manuellement par l'administration.
- Aucun accès avant validation.

Article 3 — Obligations générales
Le prestataire s'engage à :
- Fournir des informations exactes sur ses services
- Maintenir la qualité des services décrits
- Répondre aux réservations dans les 24 heures
- Respecter scrupuleusement les réservations confirmées
- Traiter chaque client avec respect et professionnalisme
- Maintenir à jour son calendrier de disponibilités
- Ne jamais contacter un client en dehors de la plateforme avant confirmation
- Ne jamais demander un paiement direct en dehors du système

Article 4 — Commissions
- Le prestataire accepte le système de commission défini par l'administration.
- Tout contournement du système de commission entraîne un bannissement immédiat et des poursuites.

Article 5 — Système QR code
- Le prestataire s'engage à scanner le QR code du client pour valider chaque prise en charge.
- Toute validation frauduleuse entraîne un bannissement immédiat.

Article 6 — Documents
- Le prestataire doit maintenir ses documents professionnels en cours de validité.
- Le compte est suspendu automatiquement si les documents expirent sans renouvellement.

Article 7 — Confidentialité
- Les données clients sont strictement confidentielles.
- Partager les coordonnées clients avec des tiers est interdit sous peine de bannissement.

Article 8 — Sanctions
Motifs de bannissement immédiat :
- Contournement du système de commission
- Validation frauduleuse de prestation
- Faux documents
- Non-respect grave des réservations
- Comportement abusif envers un client
- Partage non autorisé de données clients

Article 9 — Droit applicable
Les présentes conditions sont régies par le droit sénégalais.`;

export function CGUModal({ type, onAccept, onClose }: CGUModalProps) {
  const [accepted, setAccepted] = useState(false);
  const isClient = type === "client";
  const title = isClient ? "Conditions Générales d'Utilisation" : "Conditions Générales Prestataires";
  const content = isClient ? CGU_CLIENT : CGP_PROVIDER;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#2C7A5C] to-[#1A1A2E] p-5 text-white flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">📜 {title}</div>
            <div className="text-white/70 text-xs mt-0.5">Sama Senegal — Veuillez lire attentivement</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-6">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{content}</pre>
        </div>

        <div className="p-5 border-t border-gray-100 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-[#2C7A5C] shrink-0" />
            <span className="text-sm text-gray-700">
              J'ai lu et j'accepte sans réserve l'intégralité des présentes {title}.
              <span className="text-gray-400 text-xs block mt-0.5">
                Date et heure d'acceptation enregistrées automatiquement : {new Date().toLocaleString("fr-FR")}
              </span>
            </span>
          </label>
          <button onClick={onAccept} disabled={!accepted}
            className="w-full py-3 bg-[#2C7A5C] hover:bg-[#245f49] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Confirmer et continuer
          </button>
        </div>
      </div>
    </div>
  );
}
