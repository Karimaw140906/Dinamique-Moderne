import { Link } from "wouter";
import { useCurrency } from "@/lib/currency";

interface OfferCardProps {
  href: string;
  image?: string;
  emoji: string;
  title: string;
  category?: string;
  city?: string;
  rating?: number;
  price?: number;
  priceUnit?: string;
  whatsapp?: string;
  onBook?: () => void;
}

function waLink(phone: string) {
  return "https://wa.me/" + phone.replace(/\D/g, "");
}

export function OfferCard(props: OfferCardProps) {
  const { href, image, emoji, title, category, city, rating, price, priceUnit, whatsapp, onBook } = props;
  const { convertPrice } = useCurrency();
  const hasFooter = price !== undefined || !!whatsapp || !!onBook;

  function openWhatsapp() {
    if (whatsapp) window.open(waLink(whatsapp), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="group relative bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <Link href={href}>
        {image ? (
          <div className="h-48 overflow-hidden cursor-pointer">
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center cursor-pointer">
            <span className="text-5xl">{emoji}</span>
          </div>
        )}
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2 gap-2">
          <Link href={href} className="min-w-0">
            <h3 className="font-bold text-gray-900 text-lg leading-tight hover:text-[#2C7A5C] cursor-pointer transition-colors truncate">
              {title}
            </h3>
          </Link>
          {rating !== undefined && (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-yellow-400">*</span>
              <span className="text-sm font-medium text-gray-700">{rating}</span>
            </div>
          )}
        </div>

        {(category || city) && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {category && (
              <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                {category}
              </span>
            )}
            {city && <span className="text-xs text-gray-500">{city}</span>}
          </div>
        )}

        {hasFooter && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div>
              {price !== undefined && (
                <div className="text-base font-bold text-[#D4A017]">
                  {convertPrice(price)}
                  {priceUnit && <span className="text-xs text-gray-400 font-normal"> /{priceUnit}</span>}
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {whatsapp && (
                <button
                  onClick={openWhatsapp}
                  className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                >
                  WhatsApp
                </button>
              )}
              {onBook && (
                <button
                  onClick={onBook}
                  className="text-xs bg-[#2C7A5C] text-white px-3 py-1.5 rounded-lg hover:bg-[#1d5940] transition-colors"
                >
                  Reserver
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
