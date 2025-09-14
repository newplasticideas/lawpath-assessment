"use client";

import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import LogoutButton from "@/components/LogoutButton";
import { GoogleMapView } from "@/components/GoogleMapView";
import { VALID_STATES } from "@/src/core/constants";
import { StateAbbr, Coordinates } from "@/src/core/types";

const VALIDATE = gql`
  query Validate($postcode: String!, $suburb: String!, $state: String!) {
    validate(postcode: $postcode, suburb: $suburb, state: $state) {
      ok
      message
      coordinates {
        lat
        lng
      }
    }
  }
`;

type Form = { postcode: string; suburb: string; state: StateAbbr };
type ValidateResult = {
  ok: boolean;
  message: string;
  coordinates: Coordinates;
};
type ValidateQuery = { validate: ValidateResult };

const STORAGE_KEY = "verifierForm";

export default function VerifierPage() {
  const [form, setForm] = useState<Form>({
    postcode: "",
    suburb: "",
    state: "NSW",
  });
  const [run, { data, loading, error }] = useLazyQuery<ValidateQuery>(VALIDATE);

  // Restore form state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setForm(JSON.parse(saved));
  }, []);

  // Persist form state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    run({ variables: form });
  }

  return (
    <main>
      <div className="card">
        <div className="header">Address Verifier</div>
        <div className="flex justify-end mb-4">
          <LogoutButton />
        </div>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input
            className="input"
            placeholder="Postcode"
            value={form.postcode}
            onChange={(e) => set("postcode", e.target.value)}
          />
          <input
            className="input"
            placeholder="Suburb"
            value={form.suburb}
            onChange={(e) => set("suburb", e.target.value)}
          />
          <select
            className="input"
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
          >
            {VALID_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button disabled={loading} className="btn w-full">
            {loading ? "Validating..." : "Validate"}
          </button>
          {loading && (
            <div className="flex items-center gap-2 mt-4">
              <span className="loader" />
              <span>Validating address...</span>
            </div>
          )}
        </form>
        <section className="mt-4">
          {error && <div className="error">Network error</div>}
          {data?.validate && (
            <div className={data.validate.ok ? "success" : "error"}>
              {data.validate.message}
            </div>
          )}
        </section>
        {data?.validate.ok && data.validate?.coordinates && (
          <section className="mt-6">
            <GoogleMapView
              lat={data.validate.coordinates.lat}
              lng={data.validate.coordinates.lng}
            />
          </section>
        )}
      </div>
    </main>
  );
}
