import { useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";

const LOCATIONS = [
  {
    id: "goree",
    name: "Île de Gorée",
    desc: "Le site historique classé UNESCO, point de départ des tours culturels",
    lat: 14.6686,
    lng: -17.3966,
    zoom: 15,
    icon: "🏛️",
    color: "bg-[#2C7A5C]",
  },
  {
    id: "dakar",
    name: "Dakar — Plateau",
    desc: "Centre-ville de Dakar, départ des city tours et des excursions",
    lat: 14.6937,
    lng: -17.4441,
    zoom: 14,
    icon: "🏙️",
    color: "bg-[#1A1A2E]",
  },
  {
    id: "lacrose",
    name: "Lac Rose (Retba)",
    desc: "Phénomène naturel unique — extraction de sel et couleur rose",
    lat: 14.8366,
    lng: -17.2333,
    zoom: 14,
    icon: "🏜️",
    color: "bg-[#C2622D]",
  },
  {
    id: "bandia",
    name: "Réserve de Bandia",
    desc: "Safari — girafes, rhinocéros, antilopes dans leur habitat naturel",
    lat: 14.5497,
    lng: -16.9642,
    zoom: 13,
    icon: "🦒",
    color: "bg-[#D4A017]",
  },
  {
    id: "ngor",
    name: "Île de N'Gor",
    desc: "Plage préservée, surf, accès en pirogue depuis la plage de N'Gor",
    lat: 14.7470,
    lng: -17.5230,
    zoom: 15,
    icon: "🌊",
    color: "bg-blue-600",
  },
  {
    id: "saly",
    name: "Saly Portudal",
    desc: "Station balnéaire, plages, hôtels et restaurants en bord de mer",
    lat: 14.4573,
    lng: -16.9943,
    zoom: 14,
    icon: "🏖️",
    color: "bg-cyan-600",
  },
];

export function MapAdmin() {
  const [selected, setSelected] = useState(LOCATIONS[0]);

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${selected.lng - 0.05},${selected.lat - 0.04},${selected.lng + 0.05},${selected.lat + 0.04}&layer=mapnik&marker=${selected.lat},${selected.lng}`;
  const osmLink = `https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=${selected.zoom}/${selected.lat}/${selected.lng}`;

  return (
    <div className="space-y-6">

      <div className="bg-[#1A1A2E] rounded-xl p-4 text-white flex items-center gap-3">
        <MapPin className="w-5 h-5 text-[#D4A017] shrink-0" />
        <div>
          <div className="font-bold">Cartographie des sites — Sama Sénégal</div>
          <div className="text-white/50 text-xs">Cliquez sur un lieu pour afficher sa carte OpenStreetMap</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Liste des lieux */}
        <div className="space-y-2">
          {LOCATIONS.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelected(loc)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selected.id === loc.id
                  ? "border-[#2C7A5C] bg-[#2C7A5C]/5 shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${loc.color} flex items-center justify-center text-lg shrink-0`}>
                  {loc.icon}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[#1A1A2E] text-sm truncate">{loc.name}</div>
                  <div className="text-xs text-gray-400 line-clamp-2 leading-snug mt-0.5">{loc.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Carte OpenStreetMap */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selected.icon}</span>
                <div>
                  <div className="font-bold text-[#1A1A2E] text-sm">{selected.name}</div>
                  <div className="text-xs text-gray-400">
                    {selected.lat.toFixed(4)}° N, {Math.abs(selected.lng).toFixed(4)}° O
                  </div>
                </div>
              </div>
              <a
                href={osmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2C7A5C] hover:bg-[#245f49] text-white rounded-lg text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Ouvrir
              </a>
            </div>
            <iframe
              key={selected.id}
              src={mapSrc}
              width="100%"
              height="420"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              title={`Carte ${selected.name}`}
              allowFullScreen
            />
          </div>

          {/* Infos site */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm font-bold text-gray-700 mb-2">📍 À propos de ce site</div>
            <p className="text-sm text-gray-500">{selected.desc}</p>
            <div className="mt-3 flex gap-2">
              <a
                href={`https://maps.google.com/?q=${selected.lat},${selected.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
              >
                📍 Google Maps
              </a>
              <a
                href={`https://wa.me/221774188107?text=${encodeURIComponent(`🗺️ Lieu : ${selected.name}\nCoordonnées : ${selected.lat}, ${selected.lng}\nVoir sur Google Maps : https://maps.google.com/?q=${selected.lat},${selected.lng}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold transition-colors"
              >
                💬 Partager WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
