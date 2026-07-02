export interface Destination {
  slug: string;
  name: string;
  country: string;
  tagline: string;
  description: string;
  heroImage: string;
  gallery: string[];
}

export const destinations: Destination[] = [
  {
    slug: "dakar",
    name: "Dakar",
    country: "Sénégal",
    tagline: "L'énergie de la capitale face à l'Atlantique",
    description:
      "Entre marchés animés, corniche sauvage et histoire profonde, Dakar est une ville qui se vit à toute vitesse. Ses quartiers contrastés, des Almadies chics à l'île de Gorée chargée de mémoire, en font une destination à multiples visages.",
    heroImage: "https://picsum.photos/seed/dest-dakar-hero/1600/900",
    gallery: [
      "https://picsum.photos/seed/dest-dakar-1/800/600",
      "https://picsum.photos/seed/dest-dakar-2/800/600",
      "https://picsum.photos/seed/dest-dakar-3/800/600",
    ],
  },
  {
    slug: "saly",
    name: "Saly",
    country: "Sénégal",
    tagline: "La station balnéaire de la Petite Côte",
    description:
      "Réputée pour ses plages de sable fin et son climat clément toute l'année, Saly est le point de départ idéal pour se ressourcer, entre farniente, sports nautiques et rencontres avec la faune locale.",
    heroImage: "https://picsum.photos/seed/dest-saly-hero/1600/900",
    gallery: [
      "https://picsum.photos/seed/dest-saly-1/800/600",
      "https://picsum.photos/seed/dest-saly-2/800/600",
      "https://picsum.photos/seed/dest-saly-3/800/600",
    ],
  },
  {
    slug: "saint-louis",
    name: "Saint-Louis",
    country: "Sénégal",
    tagline: "L'ancienne capitale, entre fleuve et océan",
    description:
      "Classée au patrimoine mondial de l'UNESCO, Saint-Louis séduit par son architecture coloniale colorée, ses ruelles paisibles et la douceur de vivre le long du fleuve Sénégal.",
    heroImage: "https://picsum.photos/seed/dest-sl-hero/1600/900",
    gallery: [
      "https://picsum.photos/seed/dest-sl-1/800/600",
      "https://picsum.photos/seed/dest-sl-2/800/600",
      "https://picsum.photos/seed/dest-sl-3/800/600",
    ],
  },
];

export function getDestinationBySlug(slug: string) {
  return destinations.find((d) => d.slug === slug);
}
