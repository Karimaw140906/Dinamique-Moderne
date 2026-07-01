import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createBookingSchema } from "@/lib/validations/booking";

const EXCLUSION_VIOLATION = "23P01";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { listingId, userId, checkIn, checkOut, guests } = parsed.data;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing introuvable" }, { status: 404 });
  }

  const nights = Math.max(
    1,
    Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86400000)
  );
  const totalPrice = Number(listing.basePrice) * nights;

  try {
    const booking = await prisma.$transaction(
      async (tx) => {
        const conflict = await tx.booking.findFirst({
          where: {
            listingId,
            status: { in: ["PENDING", "CONFIRMED"] },
            checkIn: { lt: checkOutDate },
            checkOut: { gt: checkInDate },
          },
        });

        if (conflict) {
          throw new Error("SLOT_TAKEN");
        }

        return tx.booking.create({
          data: {
            listingId,
            userId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests,
            totalPrice,
            status: "PENDING",
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_TAKEN") {
      return NextResponse.json(
        { error: "Ces dates ne sont plus disponibles" },
        { status: 409 }
      );
    }

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.meta as { code?: string } | undefined)?.code === EXCLUSION_VIOLATION
    ) {
      return NextResponse.json(
        { error: "Conflit de réservation détecté par la base de données" },
        { status: 409 }
      );
    }

    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
