import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CurrencyCode = "FCFA" | "EUR" | "USD" | "GBP" | "MAD" | "DZD" | "CAD" | "CHF" | "SAR" | "AED" | "CNY";

export interface CurrencyInfo {
  code: CurrencyCode;
  flag: string;
  name: string;
  rate: number;
}

export const DEFAULT_RATES: Record<CurrencyCode, number> = {
  FCFA: 1,
  EUR: 0.00152,
  USD: 0.00166,
  GBP: 0.00130,
  MAD: 0.01658,
  DZD: 0.22400,
  CAD: 0.00226,
  CHF: 0.00149,
  SAR: 0.00623,
  AED: 0.00610,
  CNY: 0.01200,
};

export const CURRENCIES: CurrencyInfo[] = [
  { code: "FCFA", flag: "🇸🇳", name: "Franc CFA", rate: 1 },
  { code: "EUR",  flag: "🇪🇺", name: "Euro",      rate: 0.00152 },
  { code: "USD",  flag: "🇺🇸", name: "US Dollar", rate: 0.00166 },
  { code: "GBP",  flag: "🇬🇧", name: "Livre Sterling", rate: 0.00130 },
  { code: "MAD",  flag: "🇲🇦", name: "Dirham Marocain", rate: 0.01658 },
  { code: "DZD",  flag: "🇩🇿", name: "Dinar Algérien", rate: 0.22400 },
  { code: "CAD",  flag: "🇨🇦", name: "Dollar Canadien", rate: 0.00226 },
  { code: "CHF",  flag: "🇨🇭", name: "Franc Suisse", rate: 0.00149 },
  { code: "SAR",  flag: "🇸🇦", name: "Riyal Saoudien", rate: 0.00623 },
  { code: "AED",  flag: "🇦🇪", name: "Dirham Émirati", rate: 0.00610 },
  { code: "CNY",  flag: "🇨🇳", name: "Yuan Chinois", rate: 0.01200 },
];

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  setRates: (r: Record<CurrencyCode, number>) => void;
  convertPrice: (fcfa: number) => string;
  currencies: CurrencyInfo[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("FCFA");
  const [rates, setRatesState] = useState<Record<CurrencyCode, number>>(DEFAULT_RATES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("selectedCurrency") as CurrencyCode;
      if (saved && saved in DEFAULT_RATES) setCurrencyState(saved);
    } catch {}
    try {
      const savedRates = localStorage.getItem("currencyRates");
      if (savedRates) setRatesState(JSON.parse(savedRates));
    } catch {}
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem("selectedCurrency", c);
  };

  const setRates = (r: Record<CurrencyCode, number>) => {
    setRatesState(r);
    localStorage.setItem("currencyRates", JSON.stringify(r));
  };

  const convertPrice = (fcfa: number): string => {
    if (!fcfa || isNaN(fcfa)) return `0 FCFA`;
    const rate = rates[currency] ?? DEFAULT_RATES[currency] ?? 1;
    if (currency === "FCFA") {
      return new Intl.NumberFormat("fr-FR").format(Math.round(fcfa)) + " FCFA";
    }
    const converted = fcfa * rate;
    return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(converted) + " " + currency;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, setRates, convertPrice, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
