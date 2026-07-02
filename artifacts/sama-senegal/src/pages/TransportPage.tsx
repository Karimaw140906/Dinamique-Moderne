import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionGate } from "@/components/layout/SectionGate";
import { TransportSection } from "@/components/TransportSection";

export default function TransportPage() {
  return (
    <div className="min-h-screen bg-[#0B0A14] font-sans">
      <Navbar />
      <PageHeader title="Transport" subtitle="Réservez vos transferts et moyens de transport en toute sérénité." />
      <SectionGate sectionKey="transport"><TransportSection /></SectionGate>
      <div id="footer"><Footer /></div>
    </div>
  );
}
