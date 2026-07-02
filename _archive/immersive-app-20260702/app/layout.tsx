import type { Metadata } from "next";
import "./globals.css";
import { ImmersiveLayout } from "@/components/layout/ImmersiveLayout";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";

export const metadata: Metadata = {
  title: "Immersive App",
  description: "Experience immersive avec moteur de parallaxe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <ImmersiveLayout>
          <Navbar />
          <PageTransition>{children}</PageTransition>
        </ImmersiveLayout>
      </body>
    </html>
  );
}
