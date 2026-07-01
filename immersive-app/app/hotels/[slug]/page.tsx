import { notFound } from "next/navigation";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ParallaxLayer } from "@/components/parallax/ParallaxLayer";
import { HotelCard } from "@/components/cards/HotelCard";
import { getHotelBySlug, getHotelsByDestination, hotels } from "@/lib/data/hotels";

export function generateStaticParams() {
  return hotels.map((h) => ({ slug: h.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const hotel = getHotelBySlug(params.slug);
  return { title: hotel ? `${hotel.name} | Immersive App` : "Hôtel introuvable" };
}

export default function HotelDetailPage({ params }: { params: { slug: string } }) {
  const hotel = getHotelBySlug(params.slug);
  if (!hotel) notFound();

  const related = getHotelsByDestination(hotel.destination).filter(
    (h) => h.slug !== hotel.slug
  );

  return (
    <>
      <Section className="pt-24 pb-0">
        {/* Parallaxe adoucie : page critique (réservation) */}
        <ParallaxLayer
          speed={0.08}
          className="relative h-[50vh] w-full overflow-hidden rounded-lg"
        >
          <Image src={hotel.images[0]} alt={hotel.name} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent" />
        </ParallaxLayer>
      </Section>

      <Section className="grid gap-10 pt-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <ParallaxLayer speed={0.05}>
            <p className="text-sm uppercase tracking-widest text-primary">{hotel.location}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">{hotel.name}</h1>
            <p className="mt-2 text-text-secondary">
              ★ {hotel.rating} · {hotel.reviews} avis
            </p>
            <p className="mt-6 leading-relaxed text-text-secondary">{hotel.description}</p>

            <h2 className="mt-10 text-xl font-semibold">Équipements</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {hotel.amenities.map((a) => (
                <li
                  key={a}
                  className="rounded-md border border-border bg-bg-elevated/40 px-4 py-2 text-sm"
                >
                  {a}
                </li>
              ))}
            </ul>
          </ParallaxLayer>
        </div>

        {/* Bloc réservation : parallaxe désactivée pour stabilité de lecture */}
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <p className="text-sm text-text-secondary">À partir de</p>
            <p className="text-3xl font-bold text-primary">
              {hotel.pricePerNight}€{" "}
              <span className="text-base font-normal text-text-secondary">/ nuit</span>
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button variant="primary">Réserver maintenant</Button>
              <Button variant="secondary">Voir les disponibilités</Button>
            </div>
          </Card>
        </div>
      </Section>

      {related.length > 0 && (
        <Section className="pb-24">
          <h2 className="mb-6 text-2xl font-semibold">Autres hôtels à proximité</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((h) => (
              <HotelCard key={h.slug} hotel={h} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
