import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HotelDetailPage({ params }: { params: { slug: string } }) {
  const hotel = await prisma.property.findUnique({ where: { slug: params.slug }, include: { destination: true, reviews: true } });
  if (!hotel) return notFound();
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-80 object-cover rounded-2xl mb-6" />
      <div className="flex justify-between items-start">
        <div><h1 className="text-3xl font-bold text-ocean">{hotel.name}</h1><p className="text-gray-500">{hotel.destination.name}</p></div>
        <span className="text-brand-600 font-semibold">★ {hotel.rating.toFixed(1)}</span>
      </div>
      <p className="mt-4 text-gray-700">{hotel.description}</p>
      <div className="mt-6 flex items-center justify-between border-t border-sand pt-6">
        <p className="text-xl font-bold text-ocean">{hotel.pricePerNight.toLocaleString()} FCFA <span className="text-sm text-gray-500 font-normal">/ nuit</span></p>
        <a href={`/booking?propertyId=${hotel.id}`} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-full transition">Réserver</a>
      </div>
    </main>
  );
}
