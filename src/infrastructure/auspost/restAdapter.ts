import {
  AddressInput,
  AddressValidation,
  AddressValidator,
} from "../../core/ports";

export function makeAusPostRestAdapter(opts: {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
}): AddressValidator {
  const timeout = opts.timeoutMs ?? 5000;

  async function call(path: string): Promise<any> {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(`${opts.baseUrl}${path}`, {
        headers: { Authorization: `Bearer ${opts.apiKey}` },
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`AusPost ${res.status}: ${text || res.statusText}`);
      }
      return res.json();
    } finally {
      clearTimeout(id);
    }
  }

  // You’ll need to adapt this to the *real* AusPost API response shape
  async function fetchLocalitiesByPostcode(
    postcode: string,
  ): Promise<Array<{ suburb: string; state: string }>> {
    const data = await call(
      `/localities?postcode=${encodeURIComponent(postcode)}`,
    );
    const list = Array.isArray(data?.localities) ? data.localities : [];
    return list.map((l: any) => ({
      suburb: String(l.name),
      state: String(l.state),
    }));
  }

  const VALID_STATES = new Set([
    "NSW",
    "VIC",
    "QLD",
    "SA",
    "WA",
    "TAS",
    "NT",
    "ACT",
  ]);
  const LONG_STATE: Record<string, string> = {
    NSW: "New South Wales",
    VIC: "Victoria",
    QLD: "Queensland",
    SA: "South Australia",
    WA: "Western Australia",
    TAS: "Tasmania",
    NT: "Northern Territory",
    ACT: "Australian Capital Territory",
  };

  return {
    async validate({
      postcode,
      suburb,
      state,
    }: AddressInput): Promise<AddressValidation> {
      if (!/^\d{4}$/.test(postcode))
        return { ok: false, message: "Postcode must be 4 digits." };
      if (!suburb.trim()) return { ok: false, message: "Suburb is required." };
      const S = state.toUpperCase();
      if (!VALID_STATES.has(S)) return { ok: false, message: "Invalid state." };

      let localities: Array<{ suburb: string; state: string }>;
      try {
        localities = await fetchLocalitiesByPostcode(postcode);
      } catch (e: any) {
        return { ok: false, message: `Address service error: ${e.message}` };
      }

      const match = localities.find(
        (l) => l.suburb.toLowerCase() === suburb.toLowerCase(),
      );
      if (!match) {
        return {
          ok: false,
          message: `The postcode ${postcode} does not match the suburb ${suburb}`,
        };
      }
      if (match.state.toUpperCase() !== S) {
        return {
          ok: false,
          message: `The suburb ${suburb} does not exist in the state ${LONG_STATE[S] ?? S} (${S})`,
        };
      }

      return {
        ok: true,
        message: "The postcode, suburb, and state input are valid.",
      };
    },
  };
}
