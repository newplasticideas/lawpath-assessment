import {
  AddressInput,
  AddressValidator,
  VerificationLogRepository,
} from "../core/ports";
import { AddressValidation } from "../core/types";

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
