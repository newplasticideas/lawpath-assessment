import { PasswordHasher, SessionIssuer, UserRepository } from "../core/ports";

/**
 * Factory for the register use case.
 * Registers a new user, hashes their password, and issues a session token.
 *
 * @param deps - Dependencies: user repository, password hasher, session issuer
 * @returns Async function to register a user and issue a session token
 */
export function makeRegister(deps: { users: UserRepository; hasher: PasswordHasher; session: SessionIssuer }) {
  /**
   * Registers a new user.
   * Throws an error if the username is already taken.
   * Hashes the password and stores the user.
   * Issues a session token on success.
   *
   * @param username - The username to register
   * @param password - The password to hash and store
   * @returns An object containing the session token
   */
  return async (username: string, password: string) => {
    // Check if username already exists
    const exists = await deps.users.findByUsername(username);
    if (exists) throw new Error("Username already taken");

    // Hash the password
    const passwordHash = await deps.hasher.hash(password);

    // Store the new user
    await deps.users.create({
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    // Issue session token for the new user
    const token = await deps.session.issue(username);
    return { token };
  };
}