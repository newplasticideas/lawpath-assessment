import { AddressInput, AddressValidation, AddressValidator } from "../../core/ports";
import fetch from "node-fetch";

export function makeAusPostRestAdapter(opts: { baseUrl: string; apiKey: string }): AddressValidator {
  return {
    async validate({ postcode, suburb, state }: AddressInput): Promise<AddressValidation> {
      // Call REST endpoints, normalize to AddressValidation
      const res = await fetch(`${opts.baseUrl}/...`, { headers: { "Authorization": `Bearer ${opts.apiKey}` }});
      // ... map AusPost payloads to {ok,message,latLng?}
      return { ok: true, message: "The postcode, suburb, and state input are valid." };
    }
  };
}
