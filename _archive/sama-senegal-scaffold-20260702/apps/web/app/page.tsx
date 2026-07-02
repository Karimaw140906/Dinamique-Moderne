import { prisma } from "@/lib/prisma";
import SearchBar from "@ui/components/SearchBar";
import DestinationCard from "@ui/components/DestinationCard";
import HotelCard from "@ui/components/HotelCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const destinations = await prisma.destination.findMany({ take: 4 });
  const hotels = await prisma.property.findMany({ take: 4, orderBy: { rating: "desc" }, include: { destination: true } });
  return (
    <main>
      <section className="bg-gradient-to-b from-sand to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-ocean mb-4">Découvrez le Sénégal, votre séjour commence ici</h1>
          <p className="text-gray-600 mb-8">Hôtels, activités et destinations authentiques, réservables en toute confiance.</p>
          <SearchBar />
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-ocean mb-6">Destinations phares</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{destinations.map((d) => (<DestinationCard key={d.id} slug={d.slug} name={d.name} imageUrl={d.imageUrl} region={d.region} />))}</div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-ocean mb-6">Hôtels populaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{hotels.map((h) => (<HotelCard key={h.id} slug={h.slug} name={h.name} imageUrl={h.imageUrl} pricePerNight={h.pricePerNight} rating={h.rating} destinationName={h.destination.name} />))}</div>
      </section>
    </main>
  );
}
