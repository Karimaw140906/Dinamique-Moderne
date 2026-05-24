export interface BookingData {
  name: string;
  phone: string;
  email: string;
  people: string;
  date: string;
  time: string;
  services: string[];
  extra: string;
  ref: string;
}

export function generateBookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "SS-";
  for (let i = 0; i < 8; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export async function generateBookingPDF(data: BookingData): Promise<void> {
  const qrData = encodeURIComponent(`Sama Senegal | Ref: ${data.ref} | ${data.name} | ${data.date}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

  // Charger le QR code
  const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = qrUrl;
  });

  // Canvas A4 (794 x 1123 px @ 96dpi)
  const canvas = document.createElement("canvas");
  canvas.width = 794;
  canvas.height = 1123;
  const ctx = canvas.getContext("2d")!;

  // Fond blanc
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header vert
  ctx.fillStyle = "#1A1A2E";
  ctx.fillRect(0, 0, canvas.width, 140);

  // Titre
  ctx.fillStyle = "#D4A017";
  ctx.font = "bold 32px Georgia, serif";
  ctx.fillText("🌴 Sama Senegal", 40, 60);
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Arial, sans-serif";
  ctx.fillText("Confirmation de réservation", 40, 90);
  ctx.fillStyle = "#2C7A5C";
  ctx.font = "bold 14px Arial, sans-serif";
  ctx.fillText(`Réf: ${data.ref}`, 40, 120);

  // QR code (coin haut droit)
  ctx.drawImage(qrImg, canvas.width - 180, 10, 150, 150);

  // Ligne séparatrice
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 160);
  ctx.lineTo(canvas.width - 40, 160);
  ctx.stroke();

  // Infos client
  ctx.fillStyle = "#1A1A2E";
  ctx.font = "bold 18px Arial, sans-serif";
  ctx.fillText("Informations client", 40, 200);

  const infos = [
    ["Nom", data.name],
    ["Téléphone", data.phone],
    ["Email", data.email || "Non fourni"],
    ["Personnes", data.people],
    ["Date", data.date || "Non spécifiée"],
    ["Heure", data.time || "Non spécifiée"],
  ];

  ctx.font = "14px Arial, sans-serif";
  infos.forEach(([label, value], i) => {
    const y = 230 + i * 32;
    // Fond alterné
    if (i % 2 === 0) {
      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(40, y - 16, canvas.width - 80, 28);
    }
    ctx.fillStyle = "#6b7280";
    ctx.fillText(label + " :", 55, y);
    ctx.fillStyle = "#1A1A2E";
    ctx.font = "bold 14px Arial, sans-serif";
    ctx.fillText(value, 200, y);
    ctx.font = "14px Arial, sans-serif";
  });

  // Services
  const servicesY = 230 + infos.length * 32 + 30;
  ctx.fillStyle = "#1A1A2E";
  ctx.font = "bold 18px Arial, sans-serif";
  ctx.fillText("Services sélectionnés", 40, servicesY);

  ctx.font = "14px Arial, sans-serif";
  data.services.forEach((s, i) => {
    const y = servicesY + 30 + i * 28;
    ctx.fillStyle = "#2C7A5C";
    ctx.fillText("✓", 55, y);
    ctx.fillStyle = "#1A1A2E";
    ctx.fillText(s, 80, y);
  });

  // Demande spéciale
  if (data.extra) {
    const extraY = servicesY + 30 + data.services.length * 28 + 30;
    ctx.fillStyle = "#1A1A2E";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText("Demande spéciale", 40, extraY);
    ctx.font = "14px Arial, sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText(data.extra, 40, extraY + 28);
  }

  // Footer
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
  ctx.fillStyle = "#6b7280";
  ctx.font = "12px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Sama Senegal — sama-senegal.vercel.app — WhatsApp: +221 77 418 81 07", canvas.width / 2, canvas.height - 45);
  ctx.fillText(`Document généré le ${new Date().toLocaleDateString("fr-FR")} — Réf: ${data.ref}`, canvas.width / 2, canvas.height - 20);

  // Télécharger
  const link = document.createElement("a");
  link.download = `confirmation-${data.ref}.pdf`;
  canvas.toBlob((blob) => {
    if (blob) {
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  }, "image/png");
}
