import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { availabilityQuerySchema } from "@/lib/validations/booking";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const parsed = availabilityQuerySchema.safeParse({
    listingId: searchParams.get("listingId"),
    checkIn: searchParams.get("checkIn"),
    checkOut: searchParams.get("checkOut"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { listingId, checkIn, checkOut } = parsed.data;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing introuvable" }, { status: 404 });
  }

  const overlapping = await prisma.booking.findMany({
    where: {
      listingId,
      status: { in: ["PENDING", "CONFIRMED"] },
      checkIn: { lt: checkOutDate },
      checkOut: { gt: checkInDate },
    },
    select: { checkIn: true, checkOut: true },
  });

  const blocked = await prisma.availability.findMany({
    where: {
      listingId,
      isBlocked: true,
      date: { gte: checkInDate, lt: checkOutDate },
    },
    select: { date: true },
  });

  const available = overlapping.length === 0 && blocked.length === 0;

  return NextResponse.json({
    listingId,
    checkIn,
    checkOut,
    available,
    conflictingBookings: overlapping,
    blockedDates: blocked.map((b) => b.date),
  });
}
