import { motion } from "framer-motion";
import { Star, Clock, Tag, ArrowRight } from "lucide-react";
import { useBooking } from "@/pages/Home";
import { useCurrency } from "@/lib/currency";

const OFFERS = [
  {
    id: 1,
    emoji: "🌅",
    category: "Séjour",
    title: "Week-end à Gorée",
    desc: "2 nuits + circuit historique + repas traditionnel inclus",
    originalPrice: 180000,
    promoPrice: 135000,
    discount: 25,
    rating: 4.9,
    reviews: 87,
    tag: "Bestseller",
    color: "from-[#2C7A5C]/20 to-[#2C7A5C]/5",
    border: "border-[#2C7A5C]/20",
    badgeColor: "bg-[#2C7A5C] text-white",
    tagColor: "text-[#2C7A5C]",
  },
  {
    id: 2,
    emoji: "🌊",
    category: "Activité",
    title: "Journée au Lac Rose",
    desc: "Transport + baignade + déjeuner bord du lac + photos souvenirs",
    originalPrice: 75000,
    promoPrice: 52500,
    discount: 30,
    rating: 4.8,
    reviews: 124,
    tag: "Populaire",
    color: "from-[#D4A017]/20 to-[#D4A017]/5",
    border: "border-[#D4A017]/20",
    badgeColor: "bg-[#D4A017] text-white",
    tagColor: "text-[#D4A017]",
  },
  {
    id: 3,
    emoji: "🦁",
    category: "Safari",
    title: "Réserve de Bandia",
    desc: "Safari 4x4, girafes, rhinocéros, zèbres + buffet de brousse",
    originalPrice: 95000,
    promoPrice: 71250,
    discount: 25,
    rating: 4.9,
    reviews: 62,
    tag: "Coup de cœur",
    color: "from-[#C2622D]/20 to-[#C2622D]/5",
    border: "border-[#C2622D]/20",
    badgeColor: "bg-[#C2622D] text-white",
    tagColor: "text-[#C2622D]",
  },
  {
    id: 4,
    emoji: "🍲",
    category: "Culture",
    title: "Cours de cuisine sénégalaise",
    desc: "Thiéboudienne, Yassa, Mafé — avec chef local à domicile",
    originalPrice: 45000,
    promoPrice: 31500,
    discount: 30,
    rating: 5.0,
    reviews: 41,
    tag: "Nouveau",
    color: "from-[#1A1A2E]/10 to-[#1A1A2E]/5",
    border: "border-[#1A1A2E]/10",
    badgeColor: "bg-[#1A1A2E] text-white",
    tagColor: "text-[#1A1A2E]",
  },
];

function OfferCard({ offer, index }: { offer: typeof OFFERS[0]; index: number }) {
  const { openBooking } = useBooking();
  const { convertPrice } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`group relative flex flex-col bg-gradient-to-br ${offer.color} border ${offer.border} rounded-2xl p-5 hover:shadow-lg transition-all duration-300 shrink-0 w-72 sm:w-80 md:w-auto`}>

      {/* Badge réduction */}
      <div className="absolute -top-3 -right-3 w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10">
        <span className="text-white font-black text-sm leading-none">-{offer.discount}%</span>
      </div>

      {/* Tag */}
      <div className={`inline-flex items-center gap-1.5 self-start ${offer.badgeColor} text-xs font-bold px-3 py-1 rounded-full mb-3`}>
        <Tag className="w-3 h-3" />
        {offer.tag}
      </div>

      {/* Emoji + titre */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{offer.emoji}</span>
        <div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{offer.category}</div>
          <div className="font-bold text-[#1A1A2E] text-base sm:text-lg leading-tight">{offer.title}</div>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{offer.desc}</p>

      {/* Note */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="flex">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`w-3 h-3 ${i <= Math.floor(offer.rating) ? "text-[#D4A017] fill-[#D4A017]" : "text-gray-300"}`} />
          ))}
        </div>
        <span className="text-xs font-bold text-gray-700">{offer.rating}</span>
        <span className="text-xs text-gray-400">({offer.reviews} avis)</span>
      </div>

      {/* Prix */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-gray-400 line-through">{convertPrice(offer.originalPrice)}</div>
          <div className="text-xl font-black text-[#2C7A5C]">{convertPrice(offer.promoPrice)}</div>
          <div className="text-xs text-gray-500">par personne</div>
        </div>
        <button
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1A1A2E] hover:bg-[#2C7A5C] text-white text-sm font-bold rounded-xl transition-all group-hover:scale-105 min-h-[44px]"
          onClick={() => openBooking(offer.title)}>
          Réserver <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
        <Clock className="w-3 h-3" />
        Offre valable jusqu'à fin de mois
      </div>
    </motion.div>
  );
}

export function SpecialOffers() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold text-[#C2622D] uppercase tracking-widest">Offres spéciales</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold text-[#1A1A2E] mt-2">
              Promotions du moment
            </h2>
            <p className="text-gray-500 text-sm mt-1">Réservez maintenant, économisez jusqu'à 30%</p>
          </motion.div>
          <button
            onClick={() => document.querySelector("#tours")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-1.5 text-sm font-bold text-[#2C7A5C] hover:text-[#245f49] whitespace-nowrap shrink-0 min-h-[44px]">
            Voir tout <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile : carrousel horizontal */}
        <div className="flex md:hidden overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {OFFERS.map((offer, i) => (
            <div key={offer.id} className="snap-start shrink-0">
              <OfferCard offer={offer} index={i} />
            </div>
          ))}
        </div>

        {/* Desktop : grille */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
          {OFFERS.map((offer, i) => (
            <OfferCard key={offer.id} offer={offer} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
