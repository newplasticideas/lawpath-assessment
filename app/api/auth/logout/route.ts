import { NextResponse } from "next/server";

function clearSession(res: NextResponse) {
  res.cookies.set({
    name: "lp_sess",
    value: "",
    path: "/",
    maxAge: 0, // expire immediately
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url));
  clearSession(res);
  return res;
}

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url));
  clearSession(res);
  return res;
}
