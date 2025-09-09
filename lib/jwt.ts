import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export type Session = { username: string };

export function signJwt(payload: Session, expiresIn = "7d") {
  return jwt.sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + parseExpiry(expiresIn) },
    SECRET
  );
}

// Helper to parse "7d", "1h", etc. into seconds
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60; // default 7d
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 60 * 60;
    case "d": return value * 24 * 60 * 60;
    default: return 7 * 24 * 60 * 60;
  }
}

export function verifyJwt(token: string): Session | null {
  try { return jwt.verify(token, SECRET) as Session; } catch { return null; }
}