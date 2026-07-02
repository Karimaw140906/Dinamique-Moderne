"use client";

import { createContext, useContext, ReactNode } from "react";
import { useScroll, MotionValue } from "framer-motion";

const ParallaxContext = createContext<MotionValue<number> | null>(null);

export function ParallaxProvider({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();

  return (
    <ParallaxContext.Provider value={scrollY}>
      {children}
    </ParallaxContext.Provider>
  );
}

export function useScrollY() {
  const ctx = useContext(ParallaxContext);
  if (!ctx) {
    throw new Error("useScrollY must be used within a ParallaxProvider");
  }
  return ctx;
}
