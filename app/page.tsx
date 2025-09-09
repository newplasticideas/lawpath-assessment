// app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export default async function RootPage() {
  const cookieStore = await cookies(); // <-- await it
  const token = cookieStore.get("lp_sess")?.value;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!); // valid session
      redirect("/verifier");
    } catch {
      // invalid/expired token -> fall through
    }
  }

  redirect("/login");
}
