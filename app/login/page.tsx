"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ERR_INVALID_CREDENTIALS } from "@/src/core/constants";

type ApiError = { error?: string };

export default function LoginPage() {
  const r = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      setErr(j.error ?? ERR_INVALID_CREDENTIALS);
      setBusy(false);
      return;
    }
    r.push("/verifier");
  }

  return (
    <main>
      <div className="card">
        <div className="header">Login</div>
        <form onSubmit={submit} className="grid gap-3">
          <label htmlFor="username" className="font-semibold text-sm mb-1">
            Username
          </label>
          <input
            id="username"
            className="input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="password" className="font-semibold text-sm mb-1">
            Password
          </label>
          <input
            id="password"
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {err && <div className="error">{err}</div>}

          <button className="btn w-full" disabled={busy} onClick={submit}>
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>

        <p className="text-sm mt-2">
          Don’t have an account?{" "}
          <Link href="/register" className="underline text-blue-700">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
