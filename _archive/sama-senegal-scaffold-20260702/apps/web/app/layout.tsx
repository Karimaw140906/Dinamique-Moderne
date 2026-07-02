import type { Metadata } from "next";
import "./globals.css";
import Header from "@ui/components/Header";
import Footer from "@ui/components/Footer";
import BottomNav from "@ui/components/BottomNav";

export const metadata: Metadata = { title: "Sama Senegal", description: "Découvrez et réservez vos séjours au Sénégal" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <div className="min-h-screen pb-16 md:pb-0">{children}</div>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
