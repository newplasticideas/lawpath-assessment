import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("lp_sess")?.value;
  const secret = process.env.JWT_SECRET;
  let isValid = false;

  if (token && secret) {
    try {
      // jose expects the secret as a Uint8Array
      await jwtVerify(token, new TextEncoder().encode(secret));
      isValid = true;
    } catch (e) {
      isValid = false;
    }
  }

  // protect /verifier
  if (pathname.startsWith("/verifier")) {
    if (!token || !isValid)
      return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  }

  // redirect logged-in users away from /login or /register
  if ((pathname === "/login" || pathname === "/register") && isValid) {
    return NextResponse.redirect(new URL("/verifier", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/verifier/:path*", "/login", "/register"] };
