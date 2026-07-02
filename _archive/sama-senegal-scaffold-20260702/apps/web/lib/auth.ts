import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
export async function hashPassword(password: string) { return bcrypt.hash(password, 10); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }
export function signToken(payload: { userId: string; role: string }) { return jwt.sign(payload, SECRET, { expiresIn: "7d" }); }
export function verifyToken(token: string): { userId: string; role: string } | null {
  try { return jwt.verify(token, SECRET) as { userId: string; role: string }; } catch { return null; }
}
