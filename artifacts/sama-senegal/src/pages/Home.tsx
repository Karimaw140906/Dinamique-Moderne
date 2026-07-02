import { useEffect, useState } from "react";
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
import { DestinationsSection } from "@/components/DestinationsSection";
import { EventsSection } from "@/components/EventsSection";
import { Testimonials } from "@/components/Testimonials";
import { BookingModal } from "@/components/Booking";
import { Footer } from "@/components/Footer";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { ClientDashboard } from "@/components/ClientDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useBooking } from "@/context/BookingContext";
import { supabase } from "@/lib/supabase";

interface SectionConfig { id: string; visible: boolean; order: number; isCustom?: boolean; }

function loadLocalFallback(): SectionConfig[] {
  try {
    const saved = localStorage.getItem("sectionsConfig");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function isVisible(id: string, config: SectionConfig[]): boolean {
  if (config.length === 0) return true;
  const entry = config.find((s) => s.id === id);
  return entry ? entry.visible : true;
}

const ORDERED_IDS = [
  "destinations", "events",
  "stats", "tours", "transport", "team", "restaurants",
  "hotels", "food", "activities", "testimonials", "sos",
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
  sos:          <SOSButton />,
  destinations: <DestinationsSection />,
  events:       <EventsSection />,
};

function DynamicSections() {
  const [config, setConfig] = useState<SectionConfig[]>(() => loadLocalFallback());

  useEffect(() => {
    let mounted = true;

    const loadFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from("site_sections")
          .select("key, active, sort_order");
        if (!error && data && data.length > 0 && mounted) {
          const mapped: SectionConfig[] = data.map((row: any) => ({
            id: row.key,
            visible: row.active,
            order: row.sort_order ?? 0,
          }));
          setConfig(mapped);
        }
        // si vide ou erreur -> garde le fallback localStorage deja en state
      } catch {
        // reseau KO -> garde le fallback localStorage
      }
    };

    loadFromSupabase();

    const onUpdate = () => setConfig(loadLocalFallback());
    window.addEventListener("sectionsConfigUpdated", onUpdate);
    return () => { mounted = false; window.removeEventListener("sectionsConfigUpdated", onUpdate); };
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
  const { bookingOpen, closeBooking, preselectedTour } = useBooking();

  return (
    <div className="min-h-screen bg-[#2B1B4D] font-sans">
      <ScrollReveal />
      <Navbar />
      <Hero />
      <SearchBar />
      <CategorySection />
      <TrustBadges />
      <DynamicSections />
      <SpecialOffers />
      <CTABanner />
      <div id="footer">
        <Footer />
      </div>
      <ClientAuthModal />
      <ClientDashboard />
      <AdminDashboard />
      <BookingModal
        open={bookingOpen}
        onClose={closeBooking}
        preselectedTour={preselectedTour}
      />
    </div>
  );
}
