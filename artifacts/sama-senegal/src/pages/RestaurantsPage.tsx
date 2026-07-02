import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionGate } from "@/components/layout/SectionGate";
import { RestaurantsSection } from "@/components/RestaurantsSection";
import { FoodSection } from "@/components/FoodSection";

export default function RestaurantsPage() {
  return (
    <div className="min-h-screen bg-[#0B0A14] font-sans">
      <Navbar />
      <PageHeader title="Restaurants" subtitle="Savourez une cuisine riche en saveurs et en traditions." image="/hero-restaurants.jpg" category="restaurants" />
      <SectionGate sectionKey="restaurants"><RestaurantsSection /></SectionGate>
      <SectionGate sectionKey="menu"><FoodSection /></SectionGate>
      <div id="footer"><Footer /></div>
    </div>
  );
}
