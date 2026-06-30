import { useState } from "react";
import { Search, BedDouble, Zap, UtensilsCrossed, Car, Calendar, Users, ChevronDown } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

const TABS = [
  { id: "hebergements", label: "Hébergements", icon: BedDouble, anchor: "#hebergements" },
  { id: "activites",    label: "Activités",    icon: Zap,        anchor: "#activites" },
  { id: "restaurants",  label: "Restaurants",  icon: UtensilsCrossed, anchor: "#restaurants" },
  { id: "transports",   label: "Transports",   icon: Car,        anchor: "#transport" },
];

export function SearchBar() {
  const [activeTab, setActiveTab] = useState("hebergements");
  const [destination, setDestination] = useState("");
  const [dateArrivee, setDateArrivee] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [voyageurs, setVoyageurs] = useState("2 voyageurs");
  const { openBooking } = useBooking();

  const handleSearch = () => {
    const tab = TABS.find(t => t.id === activeTab);
    if (destination.trim()) {
      openBooking(destination.trim());
    } else if (tab) {
      document.querySelector(tab.anchor)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative z-20 -mt-8 md:-mt-12 mx-auto w-full max-w-5xl px-3 sm:px-4 md:px-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 px-2 pt-2 gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 min-h-[44px] ${
                  isActive
                    ? "bg-[#2C7A5C] text-white shadow-sm"
                    : "text-gray-500 hover:text-[#2C7A5C] hover:bg-[#2C7A5C]/5"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Fields */}
        <div className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:divide-x sm:divide-gray-200">
            {/* Destination */}
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

            {/* Date arrivée */}
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

            {/* Date départ */}
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

            {/* Voyageurs */}
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

            {/* Search button */}
            <div className="px-0 sm:pl-4 flex items-end sm:items-center">
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 bg-[#2C7A5C] hover:bg-[#245f49] text-white font-bold rounded-xl sm:rounded-2xl transition-all shadow-md hover:shadow-lg min-h-[48px] sm:min-h-[44px] active:scale-95">
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
