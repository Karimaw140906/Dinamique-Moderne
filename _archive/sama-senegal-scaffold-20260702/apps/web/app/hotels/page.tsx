import { prisma } from "@/lib/prisma";
import HotelCard from "@ui/components/HotelCard";

export const dynamic = "force-dynamic";

export default async function HotelsPage({ searchParams }: { searchParams: { destination?: string } }) {
  const where = searchParams.destination ? { destination: { slug: searchParams.destination } } : {};
  const hotels = await prisma.property.findMany({ where, include: { destination: true }, orderBy: { rating: "desc" } });
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ocean mb-6">Hôtels {searchParams.destination ? `— ${searchParams.destination}` : ""} ({hotels.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{hotels.map((h) => (<HotelCard key={h.id} slug={h.slug} name={h.name} imageUrl={h.imageUrl} pricePerNight={h.pricePerNight} rating={h.rating} destinationName={h.destination.name} />))}</div>
      {hotels.length === 0 && <p className="text-gray-500">Aucun hôtel trouvé pour cette recherche.</p>}
    </main>
  );
}
