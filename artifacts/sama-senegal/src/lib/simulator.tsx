import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { saveItinerary } from "@/lib/saveTrip";

export interface TripDestination {
  uid: string;
  destinationId: string | number;
  name: string;
  photo?: string;
  nights: number;
}

export interface SimulatorState {
  adults: number;
  children: number;
  hasOwnVehicle: boolean;
  startDate: string | null;
  destinations: TripDestination[];
  step: number;
}

interface SimulatorContextType extends SimulatorState {
  setAdults: (n: number) => void;
  setChildren: (n: number) => void;
  setHasOwnVehicle: (v: boolean) => void;
  setStartDate: (d: string | null) => void;
  addDestination: (d: { id: string | number; name: string; photo?: string }) => void;
  removeDestination: (uid: string) => void;
  updateNights: (uid: string, nights: number) => void;
  reorderDestinations: (newOrder: TripDestination[]) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetTrip: () => void;
  travelers: number;
  totalNights: number;
  endDate: string | null;
}

const STORAGE_KEY = "sama_simulator_trip";
const TOTAL_STEPS = 5;

function loadState(): SimulatorState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        adults: parsed.adults ?? 2,
        children: parsed.children ?? 0,
        hasOwnVehicle: parsed.hasOwnVehicle ?? false,
        startDate: parsed.startDate ?? null,
        destinations: (parsed.destinations || []).map((d: any) => ({
          uid: d.uid,
          destinationId: d.destinationId,
          name: d.name,
          photo: d.photo,
          nights: d.nights ?? 2,
        })),
        step: parsed.step ?? 1,
      };
    }
  } catch {}
  return { adults: 2, children: 0, hasOwnVehicle: false, startDate: null, destinations: [], step: 1 };
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

export function SimulatorProvider({ children: reactChildren }: { children: ReactNode }) {
  const [state, setState] = useState<SimulatorState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    if (state.destinations.length === 0) return;
    const timeout = setTimeout(() => {
      saveItinerary(state, { status: "draft" });
    }, 1200);
    return () => clearTimeout(timeout);
  }, [state]);

  const setAdults = (n: number) => setState((s) => ({ ...s, adults: Math.max(1, n) }));
  const setChildren = (n: number) => setState((s) => ({ ...s, children: Math.max(0, n) }));
  const setHasOwnVehicle = (v: boolean) => setState((s) => ({ ...s, hasOwnVehicle: v }));
  const setStartDate = (d: string | null) => setState((s) => ({ ...s, startDate: d }));

  const addDestination = (d: { id: string | number; name: string; photo?: string }) => {
    setState((s) => ({
      ...s,
      destinations: [
        ...s.destinations,
        { uid: `${d.id}-${Date.now()}`, destinationId: d.id, name: d.name, photo: d.photo, nights: 2 },
      ],
    }));
  };

  const removeDestination = (uid: string) =>
    setState((s) => ({ ...s, destinations: s.destinations.filter((d) => d.uid !== uid) }));

  const updateNights = (uid: string, nights: number) =>
    setState((s) => ({
      ...s,
      destinations: s.destinations.map((d) => (d.uid === uid ? { ...d, nights: Math.max(1, nights) } : d)),
    }));

  const reorderDestinations = (newOrder: TripDestination[]) =>
    setState((s) => ({ ...s, destinations: newOrder }));

  const goToStep = (step: number) => setState((s) => ({ ...s, step: Math.min(Math.max(1, step), TOTAL_STEPS) }));
  const nextStep = () => setState((s) => ({ ...s, step: Math.min(s.step + 1, TOTAL_STEPS) }));
  const prevStep = () => setState((s) => ({ ...s, step: Math.max(s.step - 1, 1) }));

  const resetTrip = () => setState({ adults: 2, children: 0, hasOwnVehicle: false, startDate: null, destinations: [], step: 1 });

  const travelers = state.adults + state.children;
  const totalNights = state.destinations.reduce((sum, d) => sum + d.nights, 0);
  const endDate = (() => {
    if (!state.startDate || totalNights === 0) return null;
    const start = new Date(state.startDate);
    start.setDate(start.getDate() + totalNights);
    return start.toISOString().split("T")[0];
  })();

  return (
    <SimulatorContext.Provider
      value={{
        ...state,
        setAdults,
        setChildren,
        setHasOwnVehicle,
        setStartDate,
        addDestination,
        removeDestination,
        updateNights,
        reorderDestinations,
        goToStep,
        nextStep,
        prevStep,
        resetTrip,
        travelers,
        totalNights,
        endDate,
      }}
    >
      {reactChildren}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error("useSimulator must be used within SimulatorProvider");
  return ctx;
}

export const SIMULATOR_TOTAL_STEPS = TOTAL_STEPS;
