import { Section } from "@/components/ui/Section";
import { ParallaxLayer } from "@/components/parallax/ParallaxLayer";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { activities } from "@/lib/data/activities";

export const metadata = { title: "Activités | Immersive App" };

export default function ActivitiesPage() {
  return (
    <>
      <Section className="pt-32 pb-12 text-center">
        <ParallaxLayer speed={0.15}>
          <p className="text-sm uppercase tracking-widest text-primary">Expériences</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight md:text-6xl">Nos activités</h1>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Des expériences immersives sélectionnées pour rendre chaque séjour inoubliable.
          </p>
        </ParallaxLayer>
      </Section>

      <Section className="pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, i) => (
            <ParallaxLayer key={activity.slug} speed={0.05 + (i % 3) * 0.05}>
              <ActivityCard activity={activity} />
            </ParallaxLayer>
          ))}
        </div>
      </Section>
    </>
  );
}
