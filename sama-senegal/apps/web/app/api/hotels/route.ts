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
