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
