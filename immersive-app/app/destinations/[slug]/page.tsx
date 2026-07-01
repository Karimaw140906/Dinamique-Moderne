import { notFound } from "next/navigation";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { ParallaxLayer } from "@/components/parallax/ParallaxLayer";
import { HotelCard } from "@/components/cards/HotelCard";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { getDestinationBySlug, destinations } from "@/lib/data/destinations";
import { getHotelsByDestination } from "@/lib/data/hotels";
import { getActivitiesByDestination } from "@/lib/data/activities";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  return { title: destination ? `${destination.name} | Immersive App` : "Destination introuvable" };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) notFound();

  const relatedHotels = getHotelsByDestination(destination.slug);
  const relatedActivities = getActivitiesByDestination(destination.slug);

  return (
    <>
      <Section fullHeight className="relative overflow-hidden text-center">
        {/* Page éditoriale : parallaxe forte autorisée (non critique pour la conversion) */}
        <ParallaxLayer speed={-0.3} className="absolute inset-0 -z-10">
          <Image
            src={destination.heroImage}
            alt={destination.name}
            fill
            priority
            className="object-cover opacity-40"
          />
        </ParallaxLayer>

        <ParallaxLayer speed={0.3} className="relative z-10">
          <p className="text-sm uppercase tracking-widest text-primary">{destination.country}</p>
          <h1 className="mt-3 text-6xl font-bold tracking-tight md:text-7xl">{destination.name}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">{destination.tagline}</p>
        </ParallaxLayer>
      </Section>

      <Section className="max-w-3xl">
        <ParallaxLayer speed={0.15}>
          <p className="leading-relaxed text-text-secondary">{destination.description}</p>
        </ParallaxLayer>
      </Section>

      <Section className="grid gap-6 md:grid-cols-3">
        {destination.gallery.map((src, i) => (
          <ParallaxLayer
            key={src}
            speed={0.1 + (i % 3) * 0.06}
            className="relative h-64 overflow-hidden rounded-lg"
          >
            <Image src={src} alt={`${destination.name} ${i + 1}`} fill className="object-cover" />
          </ParallaxLayer>
        ))}
      </Section>

      {relatedHotels.length > 0 && (
        <Section className="pb-12">
          <h2 className="mb-6 text-2xl font-semibold">Où dormir à {destination.name}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedHotels.map((h) => (
              <HotelCard key={h.slug} hotel={h} />
            ))}
          </div>
        </Section>
      )}

      {relatedActivities.length > 0 && (
        <Section className="pb-24">
          <h2 className="mb-6 text-2xl font-semibold">Activités à {destination.name}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedActivities.map((a) => (
              <ActivityCard key={a.slug} activity={a} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
