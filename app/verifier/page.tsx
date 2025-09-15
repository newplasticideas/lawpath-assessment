"use client";

import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import LogoutButton from "@/components/LogoutButton";
import { GoogleMapView } from "@/components/GoogleMapView";
import { VALID_STATES } from "@/src/core/constants";
import { StateAbbr, Coordinates } from "@/src/core/types";
import { useLocalStorage } from "@/lib/localStorage";

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

export default function VerifierPage() {
  const [form, setForm] = useLocalStorage<Form>("verifierForm", {
    postcode: "",
    suburb: "",
    state: "NSW",
  });
  const [run, { data, loading, error }] = useLazyQuery<ValidateQuery>(VALIDATE);

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
          <label htmlFor="postcode" className="font-semibold text-sm mb-1">
            Postcode
          </label>
          <input
            id="postcode"
            className="input"
            placeholder="Postcode"
            value={form.postcode}
            onChange={(e) => set("postcode", e.target.value)}
          />
          <label htmlFor="suburb" className="font-semibold text-sm mb-1">
            Suburb
          </label>
          <input
            id="suburb"
            className="input"
            placeholder="Suburb"
            value={form.suburb}
            onChange={(e) => set("suburb", e.target.value)}
          />
          <label htmlFor="state" className="font-semibold text-sm mb-1">
            State
          </label>
          <select
            id="state"
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
            <div className="google-map-container">
              <GoogleMapView
                lat={data.validate.coordinates.lat}
                lng={data.validate.coordinates.lng}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
