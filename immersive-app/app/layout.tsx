import type { Metadata } from "next";
import "./globals.css";
import { ImmersiveLayout } from "@/components/layout/ImmersiveLayout";

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
        <ImmersiveLayout>{children}</ImmersiveLayout>
      </body>
    </html>
  );
}
