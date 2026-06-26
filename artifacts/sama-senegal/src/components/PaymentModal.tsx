import { useState } from "react";
import { X, Check, Loader2 } from "lucide-react";

interface PaymentModalProps {
  booking: any;
  onClose: () => void;
}

const METHODS = [
  {
    id: "orange_money",
    label: "Orange Money",
    icon: "🟠",
    color: "bg-orange-500 hover:bg-orange-600",
    badge: "bg-orange-100 text-orange-700",
    placeholder: "77 XXX XX XX",
    prefix: "+221",
  },
  {
    id: "wave",
    label: "Wave",
    icon: "🌊",
    color: "bg-blue-500 hover:bg-blue-600",
    badge: "bg-blue-100 text-blue-700",
    placeholder: "77 XXX XX XX",
    prefix: "+221",
  },
  {
    id: "carte",
    label: "Carte bancaire",
    icon: "💳",
    color: "bg-[#1A1A2E] hover:bg-[#2C7A5C]",
    badge: "bg-gray-100 text-gray-700",
    placeholder: null,
    prefix: null,
  },
];

function savePayment(payment: any) {
  try {
    const payments = JSON.parse(localStorage.getItem("payments") || "[]");
    payments.unshift(payment);
    localStorage.setItem("payments", JSON.stringify(payments));
    window.dispatchEvent(new Event("paymentsUpdated"));

    // Mettre à jour le statut de la réservation → "confirmed"
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const updated = bookings.map((b: any) =>
      (b.ref === payment.booking_ref) ? { ...b, status: "confirmed", paid: true, payment_id: payment.transaction_id } : b
    );
    localStorage.setItem("bookings", JSON.stringify(updated));
    window.dispatchEvent(new Event("bookingsUpdated"));
  } catch { }
}

function sendPaymentWhatsApp(booking: any, method: string, txId: string, amount: number) {
  const num = "221774188107";
  const methodLabel = method === "orange_money" ? "Orange Money" : method === "wave" ? "Wave" : "Carte bancaire";
  const msg = encodeURIComponent(
    `💳 *PAIEMENT REÇU — Sama Senegal*\n\n` +
    `📋 Réf : ${booking.ref}\n` +
    `👤 Client : ${booking.name || booking.client_name || "—"}\n` +
    `💰 Montant : ${amount.toLocaleString("fr-FR")} FCFA\n` +
    `📱 Méthode : ${methodLabel}\n` +
    `🔑 ID Transaction : ${txId}\n\n` +
    `_Paiement en attente de validation_`
  );
  window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
}

