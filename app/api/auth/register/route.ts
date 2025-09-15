import { NextResponse } from "next/server";
import { buildServerServices } from "@/src/composition/server";
import { setSessionCookie } from "@/lib/auth";

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
  setSessionCookie(res, await result.token);
  return res;
}
