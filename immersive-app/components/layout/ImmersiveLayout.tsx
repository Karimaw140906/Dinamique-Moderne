"use client";

import { ReactNode } from "react";
import { ParallaxProvider } from "@/components/parallax/ParallaxProvider";

export function ImmersiveLayout({ children }: { children: ReactNode }) {
  return (
    <ParallaxProvider>
      <div className="relative min-h-screen w-full overflow-x-hidden bg-bg-base text-text-primary">
        {children}
      </div>
    </ParallaxProvider>
  );
}
