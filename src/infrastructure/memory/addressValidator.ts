import { AddressInput, AddressValidation, AddressValidator } from "../../core/ports";

/**
 * In-memory address validator (production-safe stub).
 *
 * Performs only structural validation:
 *  - Postcode must be 4 digits
 *  - Suburb must be non-empty
 *  - State must be one of the 8 Australian state/territory abbreviations
 *
 * Always returns success if the input passes the structural rules.
 * This ensures the validator is deterministic and side-effect free,
 * while being easy to swap out for a real AusPost adapter in production.
 */
export function memoryAddressValidator(): AddressValidator {
  return {
    async validate({ postcode, suburb, state }: AddressInput): Promise<AddressValidation> {
      // 1. Postcode check
      if (!/^\d{4}$/.test(postcode)) {
        return { ok: false, message: "Postcode must be 4 digits." };
      }

      // 2. Suburb non-empty
      if (!suburb.trim()) {
        return { ok: false, message: "Suburb is required." };
      }

      // 3. State must be valid AU abbreviation
      const validStates = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];
      if (!validStates.includes(state.toUpperCase())) {
        return { ok: false, message: "Invalid state." };
      }

      // 4. Default: valid (no external checks here)
      return { ok: true, message: "The postcode, suburb, and state input are structurally valid." };
    },
  };
}
