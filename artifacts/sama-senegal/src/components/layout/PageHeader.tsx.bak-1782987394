import { Link } from "wouter";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pt-28 md:pt-32 pb-8 md:pb-10 bg-gradient-to-b from-[#0B0A14] to-[#2B1B4D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-xs text-white/50 mb-3">
          <Link href="/" className="hover:text-[#F5B942]">Accueil</Link> <span className="mx-1">›</span> {title}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold text-white">{title}</h1>
        {subtitle && <p className="text-white/70 mt-3 max-w-2xl">{subtitle}</p>}
      </div>
    </div>
  );
}
