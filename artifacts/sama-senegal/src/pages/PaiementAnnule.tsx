export default function PaiementAnnule() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");

  return (
    <div className="min-h-screen bg-[#2B1B4D] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">❌</span>
        </div>
        <h2 className="text-xl font-bold text-[#0B0A14] mb-2">Paiement annulé</h2>
        {ref && <p className="text-gray-500 text-sm mb-2">Réf : <span className="font-mono font-bold">{ref}</span></p>}
        <p className="text-gray-400 text-xs mb-6">Votre réservation est conservée. Vous pouvez réessayer à tout moment.</p>
        <a href="/" className="block w-full py-3 bg-[#0B0A14] text-white rounded-xl font-bold hover:bg-[#6C3EF5] transition">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
