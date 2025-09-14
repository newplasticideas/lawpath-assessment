import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url));
  clearSessionCookie(res);
  return res;
}

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url));
  clearSessionCookie(res);
  return res;
}
