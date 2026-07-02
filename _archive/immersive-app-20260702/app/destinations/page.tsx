import { Section } from "@/components/ui/Section";
import { ParallaxLayer } from "@/components/parallax/ParallaxLayer";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { destinations } from "@/lib/data/destinations";

export const metadata = { title: "Destinations | Immersive App" };

export default function DestinationsPage() {
  return (
    <>
      <Section className="pt-32 pb-12 text-center">
        <ParallaxLayer speed={0.15}>
          <p className="text-sm uppercase tracking-widest text-primary">Éditorial</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight md:text-6xl">Destinations</h1>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Explorez nos destinations coup de cœur, racontées comme des histoires.
          </p>
        </ParallaxLayer>
      </Section>

      <Section className="pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {destinations.map((d, i) => (
            <ParallaxLayer key={d.slug} speed={0.05 + (i % 2) * 0.08}>
              <DestinationCard destination={d} />
            </ParallaxLayer>
          ))}
        </div>
      </Section>
    </>
  );
}
