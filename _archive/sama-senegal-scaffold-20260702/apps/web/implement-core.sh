#!/usr/bin/env bash
set -e

if [ ! -f "package.json" ]; then
  echo "❌ Lance ce script depuis apps/web (package.json introuvable ici)."
  exit 1
fi

echo "📦 Installation des dépendances (Prisma, auth, validation)..."
npm install prisma @prisma/client bcryptjs jsonwebtoken zod --save
npm install -D @types/bcryptjs @types/jsonwebtoken

mkdir -p prisma
cat > prisma/schema.prisma <<'EOF'
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  name      String
  role      String    @default("tourist")
  createdAt DateTime  @default(now())
  bookings  Booking[]
  properties Property[]
}

model Destination {
  id          String     @id @default(cuid())
  slug        String     @unique
  name        String
  region      String
  description String
  imageUrl    String
  properties  Property[]
}

model Property {
  id            String      @id @default(cuid())
  slug          String      @unique
  name          String
  description   String
  pricePerNight Float
  rating        Float       @default(0)
  imageUrl      String
  destinationId String
  destination   Destination @relation(fields: [destinationId], references: [id])
  ownerId       String?
  owner         User?       @relation(fields: [ownerId], references: [id])
  bookings      Booking[]
  reviews       Review[]
  createdAt     DateTime    @default(now())
}

model Activity {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  price       Float
  imageUrl    String
  region      String
  createdAt   DateTime @default(now())
}

model Booking {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
  checkIn    DateTime
  checkOut   DateTime
  guests     Int
  totalPrice Float
  status     String   @default("pending")
  createdAt  DateTime @default(now())
}

model Review {
  id         String   @id @default(cuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
  authorName String
  rating     Int
  comment    String
  createdAt  DateTime @default(now())
}
EOF

if [ ! -f ".env" ]; then
  cat > .env <<'EOF'
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-secret-in-production-please"
STRIPE_SECRET_KEY="sk_test_REPLACE_ME"
WAVE_API_KEY="TODO"
ORANGE_MONEY_API_KEY="TODO"
EOF
fi

echo ".env" >> .gitignore
echo "dev.db" >> .gitignore
echo "prisma/dev.db" >> .gitignore

cat > prisma/seed.ts <<'EOF'
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
EOF

npm install -D tsx

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
pkg.prisma = { seed: 'tsx prisma/seed.ts' };
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

mkdir -p lib
cat > lib/prisma.ts <<'EOF'
import { PrismaClient } from "@prisma/client";
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
EOF

cat > lib/auth.ts <<'EOF'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
export async function hashPassword(password: string) { return bcrypt.hash(password, 10); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }
export function signToken(payload: { userId: string; role: string }) { return jwt.sign(payload, SECRET, { expiresIn: "7d" }); }
export function verifyToken(token: string): { userId: string; role: string } | null {
  try { return jwt.verify(token, SECRET) as { userId: string; role: string }; } catch { return null; }
}
EOF

mkdir -p app/api/auth/register app/api/auth/login "app/api/hotels/[slug]" app/api/destinations app/api/activities app/api/bookings app/api/payment/checkout

cat > app/api/auth/register/route.ts <<'EOF'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

const schema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });
  const token = signToken({ userId: user.id, role: user.role });
  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
EOF

cat > app/api/auth/login/route.ts <<'EOF'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

const schema = z.object({ email: z.string().email(), password: z.string() });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  const token = signToken({ userId: user.id, role: user.role });
  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
EOF

cat > app/api/hotels/route.ts <<'EOF'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minRating = searchParams.get("minRating");
  const where: any = {};
  if (destination) where.destination = { slug: destination };
  if (minPrice || maxPrice) {
    where.pricePerNight = {};
    if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
    if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
  }
  if (minRating) where.rating = { gte: parseFloat(minRating) };
  const hotels = await prisma.property.findMany({ where, include: { destination: true }, orderBy: { rating: "desc" } });
  return NextResponse.json({ hotels });
}
EOF

cat > "app/api/hotels/[slug]/route.ts" <<'EOF'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const hotel = await prisma.property.findUnique({ where: { slug: params.slug }, include: { destination: true, reviews: true } });
  if (!hotel) return NextResponse.json({ error: "Hôtel introuvable." }, { status: 404 });
  return NextResponse.json({ hotel });
}
EOF

cat > app/api/destinations/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() { const destinations = await prisma.destination.findMany(); return NextResponse.json({ destinations }); }
EOF

cat > app/api/activities/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() { const activities = await prisma.activity.findMany(); return NextResponse.json({ activities }); }
EOF

