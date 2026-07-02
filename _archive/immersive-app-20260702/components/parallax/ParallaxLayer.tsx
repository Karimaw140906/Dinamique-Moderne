"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useScrollY } from "./ParallaxProvider";
import { useParallax } from "@/hooks/useParallax";
import { cn } from "@/lib/utils";

interface ParallaxLayerProps {
  speed?: number;
  className?: string;
  children: ReactNode;
}

export function ParallaxLayer({
  speed = 0.3,
  className,
  children,
}: ParallaxLayerProps) {
  const scrollY = useScrollY();
  const y = useParallax(scrollY, speed);

  return (
    <motion.div style={{ y }} className={cn("will-change-transform", className)}>
      {children}
    </motion.div>
  );
}
