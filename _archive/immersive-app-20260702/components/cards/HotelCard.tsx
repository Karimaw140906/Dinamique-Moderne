import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Hotel } from "@/lib/data/hotels";

export function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link href={`/hotels/${hotel.slug}`} className="group block">
      <Card className="overflow-hidden p-0">
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={hotel.images[0]}
            alt={hotel.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 right-3 rounded-full bg-bg-base/70 px-3 py-1 text-xs font-medium backdrop-blur-md">
            ★ {hotel.rating}
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold">{hotel.name}</h3>
          <p className="mt-1 text-sm text-text-secondary">{hotel.location}</p>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-bold text-primary">{hotel.pricePerNight}€</span>
            <span className="text-xs text-text-secondary">/ nuit</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
