import { ShieldCheck, Headphones, Tag, RefreshCw } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Réservation sécurisée", desc: "Paiement 100% protégé", color: "text-[#2C7A5C]", bg: "bg-[#2C7A5C]/10" },
  { icon: Headphones, label: "Support 24/7",          desc: "Toujours disponible",    color: "text-[#5C3D1E]", bg: "bg-[#5C3D1E]/10" },
  { icon: Tag,        label: "Meilleurs prix",        desc: "Garantie prix bas",      color: "text-[#D4A017]", bg: "bg-[#D4A017]/10" },
  { icon: RefreshCw,  label: "Annulation flexible",   desc: "Sans frais sous 48h",   color: "text-[#C2622D]", bg: "bg-[#C2622D]/10" },
];

export function TrustBadges() {
  return (
    <section className="py-8 md:py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((b, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-3 sm:p-4 rounded-2xl hover:bg-gray-50 transition-colors text-center sm:text-left">
              <div className={`w-11 h-11 rounded-xl ${b.bg} flex items-center justify-center shrink-0`}>
                <b.icon className={`w-5 h-5 ${b.color}`} />
              </div>
              <div>
                <div className="font-bold text-[#1A1A2E] text-sm leading-tight">{b.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
