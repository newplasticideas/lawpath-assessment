// lib/auth.ts
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const COOKIE = "lp_sess";

export function signSession(
  claims: { sub: string; username: string },
  ttlSec = 60 * 60 * 8,
) {
  return jwt.sign(claims, process.env.JWT_SECRET!, { expiresIn: ttlSec });
}

export function verifySession(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!) as {
    sub: string;
    username: string;
    exp: number;
  };
}

export function setSessionCookie(res: NextResponse, token: string) {
  // In dev, allow non-HTTPS so the cookie actually sets.
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set({
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    // expires: new Date(Date.now() + 1000*60*60*8),
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({ name: COOKIE, value: "", path: "/", maxAge: 0 });
}