cat > app/api/bookings/route.ts <<'EOF'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const schema = z.object({ propertyId: z.string(), checkIn: z.string(), checkOut: z.string(), guests: z.number().min(1) });

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { propertyId, checkIn, checkOut, guests } = parsed.data;
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return NextResponse.json({ error: "Propriété introuvable." }, { status: 404 });
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
  const totalPrice = nights * property.pricePerNight;
  const booking = await prisma.booking.create({ data: { userId: payload.userId, propertyId, checkIn: new Date(checkIn), checkOut: new Date(checkOut), guests, totalPrice, status: "pending" } });
  return NextResponse.json({ booking });
}
EOF

cat > app/api/payment/checkout/route.ts <<'EOF'
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { bookingId, amount } = await req.json();
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === "sk_test_REPLACE_ME") {
    return NextResponse.json({ error: "Clé Stripe non configurée. Ajoute STRIPE_SECRET_KEY dans .env" }, { status: 501 });
  }
  return NextResponse.json({ message: "Stub — active Stripe avec ta clé et npm install stripe." });
}
EOF

mkdir -p ../../packages/ui/components

cat > ../../packages/ui/components/Header.tsx <<'EOF'
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-sand shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-ocean">Sama <span className="text-brand-600">Senegal</span></a>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
          <a href="/destinations" className="hover:text-brand-600">Destinations</a>
          <a href="/hotels" className="hover:text-brand-600">Hôtels</a>
          <a href="/activities" className="hover:text-brand-600">Activités</a>
          <a href="/explore" className="hover:text-brand-600">Explore</a>
        </nav>
        <a href="/auth/login" className="rounded-full bg-brand-600 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-700 transition">Connexion</a>
      </div>
    </header>
  );
}
EOF

cat > ../../packages/ui/components/Footer.tsx <<'EOF'
export default function Footer() {
  return (
    <footer className="bg-ocean text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div><h4 className="font-semibold mb-3">Sama Senegal</h4><p className="text-white/70">Découvrez et réservez vos séjours au Sénégal.</p></div>
        <div><h4 className="font-semibold mb-3">Explorer</h4><ul className="space-y-2 text-white/70"><li><a href="/destinations">Destinations</a></li><li><a href="/hotels">Hôtels</a></li><li><a href="/activities">Activités</a></li></ul></div>
        <div><h4 className="font-semibold mb-3">Support</h4><ul className="space-y-2 text-white/70"><li><a href="/help">Aide</a></li><li><a href="/contact">Contact</a></li></ul></div>
        <div><h4 className="font-semibold mb-3">Légal</h4><ul className="space-y-2 text-white/70"><li><a href="/legal/terms">CGU</a></li><li><a href="/legal/privacy">Confidentialité</a></li></ul></div>
      </div>
    </footer>
  );
}
EOF

cat > ../../packages/ui/components/HotelCard.tsx <<'EOF'
type HotelCardProps = { slug: string; name: string; imageUrl: string; pricePerNight: number; rating: number; destinationName?: string; };

export default function HotelCard({ slug, name, imageUrl, pricePerNight, rating, destinationName }: HotelCardProps) {
  return (
    <a href={`/hotels/${slug}`} className="group block rounded-2xl overflow-hidden border border-sand hover:shadow-lg transition">
      <div className="aspect-[4/3] overflow-hidden"><img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" /></div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <span className="flex items-center gap-1 text-sm text-brand-600 font-medium">★ {rating.toFixed(1)}</span>
        </div>
        {destinationName && <p className="text-sm text-gray-500 mt-1">{destinationName}</p>}
        <p className="mt-2 text-sm"><span className="font-bold text-ocean">{pricePerNight.toLocaleString()} FCFA</span><span className="text-gray-500"> / nuit</span></p>
      </div>
    </a>
  );
}
EOF

cat > ../../packages/ui/components/DestinationCard.tsx <<'EOF'
type DestinationCardProps = { slug: string; name: string; imageUrl: string; region?: string; };

export default function DestinationCard({ slug, name, imageUrl, region }: DestinationCardProps) {
  return (
    <a href={`/destinations/${slug}`} className="group relative block rounded-2xl overflow-hidden aspect-[3/4]">
      <img src={imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 text-white"><h3 className="text-lg font-bold">{name}</h3>{region && <p className="text-sm text-white/80">{region}</p>}</div>
    </a>
  );
}
EOF

cat > ../../packages/ui/components/SearchBar.tsx <<'EOF'
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
EOF

cat > ../../packages/ui/components/BottomNav.tsx <<'EOF'
export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sand flex justify-around py-2 z-50">
      <a href="/" className="text-xs text-gray-600 flex flex-col items-center gap-1"><span>🏠</span>Accueil</a>
      <a href="/search" className="text-xs text-gray-600 flex flex-col items-center gap-1"><span>🔍</span>Recherche</a>
      <a href="/account/wishlist" className="text-xs text-gray-600 flex flex-col items-center gap-1"><span>❤️</span>Favoris</a>
      <a href="/account/bookings" className="text-xs text-gray-600 flex flex-col items-center gap-1"><span>📋</span>Réservations</a>
      <a href="/account" className="text-xs text-gray-600 flex flex-col items-center gap-1"><span>👤</span>Compte</a>
    </nav>
  );
}
EOF

