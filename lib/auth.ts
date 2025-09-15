import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";

const COOKIE = "lp_sess";

/**
 * Signs a JWT session token with the given claims and TTL.
 * @param claims JWT claims (sub, username)
 * @param ttlSec Time-to-live in seconds (default: 8 hours)
 * @returns Signed JWT string
 */
export async function signSession(
  claims: { sub: string; username: string },
  ttlSec = 60 * 60 * 8,
) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const jwt = await new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setExpirationTime(`${ttlSec}s`)
    .sign(secret);
  return jwt;
}

/**
 * Verifies a JWT session token and returns its payload.
 * @param token JWT string
 * @returns Decoded claims (sub, username, exp)
 */
export async function verifySession(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  return payload as {
    sub: string;
    username: string;
    exp: number;
  };
}

/**
 * Sets the session cookie on the response.
 * @param res NextResponse object
 * @param token JWT string
 */
export function setSessionCookie(res: NextResponse, token: string) {
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set({
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 8),
  });
}

/**
 * Clears the session cookie on the response.
 * @param res NextResponse object
 */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({ name: COOKIE, value: "", path: "/", maxAge: 0 });
}
