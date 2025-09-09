import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  // Day 2 will create user in ES. For now, always OK so you can reach login.
  return NextResponse.json({ ok: true });
}
