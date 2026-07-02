import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-base": "var(--color-bg-base)",
        "bg-elevated": "var(--color-bg-elevated)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        accent: "var(--color-accent)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        border: "var(--color-border)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};

export default config;
