import { Section } from "@/components/ui/Section";
import { ParallaxLayer } from "@/components/parallax/ParallaxLayer";
import { HotelCard } from "@/components/cards/HotelCard";
import { hotels } from "@/lib/data/hotels";

export const metadata = { title: "Hôtels | Immersive App" };

export default function HotelsPage() {
  return (
    <>
      <Section className="pt-32 pb-12 text-center">
        <ParallaxLayer speed={0.15}>
          <p className="text-sm uppercase tracking-widest text-primary">Séjours</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight md:text-6xl">Nos hôtels</h1>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Une sélection d'adresses immersives pensées pour chaque voyage.
          </p>
        </ParallaxLayer>
      </Section>

      <Section className="pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel, i) => (
            <ParallaxLayer key={hotel.slug} speed={0.05 + (i % 3) * 0.05}>
              <HotelCard hotel={hotel} />
            </ParallaxLayer>
          ))}
        </div>
      </Section>
    </>
  );
}
