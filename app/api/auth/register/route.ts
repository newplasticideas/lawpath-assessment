import { NextResponse } from "next/server";
import { buildServerServices } from "@/src/composition/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password required" },
      { status: 400 },
    );
  }

  const { usecases } = buildServerServices();
  const result = await usecases.register({ username, password });

  if (!result.ok)
    return NextResponse.json({ error: result.error }, { status: 400 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "lp_sess",
    value: result.token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res;
}
