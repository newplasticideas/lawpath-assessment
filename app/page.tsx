/**
 * Main landing page for the Lawpath Assessment app.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/src/core/constants";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    redirect("/verifier");
  }

  redirect("/login");
}
