import { useSiteSection } from "@/lib/useSiteSection";

type SectionKey = "restaurants" | "hotels" | "activities" | "transport" | "tours" | "menu" | "destinations" | "events";

export function SectionGate({ sectionKey, children }: { sectionKey: SectionKey; children: React.ReactNode }) {
  const active = useSiteSection(sectionKey);
  if (!active) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-white/60 text-lg">Cette section n'est pas disponible pour le moment.</p>
        <p className="text-white/30 text-sm mt-2">Revenez bientôt 🌴</p>
      </div>
    );
  }
  return <>{children}</>;
}
