"use client";
import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

const VALIDATE = gql`
  query Validate($postcode: String!, $suburb: String!, $state: String!) {
    validate(postcode: $postcode, suburb: $suburb, state: $state) {
      ok
      message
    }
  }
`;

type Form = { postcode: string; suburb: string; state: string };
type ValidateResult = { ok: boolean; message: string };
type ValidateQuery = { validate: ValidateResult };


const STORAGE_KEY = "verifierForm";

export default function VerifierPage() {
  const [form, setForm] = useState<Form>({ postcode: "", suburb: "", state: "NSW" });
  const [run, { data, loading, error }] = useLazyQuery<ValidateQuery>(VALIDATE);


  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setForm(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  function set<K extends keyof Form>(k: K, v: string) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    run({ variables: form });
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Address Verifier</h1>
        <form action="/api/auth/logout" method="POST">
          <button className="text-sm underline">Logout</button>
        </form>
      </header>

      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border p-2" placeholder="Postcode" value={form.postcode} onChange={e=>set("postcode", e.target.value)} />
        <input className="border p-2" placeholder="Suburb" value={form.suburb} onChange={e=>set("suburb", e.target.value)} />
        <select className="border p-2" value={form.state} onChange={e=>set("state", e.target.value)}>
          {["NSW","VIC","QLD","SA","WA","TAS","NT","ACT"].map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <button disabled={loading} className="bg-black text-white p-2 rounded">
          {loading ? "Validating..." : "Validate"}
        </button>
      </form>

        <section className="mt-4">
            {error && <p className="text-red-600">Network error</p>}
            {data?.validate && (
                <p className={data.validate.ok ? "text-green-700" : "text-red-700"}>
                {data.validate.message}
                </p>
            )}
        </section>
    </main>
  );
}
