export interface Activity {
  slug: string;
  name: string;
  destination: string;
  category: string;
  duration: string;
  price: number;
  rating: number;
  description: string;
  highlights: string[];
  images: string[];
}

export const activities: Activity[] = [
  {
    slug: "sortie-peche-dakar",
    name: "Sortie pêche en haute mer",
    destination: "dakar",
    category: "Nature",
    duration: "4 heures",
    price: 55,
    rating: 4.7,
    description: "Embarquez au large de Dakar pour une matinée de pêche entre thons et barracudas.",
    highlights: ["Matériel fourni", "Skipper expérimenté", "Petit-déjeuner à bord"],
    images: ["https://picsum.photos/seed/peche-dakar-1/1200/800"],
  },
  {
    slug: "visite-ile-goree",
    name: "Visite guidée de l'île de Gorée",
    destination: "dakar",
    category: "Culture",
    duration: "3 heures",
    price: 35,
    rating: 4.9,
    description: "Traversez en bateau vers l'île de Gorée, classée au patrimoine mondial de l'UNESCO.",
    highlights: ["Guide francophone", "Traversée en bateau incluse", "Maison des Esclaves"],
    images: ["https://picsum.photos/seed/goree-1/1200/800"],
  },
  {
    slug: "cours-surf-saly",
    name: "Cours de surf débutant",
    destination: "saly",
    category: "Sport",
    duration: "2 heures",
    price: 28,
    rating: 4.6,
    description: "Initiez-vous au surf sur les vagues douces de Saly avec un moniteur certifié.",
    highlights: ["Planche incluse", "Combinaison fournie", "Groupe de 6 max"],
    images: ["https://picsum.photos/seed/surf-saly-1/1200/800"],
  },
  {
    slug: "balade-chameau-saly",
    name: "Balade à dos de chameau",
    destination: "saly",
    category: "Famille",
    duration: "1h30",
    price: 20,
    rating: 4.3,
    description: "Une balade paisible le long de la plage de Saly au coucher du soleil.",
    highlights: ["Adapté aux enfants", "Photos incluses", "Coucher de soleil"],
    images: ["https://picsum.photos/seed/chameau-saly-1/1200/800"],
  },
  {
    slug: "croisiere-fleuve-saint-louis",
    name: "Croisière sur le fleuve Sénégal",
    destination: "saint-louis",
    category: "Nature",
    duration: "2h30",
    price: 32,
    rating: 4.8,
    description: "Une croisière tranquille pour observer pélicans et flamants roses le long du fleuve.",
    highlights: ["Guide ornithologue", "Boissons incluses", "Petit groupe"],
    images: ["https://picsum.photos/seed/croisiere-sl-1/1200/800"],
  },
  {
    slug: "visite-quartier-colonial",
    name: "Visite du quartier colonial",
    destination: "saint-louis",
    category: "Culture",
    duration: "2 heures",
    price: 18,
    rating: 4.5,
    description: "Découvrez l'architecture unique de l'ancienne capitale de l'Afrique-Occidentale française.",
    highlights: ["Guide local", "Parcours à pied", "Pont Faidherbe"],
    images: ["https://picsum.photos/seed/quartier-colonial-1/1200/800"],
  },
];

export function getActivityBySlug(slug: string) {
  return activities.find((a) => a.slug === slug);
}

export function getActivitiesByDestination(destination: string) {
  return activities.filter((a) => a.destination === destination);
}
