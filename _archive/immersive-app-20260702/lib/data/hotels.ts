export interface Hotel {
  slug: string;
  name: string;
  destination: string;
  location: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  description: string;
  amenities: string[];
  images: string[];
}

export const hotels: Hotel[] = [
  {
    slug: "villa-azure-dakar",
    name: "Villa Azure",
    destination: "dakar",
    location: "Corniche, Dakar",
    pricePerNight: 145,
    rating: 4.8,
    reviews: 212,
    description:
      "Une villa contemporaine face à l'océan, pensée pour un séjour calme et raffiné au cœur de Dakar.",
    amenities: ["Piscine à débordement", "Vue mer", "Wifi gratuit", "Petit-déjeuner inclus", "Spa", "Parking privé"],
    images: [
      "https://picsum.photos/seed/villa-azure-1/1200/800",
      "https://picsum.photos/seed/villa-azure-2/1200/800",
      "https://picsum.photos/seed/villa-azure-3/1200/800",
    ],
  },
  {
    slug: "residence-almadies",
    name: "Résidence Almadies",
    destination: "dakar",
    location: "Almadies, Dakar",
    pricePerNight: 98,
    rating: 4.5,
    reviews: 143,
    description:
      "Appartements modernes à deux pas de la plage, idéal pour un séjour urbain et détendu.",
    amenities: ["Wifi gratuit", "Cuisine équipée", "Terrasse", "Salle de sport"],
    images: [
      "https://picsum.photos/seed/almadies-1/1200/800",
      "https://picsum.photos/seed/almadies-2/1200/800",
    ],
  },
  {
    slug: "lodge-saly-ocean",
    name: "Lodge Saly Océan",
    destination: "saly",
    location: "Saly Portudal",
    pricePerNight: 120,
    rating: 4.6,
    reviews: 189,
    description:
      "Un lodge en bord de plage entouré de jardins tropicaux, à quelques mètres du sable fin.",
    amenities: ["Piscine", "Plage privée", "Restaurant", "Wifi gratuit", "Bar"],
    images: [
      "https://picsum.photos/seed/saly-ocean-1/1200/800",
      "https://picsum.photos/seed/saly-ocean-2/1200/800",
    ],
  },
  {
    slug: "hotel-teranga-saly",
    name: "Hôtel Teranga",
    destination: "saly",
    location: "Centre, Saly",
    pricePerNight: 75,
    rating: 4.2,
    reviews: 97,
    description: "Un hôtel familial chaleureux, proche des commerces et de la plage.",
    amenities: ["Wifi gratuit", "Petit-déjeuner inclus", "Climatisation"],
    images: ["https://picsum.photos/seed/teranga-1/1200/800"],
  },
  {
    slug: "maison-coloniale-saint-louis",
    name: "Maison Coloniale",
    destination: "saint-louis",
    location: "Île de Saint-Louis",
    pricePerNight: 110,
    rating: 4.9,
    reviews: 156,
    description:
      "Une demeure historique restaurée avec soin, au cœur du quartier classé de Saint-Louis.",
    amenities: ["Wifi gratuit", "Petit-déjeuner inclus", "Cour intérieure", "Vue fleuve"],
    images: [
      "https://picsum.photos/seed/coloniale-1/1200/800",
      "https://picsum.photos/seed/coloniale-2/1200/800",
    ],
  },
  {
    slug: "riad-fleuve-saint-louis",
    name: "Riad du Fleuve",
    destination: "saint-louis",
    location: "Sor, Saint-Louis",
    pricePerNight: 88,
    rating: 4.4,
    reviews: 74,
    description: "Un riad paisible sur les rives du fleuve Sénégal, à l'atmosphère intimiste.",
    amenities: ["Wifi gratuit", "Terrasse", "Petit-déjeuner inclus"],
    images: ["https://picsum.photos/seed/riad-fleuve-1/1200/800"],
  },
];

export function getHotelBySlug(slug: string) {
  return hotels.find((h) => h.slug === slug);
}

export function getHotelsByDestination(destination: string) {
  return hotels.filter((h) => h.destination === destination);
}
