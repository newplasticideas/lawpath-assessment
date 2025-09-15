"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useLocalStorage } from "@/lib/localStorage";

type ApiError = { error?: string };

export default function RegisterPage() {
  const r = useRouter();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [formState, setFormState] = useLocalStorage("register_form", {});

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
      setErr(j.error ?? "Registration failed");
      setBusy(false);
      return;
    }
    r.push("/verifier");
  }

  return (
    <main>
      <div className="card">
        <div className="header">Register</div>
        <form onSubmit={submit} className="grid gap-3">
          <label htmlFor="username" className="font-semibold text-sm mb-1">
            Username
          </label>
          <input
            id="username"
            className="input"
            placeholder="Username"
            value={username}
            onChange={(e) => setU(e.target.value)}
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
            onChange={(e) => setP(e.target.value)}
          />

          {err && <div className="error">{err}</div>}

          <button className="btn w-full" disabled={busy} onClick={submit}>
            {busy ? "Registering…" : "Register"}
          </button>
        </form>

        <p className="text-sm mt-2">
          Already have an account?{" "}
          <Link href="/login" className="underline text-blue-700">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
