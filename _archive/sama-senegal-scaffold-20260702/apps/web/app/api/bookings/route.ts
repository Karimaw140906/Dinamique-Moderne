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
