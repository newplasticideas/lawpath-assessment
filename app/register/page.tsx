// app/register/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type ApiError = { error?: string };

export default function RegisterPage() {
  const r = useRouter();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as ApiError;
      setErr(j.error ?? "Could not register");
      setBusy(false);
      return;
    }
    r.push("/verifier");
  }

  return (
    <main className="mx-auto max-w-sm p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Register</h1>

      <input
        className="w-full border p-2 rounded"
        placeholder="Choose a username"
        value={username}
        onChange={(e) => setU(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Choose a password"
        type="password"
        value={password}
        onChange={(e) => setP(e.target.value)}
      />

      {err && <p className="text-red-600 text-sm">{err}</p>}

      <button
        className="px-3 py-2 bg-black text-white rounded w-full"
        disabled={busy}
        onClick={submit}
      >
        {busy ? "Creating account…" : "Create account"}
      </button>

      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </main>
  );
}
