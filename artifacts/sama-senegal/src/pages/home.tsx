import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Tours } from "@/components/Tours";
import { TransportSection } from "@/components/TransportSection";
import { Destinations } from "@/components/Destinations";
import { TeamSection } from "@/components/TeamSection";
import { RestaurantsSection } from "@/components/RestaurantsSection";
import { HotelsSection } from "@/components/HotelsSection";
import { FoodSection } from "@/components/FoodSection";
import { ActivitiesSection } from "@/components/ActivitiesSection";
import { Testimonials } from "@/components/Testimonials";
import { Booking } from "@/components/Booking";
import { Footer } from "@/components/Footer";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { ClientDashboard } from "@/components/ClientDashboard";
import { AdminAuthModal } from "@/components/AdminAuthModal";
import { AdminDashboard } from "@/components/AdminDashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <Hero />
      <Stats />
      <Tours />
      <TransportSection />
      <Destinations />
      <TeamSection />
      <RestaurantsSection />
      <HotelsSection />
      <FoodSection />
      <ActivitiesSection />
      <Testimonials />
      <Booking />
      <Footer />

      <ClientAuthModal />
      <ClientDashboard />
      <AdminAuthModal />
      <AdminDashboard />
    </div>
  );
}
