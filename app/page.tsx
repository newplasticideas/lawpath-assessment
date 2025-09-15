/**
 * Main landing page for the Lawpath Assessment app.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { useLocalStorage } from "@/lib/localStorage";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lp_sess")?.value;

  if (token) {
    redirect("/verifier");
  }

  redirect("/login");
}

// Example usage in a component:
function ExampleComponent() {
  // Instead of useState + useEffect with localStorage, use the hook:
  const [myValue, setMyValue] = useLocalStorage("myKey", "");

  // setMyValue("newValue") will persist to localStorage automatically
}
