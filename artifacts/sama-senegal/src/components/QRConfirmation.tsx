import { useEffect, useRef } from "react";

interface QRConfirmationProps {
  reservation: {
    ref: string;
    client_name: string;
    client_phone?: string;
    service_type: string;
    service_name: string;
    date?: string;
    time?: string;
    people?: number;
    extra?: string;
    status: string;
  };
  onClose: () => void;
}

const SERVICE_CONFIG: Record<string, {
  icon: string; color: string; mention: string; bg: string;
}> = {
  restaurant: { icon: "🍽️", color: "#C2622D", mention: "À présenter à l'accueil", bg: "#FFF5F0" },
  hotel: { icon: "🏨", color: "#0B0A14", mention: "À présenter à la réception", bg: "#F0F0FF" },
  transport: { icon: "🚗", color: "#6C3EF5", mention: "À présenter au chauffeur", bg: "#F0FFF8" },
  tours: { icon: "🗺️", color: "#F5B942", mention: "À présenter au guide", bg: "#FFFBF0" },
  activites: { icon: "🎯", color: "#9333EA", mention: "À présenter à l'animateur", bg: "#FDF0FF" },
  commande: { icon: "🛍️", color: "#0EA5E9", mention: "À scanner à la livraison", bg: "#F0F9FF" },
};

export function printQRConfirmation(reservation: QRConfirmationProps["reservation"]) {
  const config = SERVICE_CONFIG[reservation.service_type] || SERVICE_CONFIG.tours;
  const qrData = encodeURIComponent(JSON.stringify({
    ref: reservation.ref,
    service: reservation.service_name,
    client: reservation.client_name,
    date: reservation.date,
    status: reservation.status,
  }));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}&color=${config.color.replace("#", "")}`;

  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <title>Confirmation ${reservation.ref}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f8f8; padding: 30px; color: #0B0A14; }
    .card { background: white; border-radius: 20px; overflow: hidden; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, ${config.color}, #0B0A14); padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; }
    .logo { color: white; }
    .logo-title { font-size: 22px; font-weight: 900; letter-spacing: 2px; }
    .logo-title span { color: #F5B942; }
    .logo-sub { font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 3px; }
    .ref-badge { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .service-bar { background: ${config.bg}; border-bottom: 3px solid ${config.color}; padding: 16px 32px; display: flex; align-items: center; gap-12px; }
    .service-icon { font-size: 28px; margin-right: 12px; }
    .service-name { font-size: 18px; font-weight: 800; color: ${config.color}; }
    .service-type { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .body { display: flex; gap: 24px; padding: 28px 32px; }
    .infos { flex: 1; }
    .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: ${config.color}; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid ${config.bg}; }
    .row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .row .lbl { color: #888; }
    .row .val { font-weight: 600; text-align: right; max-width: 60%; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 14px; }
    .confirmed { background: #dcfce7; color: #16a34a; }
    .pending { background: #fef9c3; color: #ca8a04; }
    .qr-block { text-align: center; flex-shrink: 0; }
    .qr-block img { border: 3px solid ${config.color}; border-radius: 12px; }
    .qr-mention { font-size: 10px; color: #888; margin-top: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { background: #f8f8f8; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; }
    .footer-left { font-size: 11px; color: #aaa; }
    .footer-right { font-size: 11px; color: #aaa; text-align: right; }
    @media print { body { padding: 0; background: white; } .card { box-shadow: none; border-radius: 0; } button { display: none; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">
        <div class="logo-title">SAMA <span>SÉNÉGAL</span></div>
        <div class="logo-sub">Confirmation de réservation</div>
      </div>
      <div class="ref-badge">N° ${reservation.ref}</div>
    </div>

    <div class="service-bar">
      <span class="service-icon">${config.icon}</span>
      <div>
        <div class="service-name">${reservation.service_name}</div>
        <div class="service-type">${reservation.service_type}</div>
      </div>
    </div>

    <div class="body">
      <div class="infos">
        <div class="section-title">Client</div>
        <div class="row"><span class="lbl">Nom</span><span class="val">${reservation.client_name}</span></div>
        ${reservation.client_phone ? `<div class="row"><span class="lbl">Téléphone</span><span class="val">${reservation.client_phone}</span></div>` : ""}

        <br/>
        <div class="section-title">Réservation</div>
        ${reservation.date ? `<div class="row"><span class="lbl">Date</span><span class="val">${reservation.date}</span></div>` : ""}
        ${reservation.time ? `<div class="row"><span class="lbl">Heure</span><span class="val">${reservation.time}</span></div>` : ""}
        <div class="row"><span class="lbl">Personnes</span><span class="val">${reservation.people || 1}</span></div>
        ${reservation.extra ? `<div class="row"><span class="lbl">Note</span><span class="val">${reservation.extra}</span></div>` : ""}

        <div>
          <span class="status-badge ${reservation.status === "confirmed" ? "confirmed" : "pending"}">
            ${reservation.status === "confirmed" ? "✅ Confirmée" : "⏳ En attente"}
          </span>
        </div>
      </div>

      <div class="qr-block">
        <img src="${qrUrl}" width="160" height="160" alt="QR Code"/>
        <div class="qr-mention">${config.mention}</div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-left">Sama Sénégal · +221 77 418 81 07</div>
      <div class="footer-right">Généré le ${new Date().toLocaleDateString("fr-FR")}</div>
    </div>
  </div>
  <script>window.onload = () => setTimeout(() => window.print(), 500);</script>
</body>
</html>`);
  win.document.close();
}

export function QRConfirmation({ reservation, onClose }: QRConfirmationProps) {
  const config = SERVICE_CONFIG[reservation.service_type] || SERVICE_CONFIG.tours;
  const qrData = encodeURIComponent(JSON.stringify({
    ref: reservation.ref,
    service: reservation.service_name,
    client: reservation.client_name,
    date: reservation.date,
  }));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 text-center" style={{ background: config.bg }}>
          <div className="text-4xl mb-2">{config.icon}</div>
          <h2 className="text-xl font-bold" style={{ color: config.color }}>Réservation confirmée</h2>
          <p className="text-gray-500 text-sm mt-1">N° {reservation.ref}</p>
        </div>
        <div className="p-6 flex flex-col items-center gap-4">
          <img src={qrUrl} alt="QR Code" className="w-48 h-48 rounded-xl border-4" style={{ borderColor: config.color }} />
          <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">{config.mention}</p>
          <div className="w-full bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-400">Service</span><span className="font-bold">{reservation.service_name}</span></div>
            {reservation.date && <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="font-bold">{reservation.date}</span></div>}
            {reservation.time && <div className="flex justify-between"><span className="text-gray-400">Heure</span><span className="font-bold">{reservation.time}</span></div>}
            <div className="flex justify-between"><span className="text-gray-400">Personnes</span><span className="font-bold">{reservation.people || 1}</span></div>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => printQRConfirmation(reservation)}
              className="flex-1 py-3 font-bold rounded-xl text-white transition-colors" style={{ background: config.color }}>
              📄 Télécharger PDF
            </button>
            <button onClick={onClose} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
