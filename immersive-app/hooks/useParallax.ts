"use client";

import { useTransform, MotionValue } from "framer-motion";

/**
 * Transforme le scroll global en offset de translation.
 * speed négatif  -> effet "background" (plus lent, va vers le haut relativement)
 * speed positif  -> effet "foreground" (plus rapide, va vers le bas)
 */
export function useParallax(scrollY: MotionValue<number>, speed: number) {
  return useTransform(scrollY, (value) => value * speed);
}
