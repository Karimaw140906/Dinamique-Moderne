import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Calendar, ArrowRight, ArrowLeft, RotateCcw, Car } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSimulator, SIMULATOR_TOTAL_STEPS } from "@/lib/simulator";
import { DestinationPicker } from "@/components/simulator/DestinationPicker";
import { TripTimeline } from "@/components/simulator/TripTimeline";
import { BudgetBar } from "@/components/simulator/BudgetBar";
import { RequestBookingButton } from "@/components/simulator/RequestBookingButton";

function StepDots() {
  const { step } = useSimulator();
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: SIMULATOR_TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
        <motion.div
          key={s}
          animate={{ width: s === step ? 24 : 8, backgroundColor: s <= step ? "#6C3EF5" : "#E5E7EB" }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}

function Counter({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          className="w-9 h-9 rounded-full border-2 border-[#6C3EF5] text-[#6C3EF5] flex items-center justify-center hover:bg-[#6C3EF5] hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#6C3EF5]"
        >
          <Minus className="w-4 h-4" />
        </button>
        <motion.span key={value} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-xl font-bold text-[#0B0A14] w-6 text-center">
          {value}
        </motion.span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full border-2 border-[#6C3EF5] text-[#6C3EF5] flex items-center justify-center hover:bg-[#6C3EF5] hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StepProfile() {
  const { adults, setAdults, children, setChildren, hasOwnVehicle, setHasOwnVehicle } = useSimulator();
  return (
    <div className="py-8 max-w-sm mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">👥</div>
        <h2 className="text-2xl font-bold text-[#0B0A14] mb-2">Qui voyage ?</h2>
        <p className="text-gray-500">Ça nous aide à calculer ton budget en temps réel.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-1">
        <Counter label="Adultes" value={adults} onChange={setAdults} min={1} />
        <Counter label="Enfants" value={children} onChange={setChildren} min={0} />
      </div>

      <button
        onClick={() => setHasOwnVehicle(!hasOwnVehicle)}
        className={`w-full mt-4 p-4 rounded-2xl border-2 flex items-center justify-between transition-colors ${
          hasOwnVehicle ? "border-[#6C3EF5] bg-[#6C3EF5]/5" : "border-gray-100 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <Car className={`w-5 h-5 ${hasOwnVehicle ? "text-[#6C3EF5]" : "text-gray-400"}`} />
          <span className="text-sm font-semibold text-[#0B0A14]">Je dispose de mon propre véhicule</span>
        </div>
        <div className={`relative w-11 h-6 rounded-full transition-colors ${hasOwnVehicle ? "bg-[#6C3EF5]" : "bg-gray-300"}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${hasOwnVehicle ? "translate-x-6" : "translate-x-1"}`} />
        </div>
      </button>
    </div>
  );
}

function StepDates() {
  const { startDate, setStartDate, totalNights, endDate } = useSimulator();
  return (
    <div className="text-center py-10">
      <div className="text-5xl mb-4">📅</div>
      <h2 className="text-2xl font-bold text-[#0B0A14] mb-2">Quand partez-vous ?</h2>
      <p className="text-gray-500 mb-8">La date de retour se calcule automatiquement selon ton itinéraire.</p>
      <div className="max-w-xs mx-auto relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={startDate || ""}
          onChange={(e) => setStartDate(e.target.value || null)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30"
        />
      </div>
      {startDate && totalNights > 0 && endDate && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-500 mt-4">
          Retour estimé le <span className="font-semibold text-[#0B0A14]">{new Date(endDate).toLocaleDateString("fr-FR")}</span> ({totalNights} nuits)
        </motion.p>
      )}
    </div>
  );
}

function StepDestinations() {
  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#0B0A14] mb-2">🌍 Où voulez-vous aller ?</h2>
        <p className="text-gray-500">Compose ton voyage en ajoutant les destinations qui te font envie.</p>
      </div>
      <DestinationPicker />
    </div>
  );
}

function StepItinerary() {
  return (
    <div className="py-6 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#0B0A14] mb-2">🗺️ Ton itinéraire</h2>
        <p className="text-gray-500">Réorganise, ajuste les nuits, glisse pour changer l'ordre.</p>
      </div>
      <TripTimeline />
    </div>
  );
}

function StepSummary() {
  const { adults, children, hasOwnVehicle, startDate, endDate, totalNights, destinations } = useSimulator();
  return (
    <div className="py-6 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-2xl font-bold text-[#0B0A14] mb-2">Ton voyage est prêt</h2>
        <p className="text-gray-500">Voici le récapitulatif — tu peux encore tout modifier.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Voyageurs</span>
          <span className="font-semibold text-[#0B0A14]">
            {adults} adulte{adults > 1 ? "s" : ""}{children > 0 ? ` + ${children} enfant${children > 1 ? "s" : ""}` : ""}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-1"><Car className="w-3.5 h-3.5" /> Véhicule personnel</span>
          <span className="font-semibold text-[#0B0A14]">{hasOwnVehicle ? "Oui" : "Non"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Départ</span>
          <span className="font-semibold text-[#0B0A14]">{startDate ? new Date(startDate).toLocaleDateString("fr-FR") : "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Retour estimé</span>
          <span className="font-semibold text-[#0B0A14]">{endDate ? new Date(endDate).toLocaleDateString("fr-FR") : "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Durée</span>
          <span className="font-semibold text-[#0B0A14]">{totalNights} nuits</span>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <span className="text-gray-500 text-sm block mb-2">Destinations</span>
          <div className="space-y-1">
            {destinations.map((d, i) => (
              <div key={d.uid} className="flex justify-between text-sm">
                <span className="text-[#0B0A14]">{i + 1}. {d.name}</span>
                <span className="text-gray-400">{d.nights}n</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <RequestBookingButton />
    </div>
  );
}

const STEPS = [StepProfile, StepDates, StepDestinations, StepItinerary, StepSummary];

export default function Simulateur() {
  const { step, nextStep, prevStep, resetTrip, destinations, adults } = useSimulator();
  const CurrentStep = STEPS[step - 1];

  const canGoNext = () => {
    if (step === 3) return destinations.length > 0;
    if (step === 1) return adults > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#F7F6FB] font-sans pb-24 lg:pb-0">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-10">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <StepDots />
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <CurrentStep />
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8">
              <button
                onClick={step === 1 ? resetTrip : prevStep}
                className="flex items-center gap-1 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                {step === 1 ? (
                  <>
                    <RotateCcw className="w-4 h-4" /> Recommencer
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </>
                )}
              </button>
              {step < SIMULATOR_TOTAL_STEPS && (
                <button
                  onClick={nextStep}
                  disabled={!canGoNext()}
                  className="flex items-center gap-1 px-6 py-3 bg-[#6C3EF5] text-white rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#5a32d6] transition-colors"
                >
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <BudgetBar variant="sidebar" />
          </div>
        </div>
      </div>
      <BudgetBar variant="mobile" />
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}
