import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  fullHeight?: boolean;
}

export function Section({ className, fullHeight, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        "relative mx-auto w-full max-w-6xl px-6 py-24",
        fullHeight &&
          "flex min-h-screen flex-col items-center justify-center",
        className
      )}
      {...props}
    />
  );
}
