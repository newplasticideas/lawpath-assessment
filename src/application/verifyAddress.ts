import { AddressInput, AddressValidator, VerificationLogRepository } from "../core/ports";

export function makeVerifyAddress(deps: { validator: AddressValidator; logs: VerificationLogRepository }) {
  return async (username: string, input: AddressInput) => {
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
