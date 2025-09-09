import { NextRequest, NextResponse } from "next/server";
// Day 1: accept anything non-empty; Day 2: verify bcrypt + ES lookup + real JWT
export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) return NextResponse.json({ error: "Missing" }, { status: 400 });

  // Set a temporary cookie to satisfy middleware (replace with signed JWT Day 2)
  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth", `stub-${username}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return res;
}
