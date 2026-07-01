import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const destinations = await Promise.all([
    prisma.destination.create({ data: { slug: "dakar", name: "Dakar", region: "Dakar", description: "La capitale vibrante du Sénégal.", imageUrl: "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=800" } }),
    prisma.destination.create({ data: { slug: "saly", name: "Saly", region: "Thiès", description: "La station balnéaire de la Petite Côte.", imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800" } }),
    prisma.destination.create({ data: { slug: "casamance", name: "Casamance", region: "Casamance", description: "Nature luxuriante et bolongs.", imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800" } }),
    prisma.destination.create({ data: { slug: "saint-louis", name: "Saint-Louis", region: "Saint-Louis", description: "Patrimoine mondial UNESCO.", imageUrl: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=800" } })
  ]);

  const properties = [
    { slug: "hotel-teranga-dakar", name: "Hôtel Teranga", price: 65000, rating: 4.5, dest: destinations[0], img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
    { slug: "residence-almadies", name: "Résidence Les Almadies", price: 85000, rating: 4.7, dest: destinations[0], img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800" },
    { slug: "royal-saly-resort", name: "Royal Saly Resort", price: 95000, rating: 4.8, dest: destinations[1], img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800" },
    { slug: "lodge-casamance-bolong", name: "Lodge du Bolong", price: 55000, rating: 4.6, dest: destinations[2], img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800" },
    { slug: "maison-coloniale-saint-louis", name: "Maison Coloniale", price: 45000, rating: 4.4, dest: destinations[3], img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800" }
  ];

  for (const p of properties) {
    await prisma.property.create({ data: { slug: p.slug, name: p.name, description: `${p.name} — un séjour authentique au cœur de ${p.dest.name}.`, pricePerNight: p.price, rating: p.rating, imageUrl: p.img, destinationId: p.dest.id } });
  }

  const activities = [
    { slug: "safari-bandia", name: "Safari au Parc de Bandia", price: 25000, region: "Thiès", img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800" },
    { slug: "iles-madeleine", name: "Excursion Îles de la Madeleine", price: 30000, region: "Dakar", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800" },
    { slug: "reserve-bandia-culture", name: "Découverte culturelle de Gorée", price: 20000, region: "Dakar", img: "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=800" }
  ];

  for (const a of activities) {
    await prisma.activity.create({ data: { slug: a.slug, name: a.name, description: `${a.name} — une expérience incontournable.`, price: a.price, imageUrl: a.img, region: a.region } });
  }

  console.log("✅ Seed terminé.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
