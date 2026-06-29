import { useState, useEffect, createContext, useContext } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { CategorySection } from "@/components/CategorySection";
import { TrustBadges } from "@/components/TrustBadges";
import { SpecialOffers } from "@/components/SpecialOffers";
import { CTABanner } from "@/components/CTABanner";
import { SOSButton } from "@/components/SOSButton";
import { Stats } from "@/components/Stats";
import { Tours } from "@/components/Tours";
import { TransportSection } from "@/components/TransportSection";
import { TeamSection } from "@/components/TeamSection";
import { RestaurantsSection } from "@/components/RestaurantsSection";
import { HotelsSection } from "@/components/HotelsSection";
import { FoodSection } from "@/components/FoodSection";
import { ActivitiesSection } from "@/components/ActivitiesSection";
import { Testimonials } from "@/components/Testimonials";
import { BookingModal } from "@/components/Booking";
import { Footer } from "@/components/Footer";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { ClientDashboard } from "@/components/ClientDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { ScrollReveal } from "@/components/ScrollReveal";

export const BookingContext = createContext<{ openBooking: (tourName?: string) => void }>({ openBooking: () => {} });
export function useBooking() { return useContext(BookingContext); }

interface SectionConfig { id: string; visible: boolean; order: number; isCustom?: boolean; }

function loadSectionsConfig(): SectionConfig[] {
  try {
    const saved = localStorage.getItem("sectionsConfig");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

const SELF_GATED_SECTIONS = ["restaurants", "hotels"]; // ces sections gerent leur propre visibilite via useSiteSection (Supabase) - on ne les bloque plus via le vieux systeme localStorage

function isVisible(id: string, config: SectionConfig[]): boolean {
  if (SELF_GATED_SECTIONS.includes(id)) return true;
  if (config.length === 0) return true;
  const entry = config.find((s) => s.id === id);
  return entry ? entry.visible : true;
}

const ORDERED_IDS = [
  "stats",
  "tours",
  "transport",
  "team",
  "restaurants",
  "hotels",
  "food",
  "activities",
  "testimonials",
];

const SECTION_MAP: Record<string, React.ReactElement> = {
  stats:        <Stats />,
  tours:        <Tours />,
  transport:    <TransportSection />,
  team:         <TeamSection />,
  restaurants:  <RestaurantsSection />,
  hotels:       <HotelsSection />,
  food:         <FoodSection />,
  activities:   <ActivitiesSection />,
  testimonials: <Testimonials />,
};

function DynamicSections() {
  const [config, setConfig] = useState<SectionConfig[]>(() => loadSectionsConfig());

  useEffect(() => {
    const onUpdate = () => setConfig(loadSectionsConfig());
    window.addEventListener("sectionsConfigUpdated", onUpdate);
    return () => window.removeEventListener("sectionsConfigUpdated", onUpdate);
  }, []);

  const getOrder = (id: string): number => {
    const entry = config.find((s) => s.id === id);
    return entry ? entry.order : ORDERED_IDS.indexOf(id);
  };

  const sortedIds = [...ORDERED_IDS].sort((a, b) => getOrder(a) - getOrder(b));

  return (
    <>
      {sortedIds.map((id) =>
        isVisible(id, config) ? <div key={id}>{SECTION_MAP[id]}</div> : null
      )}
    </>
  );
}

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedTour, setPreselectedTour] = useState<string | undefined>();
  const openBooking = (tourName?: string) => {
    setPreselectedTour(tourName);
    setBookingOpen(true);
  };

  return (
    <BookingContext.Provider value={{ openBooking }}>
      <div className="min-h-screen bg-[#F5F0E8] font-sans">
        <ScrollReveal />

        {/* 1. Header sticky */}
        <Navbar />

        {/* 2. Hero plein écran */}
        <Hero />

        {/* 3. Barre de recherche flottante */}
        <SearchBar />

        {/* 4. Section Explorez par catégorie */}
        <CategorySection />

        {/* 5. Badges de confiance */}
        <TrustBadges />

        {/* 6. Sections dynamiques admin (Tours, Hotels, Restaurants...) */}
        <DynamicSections />

        {/* 7. Offres spéciales */}
        <SpecialOffers />

        {/* 8. Bandeau CTA final */}
        <CTABanner />

        {/* Footer */}
        <div id="footer">
          <Footer />
        </div>

        {/* Bouton SOS flottant (bas droite) */}
        <SOSButton />

        {/* Modals & overlays */}
        <ClientAuthModal />
        <ClientDashboard />
        <AdminDashboard />
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          preselectedTour={preselectedTour}
        />
      </div>
    </BookingContext.Provider>
  );
}
