// app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type ApiError = { error?: string };

export default function LoginPage() {
  const r = useRouter();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as ApiError;
      setErr(j.error ?? "Invalid credentials");
      setBusy(false);
      return;
    }
    r.push("/verifier");
  }

  return (
    <main className="mx-auto max-w-sm p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Login</h1>

      <input
        className="w-full border p-2 rounded"
        placeholder="Username"
        value={username}
        onChange={(e) => setU(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Password"
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
        {busy ? "Signing in…" : "Login"}
      </button>

      <p className="text-sm">
        Don’t have an account?{" "}
        <Link href="/register" className="underline">
          Register
        </Link>
      </p>
    </main>
  );
}
