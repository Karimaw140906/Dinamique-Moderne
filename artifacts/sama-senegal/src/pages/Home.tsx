import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CataloguesSection } from "@/components/CataloguesSection";
import { SearchBar } from "@/components/SearchBar";
import { Stats } from "@/components/Stats";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { ClientDashboard } from "@/components/ClientDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { BookingModal } from "@/components/Booking";
import { useBooking } from "@/context/BookingContext";

export default function Home() {
  const { bookingOpen, closeBooking, preselectedTour } = useBooking();

  return (
    <div className="min-h-screen bg-[#0B0A14] font-sans">
      <ScrollReveal />
      <Navbar />
      <Hero />
      <SearchBar />
      <Stats />
      <CataloguesSection pageSlug="accueil" title="Explorez le Sénégal" subtitle="Des lieux d'exception à découvrir" />
      {/* TODO: MapView a integrer ici une fois son API verifiee */}
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
