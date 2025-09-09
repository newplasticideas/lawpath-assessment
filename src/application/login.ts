import { PasswordHasher, SessionIssuer, UserRepository } from "../core/ports";

/**
 * Creates the login use case.
 * Authenticates a user and issues a session token.
 *
 * @param deps - Dependencies: user repository, password hasher, session issuer
 * @returns Async function to authenticate a user and issue a session token
 */
export function makeLogin(deps: { users: UserRepository; hasher: PasswordHasher; session: SessionIssuer }) {
  /**
   * Authenticates a user by username and password.
   * Throws an error if credentials are invalid.
   * Issues a session token on success.
   *
   * @param username - The username to authenticate
   * @param password - The password to verify
   * @returns An object containing the session token
   */
  return async (username: string, password: string) => {
    // Find user by username
    const user = await deps.users.findByUsername(username);
    if (!user) throw new Error("Invalid credentials");

    // Verify password
    const ok = await deps.hasher.verify(password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

    // Issue session token
    const token = await deps.session.issue(username);
    return { token };
  };
}