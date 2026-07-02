import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-elevated/60 p-6 shadow-xl backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}
