import { useEffect, useRef } from "react";

interface MapViewProps {
  address: string;
  name: string;
  lat?: number;
  lng?: number;
  height?: string;
}

export function MapView({ address, name, lat, lng, height = "200px" }: MapViewProps) {
  const query = encodeURIComponent(address || name);
  const embedUrl = lat && lng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`
    : `https://www.openstreetmap.org/export/embed.html?query=${query}&layer=mapnik`;

  const linkUrl = lat && lng
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`
    : `https://www.openstreetmap.org/search?query=${query}`;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
      <iframe
        src={embedUrl}
        style={{ width: "100%", height, border: 0 }}
        loading="lazy"
        title={`Carte ${name}`}
      />
      
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-gray-700 bg-gray-50 transition-colors"
      >
        📍 Voir sur OpenStreetMap
      </a>
    </div>
  );
}
