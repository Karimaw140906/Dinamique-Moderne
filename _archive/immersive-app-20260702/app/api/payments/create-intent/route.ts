import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { createPaymentIntentSchema } from "@/lib/validations/booking";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
  : null;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createPaymentIntentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { bookingId, provider, phoneNumber } = parsed.data;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }
  if (booking.status !== "PENDING") {
    return NextResponse.json({ error: "Réservation non payable" }, { status: 409 });
  }

  const existing = await prisma.payment.findUnique({ where: { bookingId } });
  if (existing && existing.status === "SUCCEEDED") {
    return NextResponse.json({ error: "Réservation déjà payée" }, { status: 409 });
  }

  const amount = Number(booking.totalPrice);

  if (provider === "STRIPE") {
    if (!stripe) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY non configurée" },
        { status: 501 }
      );
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "xof",
      metadata: { bookingId },
    });

    const payment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        provider,
        amount,
        currency: "XOF",
        status: "PENDING",
        providerRef: intent.id,
      },
      update: { providerRef: intent.id, status: "PENDING" },
    });

    return NextResponse.json({
      payment,
      clientSecret: intent.client_secret,
    });
  }

  if (!phoneNumber) {
    return NextResponse.json(
      { error: "phoneNumber requis pour mobile money" },
      { status: 400 }
    );
  }

  const payment = await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      provider,
      amount,
      currency: "XOF",
      status: "PENDING",
      phoneNumber,
    },
    update: { phoneNumber, status: "PENDING" },
  });

  return NextResponse.json({
    payment,
    message: `Push USSD à envoyer au ${phoneNumber} (intégration ${provider} à câbler)`,
  });
}
