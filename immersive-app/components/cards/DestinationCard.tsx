import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/lib/data/destinations";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group relative block h-80 overflow-hidden rounded-lg"
    >
      <Image
        src={destination.heroImage}
        alt={destination.name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6">
        <p className="text-xs uppercase tracking-widest text-primary">{destination.country}</p>
        <h3 className="mt-1 text-2xl font-bold">{destination.name}</h3>
      </div>
    </Link>
  );
}
