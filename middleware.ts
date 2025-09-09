import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/verifier"]; // add more later

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PROTECTED.some(p => pathname.startsWith(p))) {
    const token = req.cookies.get("auth")?.value;
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/verifier", "/verifier/:path*"],
};
