import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lp_sess")?.value;

  if (token) {
    redirect("/verifier");
  }

  redirect("/login");
}
