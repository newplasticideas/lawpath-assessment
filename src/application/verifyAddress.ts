import {
  AddressInput,
  AddressValidator,
  VerificationLogRepository,
} from "../core/ports";
import { AddressValidation } from "../core/types";

/**
 * Creates a verifyAddress use-case handler.
 * @param deps - Dependencies: validator and logs repo
 * @returns Function to verify address and log attempt
 */
export function makeVerifyAddress(deps: {
  validator: AddressValidator;
  logs: VerificationLogRepository;
}) {
  return async (
    username: string,
    input: AddressInput,
  ): Promise<AddressValidation> => {
    const result = await deps.validator.validate(input);
    await deps.logs.log({
      username,
      input,
      result: result.ok ? "success" : "failure",
      error: result.ok ? undefined : result.message,
      ts: new Date().toISOString(),
    });
    return result;
  };
}

/**
 * Verifies an address and logs the attempt.
 * @param username - User performing verification
 * @param address - Address details
 * @returns Result object with ok and message
 */
export type VerifyAddressParams = {
  postcode: string;
  suburb: string;
  state: string;
};
