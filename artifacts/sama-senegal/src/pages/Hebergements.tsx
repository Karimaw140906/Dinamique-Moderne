import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionGate } from "@/components/layout/SectionGate";
import { HotelsSection } from "@/components/HotelsSection";

export default function HebergementsPage() {
  return (
    <div className="min-h-screen bg-[#0B0A14] font-sans">
      <Navbar />
      <PageHeader title="Hébergements" subtitle="Hôtels, villas, campements et maisons d'hôtes pour un séjour inoubliable." />
      <SectionGate sectionKey="hotels"><HotelsSection /></SectionGate>
      <div id="footer"><Footer /></div>
    </div>
  );
}