cat > app/layout.tsx <<'EOF'
import type { Metadata } from "next";
import "./globals.css";
import Header from "@ui/components/Header";
import Footer from "@ui/components/Footer";
import BottomNav from "@ui/components/BottomNav";

export const metadata: Metadata = { title: "Sama Senegal", description: "Découvrez et réservez vos séjours au Sénégal" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <div className="min-h-screen pb-16 md:pb-0">{children}</div>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
EOF

cat > app/page.tsx <<'EOF'
import { prisma } from "@/lib/prisma";
import SearchBar from "@ui/components/SearchBar";
import DestinationCard from "@ui/components/DestinationCard";
import HotelCard from "@ui/components/HotelCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const destinations = await prisma.destination.findMany({ take: 4 });
  const hotels = await prisma.property.findMany({ take: 4, orderBy: { rating: "desc" }, include: { destination: true } });
  return (
    <main>
      <section className="bg-gradient-to-b from-sand to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-ocean mb-4">Découvrez le Sénégal, votre séjour commence ici</h1>
          <p className="text-gray-600 mb-8">Hôtels, activités et destinations authentiques, réservables en toute confiance.</p>
          <SearchBar />
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-ocean mb-6">Destinations phares</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{destinations.map((d) => (<DestinationCard key={d.id} slug={d.slug} name={d.name} imageUrl={d.imageUrl} region={d.region} />))}</div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-ocean mb-6">Hôtels populaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{hotels.map((h) => (<HotelCard key={h.id} slug={h.slug} name={h.name} imageUrl={h.imageUrl} pricePerNight={h.pricePerNight} rating={h.rating} destinationName={h.destination.name} />))}</div>
      </section>
    </main>
  );
}
EOF

cat > app/hotels/page.tsx <<'EOF'
import { prisma } from "@/lib/prisma";
import HotelCard from "@ui/components/HotelCard";

export const dynamic = "force-dynamic";

export default async function HotelsPage({ searchParams }: { searchParams: { destination?: string } }) {
  const where = searchParams.destination ? { destination: { slug: searchParams.destination } } : {};
  const hotels = await prisma.property.findMany({ where, include: { destination: true }, orderBy: { rating: "desc" } });
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ocean mb-6">Hôtels {searchParams.destination ? `— ${searchParams.destination}` : ""} ({hotels.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{hotels.map((h) => (<HotelCard key={h.id} slug={h.slug} name={h.name} imageUrl={h.imageUrl} pricePerNight={h.pricePerNight} rating={h.rating} destinationName={h.destination.name} />))}</div>
      {hotels.length === 0 && <p className="text-gray-500">Aucun hôtel trouvé pour cette recherche.</p>}
    </main>
  );
}
EOF

cat > "app/hotels/[slug]/page.tsx" <<'EOF'
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HotelDetailPage({ params }: { params: { slug: string } }) {
  const hotel = await prisma.property.findUnique({ where: { slug: params.slug }, include: { destination: true, reviews: true } });
  if (!hotel) return notFound();
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-80 object-cover rounded-2xl mb-6" />
      <div className="flex justify-between items-start">
        <div><h1 className="text-3xl font-bold text-ocean">{hotel.name}</h1><p className="text-gray-500">{hotel.destination.name}</p></div>
        <span className="text-brand-600 font-semibold">★ {hotel.rating.toFixed(1)}</span>
      </div>
      <p className="mt-4 text-gray-700">{hotel.description}</p>
      <div className="mt-6 flex items-center justify-between border-t border-sand pt-6">
        <p className="text-xl font-bold text-ocean">{hotel.pricePerNight.toLocaleString()} FCFA <span className="text-sm text-gray-500 font-normal">/ nuit</span></p>
        <a href={`/booking?propertyId=${hotel.id}`} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-full transition">Réserver</a>
      </div>
    </main>
  );
}
EOF

cat > app/search/page.tsx <<'EOF'
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
EOF

echo "🗄️  Génération de la base de données SQLite + migration..."
npx prisma generate
npx prisma migrate dev --name init --skip-seed

echo "🌱 Peuplement de données de démo..."
npx prisma db seed

echo ""
echo "✅ Implémentation core terminée."
echo "▶️  Relance le serveur : npm run dev"
