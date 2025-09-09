import bcrypt from "bcrypt";
import { PasswordHasher } from "../../core/ports";

/**
 * Production-ready bcrypt implementation of PasswordHasher.
 */
export function bcryptHasher(rounds = 10): PasswordHasher {
  return {
    async hash(raw: string): Promise<string> {
      return bcrypt.hash(raw, rounds);
    },
    async verify(raw: string, hash: string): Promise<boolean> {
      return bcrypt.compare(raw, hash);
    },
  };
}
