/**
 * API route handler for user login.
 */

import { NextResponse } from "next/server";
import { composeServer } from "@/src/composition/server";
import { setSessionCookie } from "@/lib/auth";
export async function POST(req: Request) {
  const { username, password } = await req.json();
  const { usecases } = composeServer();

  const result = await usecases.login({ username, password });
  if (!result.ok)
    return NextResponse.json({ error: result.error }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, await result.token);
  return res;
}
