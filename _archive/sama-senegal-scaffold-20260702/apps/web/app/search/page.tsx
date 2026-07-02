"use client";
import { useEffect, useState } from "react";
import HotelCard from "@ui/components/HotelCard";

export default function SearchPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    fetch(`/api/hotels?${params.toString()}`).then((r) => r.json()).then((data) => setHotels(data.hotels || [])).finally(() => setLoading(false));
  }, []);
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ocean mb-6">Résultats de recherche</h1>
      {loading && <p className="text-gray-500">Chargement...</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{hotels.map((h) => (<HotelCard key={h.id} slug={h.slug} name={h.name} imageUrl={h.imageUrl} pricePerNight={h.pricePerNight} rating={h.rating} destinationName={h.destination?.name} />))}</div>
      {!loading && hotels.length === 0 && <p className="text-gray-500">Aucun résultat.</p>}
    </main>
  );
}
