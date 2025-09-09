"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const next = new URLSearchParams(window.location.search).get("next") || "/verifier";
      window.location.href = next;
    } else {
      const j = await res.json().catch(() => ({}));
      setErr(j?.error || "Login failed");
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="border p-2" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="border p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="text-red-600">{err}</p>}
        <button className="bg-black text-white p-2 rounded">Login</button>
      </form>
      <p className="mt-3 text-sm">
        No account? <a className="underline" href="/register">Register</a>
      </p>
    </main>
  );
}
