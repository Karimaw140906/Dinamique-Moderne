import { notFound } from "next/navigation";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ParallaxLayer } from "@/components/parallax/ParallaxLayer";
import { ActivityCard } from "@/components/cards/ActivityCard";
import {
  getActivityBySlug,
  getActivitiesByDestination,
  activities,
} from "@/lib/data/activities";

export function generateStaticParams() {
  return activities.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const activity = getActivityBySlug(params.slug);
  return { title: activity ? `${activity.name} | Immersive App` : "Activité introuvable" };
}

export default function ActivityDetailPage({ params }: { params: { slug: string } }) {
  const activity = getActivityBySlug(params.slug);
  if (!activity) notFound();

  const related = getActivitiesByDestination(activity.destination).filter(
    (a) => a.slug !== activity.slug
  );

  return (
    <>
      <Section className="pt-24 pb-0">
        {/* Parallaxe adoucie : page critique (réservation) */}
        <ParallaxLayer
          speed={0.08}
          className="relative h-[45vh] w-full overflow-hidden rounded-lg"
        >
          <Image src={activity.images[0]} alt={activity.name} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent" />
        </ParallaxLayer>
      </Section>

      <Section className="grid gap-10 pt-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <ParallaxLayer speed={0.05}>
            <p className="text-sm uppercase tracking-widest text-primary">{activity.category}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">{activity.name}</h1>
            <p className="mt-2 text-text-secondary">
              ★ {activity.rating} · {activity.duration}
            </p>
            <p className="mt-6 leading-relaxed text-text-secondary">{activity.description}</p>

            <h2 className="mt-10 text-xl font-semibold">Points forts</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {activity.highlights.map((h) => (
                <li
                  key={h}
                  className="rounded-md border border-border bg-bg-elevated/40 px-4 py-2 text-sm"
                >
                  {h}
                </li>
              ))}
            </ul>
          </ParallaxLayer>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <p className="text-sm text-text-secondary">Prix par personne</p>
            <p className="text-3xl font-bold text-primary">{activity.price}€</p>
            <div className="mt-6 flex flex-col gap-3">
              <Button variant="primary">Réserver cette activité</Button>
              <Button variant="secondary">Voir les créneaux</Button>
            </div>
          </Card>
        </div>
      </Section>

      {related.length > 0 && (
        <Section className="pb-24">
          <h2 className="mb-6 text-2xl font-semibold">Autres activités à proximité</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((a) => (
              <ActivityCard key={a.slug} activity={a} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
