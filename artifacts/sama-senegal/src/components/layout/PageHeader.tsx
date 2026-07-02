import { Link } from "wouter";

export function PageHeader({ title, subtitle, image }: { title: string; subtitle?: string; image?: string }) {
  return (
    <div className={`relative overflow-hidden pt-32 md:pt-40 pb-14 md:pb-20 ${image ? "" : "bg-gradient-to-b from-brand-dark to-brand-violet-deep"}`}>
      {image && (
        <div className="absolute inset-0 -z-10">
          <img src={image} alt={title} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/90 via-brand-violet-deep/80 to-brand-violet-deep" />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-xs text-white/50 mb-3">
          <Link href="/" className="hover:text-brand-gold">Accueil</Link> <span className="mx-1">›</span> {title}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold text-white">{title}</h1>
        {subtitle && <p className="text-white/70 mt-3 max-w-2xl">{subtitle}</p>}
      </div>
    </div>
  );
}
