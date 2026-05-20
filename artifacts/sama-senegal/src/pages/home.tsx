import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Tours } from "@/components/Tours";
import { Destinations } from "@/components/Destinations";
import { Guide } from "@/components/Guide";
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
      <Destinations />
      <Guide />
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
