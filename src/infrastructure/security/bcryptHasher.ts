// infrastructure/security/bcryptHasher.ts
import bcrypt from "bcryptjs";

export function bcryptHasher() {
  return {
    hash(password: string) {
      return bcrypt.hash(password, 10);
    },
    verify(password: string, passwordHash: string) {
      return bcrypt.compare(password, passwordHash);
    },
  };
}
