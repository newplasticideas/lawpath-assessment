import { NextRequest, NextResponse } from "next/server";
export async function POST() {
  const res = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
  res.cookies.set("auth", "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(0) });
  return res;
}
