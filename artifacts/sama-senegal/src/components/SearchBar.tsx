import { useState } from "react";
import { Search, Compass, Calendar, Users, ChevronDown } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useLocation } from "wouter";

// Le site se concentre pour l'instant uniquement sur les destinations touristiques.
// Les onglets Hébergements/Activités/Restaurants/Transport sont retirés de la Home
// (les pages et données restent intactes, simplement non mises en avant côté client).
export function SearchBar() {
  const [destination, setDestination] = useState("");
  const [dateArrivee, setDateArrivee] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [voyageurs, setVoyageurs] = useState("2 voyageurs");
  const { openBooking } = useBooking();
  const [, navigate] = useLocation();

  const handleSearch = () => {
    if (destination.trim()) {
      openBooking(destination.trim());
    } else {
      navigate("/destinations");
    }
  };

  return (
    <div className="relative z-20 -mt-8 md:-mt-12 mx-auto w-full max-w-5xl px-3 sm:px-4 md:px-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => navigate("/simulateur")}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6C3EF5] to-[#8B5CF6] text-white font-bold text-sm hover:opacity-95 transition-opacity"
        >
          <Compass className="w-4 h-4" />
          Concevoir mon voyage de rêve au Sénégal
        </button>

        <div className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:divide-x sm:divide-gray-200">
            <div className="flex-1 flex flex-col px-0 sm:px-4 first:sm:pl-0 gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Gorée, Dakar, Lac Rose..."
                className="text-sm font-medium text-gray-800 placeholder-gray-400 outline-none bg-transparent min-h-[32px]"
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="flex items-center gap-2 px-0 sm:px-4 gap-1 flex-col sm:flex-row sm:items-start">
              <div className="w-full sm:w-auto flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Date d'arrivée</label>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    type="date"
                    value={dateArrivee}
                    onChange={e => setDateArrivee(e.target.value)}
                    className="text-sm text-gray-700 outline-none bg-transparent min-h-[32px] w-full"
                    placeholder="Arrivée"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 px-0 sm:px-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Date de départ</label>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="date"
                  value={dateDepart}
                  onChange={e => setDateDepart(e.target.value)}
                  className="text-sm text-gray-700 outline-none bg-transparent min-h-[32px] w-full"
                  placeholder="Départ"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 px-0 sm:px-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Voyageurs</label>
              <div className="relative flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={voyageurs}
                  onChange={e => setVoyageurs(e.target.value)}
                  className="text-sm text-gray-700 outline-none bg-transparent appearance-none cursor-pointer pr-5 min-h-[32px]">
                  {["1 voyageur", "2 voyageurs", "3 voyageurs", "4 voyageurs", "5+ voyageurs"].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-0 pointer-events-none" />
              </div>
            </div>

            <div className="px-0 sm:pl-4 flex items-end sm:items-center">
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 bg-[#6C3EF5] hover:bg-[#8B5CF6] text-white font-bold rounded-xl sm:rounded-2xl transition-all shadow-md hover:shadow-lg min-h-[48px] sm:min-h-[44px] active:scale-95">
                <Search className="w-4 h-4" />
                <span>Rechercher</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
