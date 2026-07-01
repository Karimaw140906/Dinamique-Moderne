"use client";
import { useState } from "react";

export default function SearchBar() {
  const [destination, setDestination] = useState("");
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    window.location.href = `/search?${params.toString()}`;
  }
  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 bg-white rounded-2xl md:rounded-full shadow-xl p-3 max-w-2xl mx-auto">
      <input type="text" placeholder="Où voulez-vous aller ? (Dakar, Saly, Casamance...)" value={destination} onChange={(e) => setDestination(e.target.value)} className="flex-1 px-4 py-3 rounded-full outline-none text-gray-800" />
      <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-full transition">Rechercher</button>
    </form>
  );
}
