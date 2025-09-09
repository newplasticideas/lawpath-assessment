"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Logout button that calls /api/auth/logout (POST)
 * and then redirects back to "/".
 */
export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      // Call the API route
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Force navigation to login page
      router.push("/");
      router.refresh(); // ensures middleware sees cookie cleared
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-sm underline"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
