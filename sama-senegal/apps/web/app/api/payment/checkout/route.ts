import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { bookingId, amount } = await req.json();
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === "sk_test_REPLACE_ME") {
    return NextResponse.json({ error: "Clé Stripe non configurée. Ajoute STRIPE_SECRET_KEY dans .env" }, { status: 501 });
  }
  return NextResponse.json({ message: "Stub — active Stripe avec ta clé et npm install stripe." });
}
