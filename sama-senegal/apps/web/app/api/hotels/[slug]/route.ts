import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const hotel = await prisma.property.findUnique({ where: { slug: params.slug }, include: { destination: true, reviews: true } });
  if (!hotel) return NextResponse.json({ error: "Hôtel introuvable." }, { status: 404 });
  return NextResponse.json({ hotel });
}
