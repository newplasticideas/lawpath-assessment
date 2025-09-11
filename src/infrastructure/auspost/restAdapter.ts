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
    const url = `${opts.baseUrl}${path}`;
    try {
      const res = await fetch(url, {
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
    state?: string,
  ): Promise<
    Array<{
      suburb: string;
      state: string;
      latLng: { lat: number; lng: number };
    }>
  > {
    const params = [`q=${encodeURIComponent(postcode)}`];
    if (state) params.push(`state=${encodeURIComponent(state)}`);
    const query = "?" + params.join("&");
    const data = await call(query);

    // Defensive: handle missing, object, or array shapes
    const localities =
      data?.data?.localities?.locality ??
      data?.data?.localities ??
      data?.localities?.locality ??
      data?.localities ??
      [];

    const localityList = Array.isArray(localities)
      ? localities
      : localities
        ? [localities]
        : [];

    return localityList
      .map((locality: any) => ({
        suburb: locality?.location ?? locality?.name ?? "",
        state: locality?.state ?? "",
        latLng: {
          lat: parseFloat(locality?.latitude ?? "0"),
          lng: parseFloat(locality?.longitude ?? "0"),
        },
      }))
      .filter(
        (l) =>
          l.suburb && l.state && !isNaN(l.latLng.lat) && !isNaN(l.latLng.lng),
      );
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

      let localities: Array<{
        suburb: string;
        state: string;
        latLng: { lat: number; lng: number };
      }>;
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
        message: `${postcode}, ${suburb}, in ${state} is a valid match.`,
        latLng: { lat: match.latLng.lat, lng: match.latLng.lng },
      };
    },
  };
}
