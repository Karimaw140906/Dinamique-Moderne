import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sama Senegal",
  description: "Découvrez et réservez vos séjours au Sénégal"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
