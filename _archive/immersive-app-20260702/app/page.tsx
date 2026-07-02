import { ParallaxLayer } from "@/components/parallax/ParallaxLayer";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const features = [
  { title: "Design system", desc: "Tokens cohérents, composants réutilisables." },
  { title: "Parallaxe globale", desc: "Profondeur réelle sur tout le scroll." },
  { title: "Performance", desc: "Animations GPU, fluides sur toute la page." },
];

export default function Home() {
  return (
    <>
      <Section fullHeight className="overflow-hidden">
        <ParallaxLayer speed={-0.4} className="absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-primary/30 blur-[120px]" />
        </ParallaxLayer>

        <ParallaxLayer speed={-0.15} className="absolute inset-0 -z-10">
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" />
        </ParallaxLayer>

        <ParallaxLayer speed={0.3} className="relative z-10 text-center">
          <h1 className="text-6xl font-bold tracking-tight md:text-8xl">
            Immersive
            <span className="block text-primary">Experience</span>
          </h1>
        </ParallaxLayer>

        <ParallaxLayer speed={0.55} className="relative z-10 mt-6 max-w-xl text-center">
          <p className="text-lg text-text-secondary">
            Base Next.js avec moteur de parallaxe fort, design system et layout immersif.
          </p>
        </ParallaxLayer>

        <ParallaxLayer speed={0.75} className="relative z-10 mt-10 flex gap-4">
          <Button variant="primary">Commencer</Button>
          <Button variant="secondary">Documentation</Button>
        </ParallaxLayer>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <ParallaxLayer key={f.title} speed={0.1 + i * 0.1}>
              <Card>
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-text-secondary">{f.desc}</p>
              </Card>
            </ParallaxLayer>
          ))}
        </div>
      </Section>

      <Section fullHeight className="text-center">
        <ParallaxLayer speed={0.2}>
          <h2 className="text-4xl font-bold">Prêt à construire ?</h2>
          <p className="mt-4 text-text-secondary">Bloc 1 validé, place au Bloc 2.</p>
          <div className="mt-8">
            <Button variant="primary">Aller plus loin</Button>
          </div>
        </ParallaxLayer>
      </Section>
    </>
  );
}
