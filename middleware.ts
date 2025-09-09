// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("lp_sess")?.value;

  // protect /verifier
  if (pathname.startsWith("/verifier")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  }

  // redirect logged-in users away from /login or /register
  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/verifier", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/verifier/:path*", "/login", "/register"] };
