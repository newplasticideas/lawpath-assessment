import bcrypt from "bcryptjs";

/**
 * Password hasher using bcrypt.
 */
export function bcryptHasher() {
  return {
    /**
     * Hashes a password.
     * @param password - The password to hash.
     * @returns The hashed password.
     */
    hash(password: string) {
      return bcrypt.hash(password, 10);
    },
    /**
     * Verifies a password against a hash.
     * @param password - The password to verify.
     * @param passwordHash - The hash to verify against.
     * @returns True if the password matches the hash, false otherwise.
     */
    verify(password: string, passwordHash: string) {
      return bcrypt.compare(password, passwordHash);
    },
  };
}
