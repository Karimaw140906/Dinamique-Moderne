import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionGate } from "@/components/layout/SectionGate";
import { DestinationsSection } from "@/components/DestinationsSection";
import { Tours } from "@/components/Tours";

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-[#0B0A14] font-sans">
      <Navbar />
      <PageHeader title="Destinations" subtitle="Des lieux d'exception, des cultures vibrantes, des expériences inoubliables." image="/hero-destinations.jpg" category="destinations" />
      <SectionGate sectionKey="destinations"><DestinationsSection /></SectionGate>
      <SectionGate sectionKey="tours"><Tours /></SectionGate>
      <div id="footer"><Footer /></div>
    </div>
  );
}
