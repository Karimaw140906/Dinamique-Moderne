import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 active:scale-95",
          variant === "primary" &&
            "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20",
          variant === "secondary" &&
            "border border-border bg-bg-elevated text-text-primary hover:border-primary/50",
          variant === "ghost" &&
            "bg-transparent text-text-secondary hover:text-text-primary",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