export function PaymentModal({ booking, onClose }: PaymentModalProps) {
  const [step, setStep] = useState<"choose" | "confirm" | "success">("choose");
  const [method, setMethod] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState("");

  const amount = booking.amount || (booking.people || 1) * 15000;
  const selectedMethod = METHODS.find(m => m.id === method);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // simulation traitement

    const generatedTx = `TX-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    savePayment({
      booking_ref: booking.ref,
      amount,
      method: method!,
      status: "pending",
      phone: phone || null,
      transaction_id: generatedTx,
      created_at: new Date().toISOString(),
    });

    sendPaymentWhatsApp(booking, method!, generatedTx, amount);

    setTxId(generatedTx);
    setStep("success");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A1A2E] to-[#2C7A5C] p-5 text-white flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">
              {step === "success" ? "✅ Paiement initié" : "💳 Payer ma réservation"}
            </div>
            <div className="text-white/60 text-xs mt-0.5">Réf : {booking.ref}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">

          {/* Montant */}
          <div className="bg-[#F5F0E8] rounded-xl p-4 flex justify-between items-center mb-6">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Montant total</div>
              <div className="text-2xl font-bold text-[#1A1A2E]">{amount.toLocaleString("fr-FR")} FCFA</div>
            </div>
            <div className="text-xs text-gray-400 text-right">
              {booking.people || 1} pers.<br />
              {booking.date || "Date non spécifiée"}
            </div>
          </div>

          {/* ÉTAPE 1 — Choisir méthode */}
          {step === "choose" && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-[#1A1A2E] mb-4">Choisissez votre méthode de paiement :</p>
              {METHODS.map(m => (
                <button key={m.id} onClick={() => { setMethod(m.id); setStep("confirm"); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:border-[#2C7A5C] hover:bg-[#2C7A5C]/5 border-gray-100">
                  <span className="text-2xl">{m.icon}</span>
                  <div className="text-left">
                    <div className="font-bold text-[#1A1A2E]">{m.label}</div>
                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 ${m.badge}`}>
                      {m.id === "carte" ? "Visa · Mastercard" : "Paiement mobile Sénégal"}
                    </div>
                  </div>
                  <span className="ml-auto text-gray-300 text-lg">›</span>
                </button>
              ))}
              <p className="text-center text-xs text-gray-400 mt-4">🔒 Transactions sécurisées</p>
            </div>
          )}

          {/* ÉTAPE 2 — Saisir infos */}
          {step === "confirm" && selectedMethod && (
            <div className="space-y-4">
              <button onClick={() => setStep("choose")} className="text-xs text-[#2C7A5C] font-bold flex items-center gap-1 mb-2 hover:underline">
                ← Changer de méthode
              </button>

              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-4">
                <span className="text-2xl">{selectedMethod.icon}</span>
                <span className="font-bold text-[#1A1A2E]">{selectedMethod.label}</span>
              </div>

              {selectedMethod.id !== "carte" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Numéro de téléphone *</label>
                  <div className="flex gap-2">
                    <div className="bg-gray-100 rounded-lg px-3 flex items-center text-sm font-bold text-gray-600 shrink-0">
                      {selectedMethod.prefix}
                    </div>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                      placeholder={selectedMethod.placeholder || ""}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {selectedMethod.id === "orange_money"
                      ? "Vous recevrez une demande de paiement sur votre Orange Money."
                      : "Vous recevrez une notification Wave pour confirmer."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Numéro de carte *</label>
                    <input
                      value={cardNumber.replace(/(.{4})/g, "$1 ").trim()}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C] font-mono tracking-widest"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Expiration *</label>
                      <input
                        value={cardExpiry.length >= 3 ? `${cardExpiry.slice(0, 2)}/${cardExpiry.slice(2)}` : cardExpiry}
                        onChange={e => setCardExpiry(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="MM/AA"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C] font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">CVV *</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        placeholder="•••"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C] font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={loading ||
                  (selectedMethod.id !== "carte" && phone.length < 9) ||
                  (selectedMethod.id === "carte" && (cardNumber.length < 16 || cardExpiry.length < 4 || cardCvv.length < 3))
                }
                className={`w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${selectedMethod.color}`}>
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours...</>
                  : <>Payer {amount.toLocaleString("fr-FR")} FCFA</>
                }
              </button>

              <p className="text-center text-xs text-gray-400">🔒 Paiement sécurisé — vos données sont protégées</p>
            </div>
          )}

          {/* ÉTAPE 3 — Succès */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-[#1A1A2E] text-lg">Demande de paiement envoyée !</p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedMethod?.id !== "carte"
                    ? `Confirmez le paiement sur votre ${selectedMethod?.label}.`
                    : "Votre paiement est en cours de traitement."}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl px-6 py-3 w-full text-left">
                <div className="text-xs text-gray-400 mb-1">ID Transaction</div>
                <div className="font-mono font-bold text-[#2C7A5C] text-sm break-all">{txId}</div>
              </div>
              <p className="text-xs text-gray-400">
                Conservez cet ID pour tout litige.<br />Notre équipe validera le paiement sous 24h.
              </p>
              <button onClick={onClose}
                className="w-full py-2.5 bg-[#1A1A2E] hover:bg-[#2C7A5C] text-white rounded-xl font-bold text-sm transition-colors">
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
