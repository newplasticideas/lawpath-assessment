import { SessionIssuer } from "../../core/ports";
import { signSession, verifySession } from "@/lib/auth";

/**
 * JWT-based session manager for issuing and verifying tokens.
 */
export function jwtSession(): SessionIssuer {
  return {
    /**
     * Issues a new JWT token for the given username.
     * @param username - The username for which the token is issued.
     * @returns A promise that resolves to the issued token.
     */
    async issue(username: string): Promise<string> {
      return await signSession({ sub: username, username: username }, 300);
    },

    /**
     * Verifies the given JWT token and extracts the username.
     * @param token - The token to verify.
     * @returns A promise that resolves to an object containing the username, or null if the token is invalid.
     */
    async verify(token: string): Promise<{ username: string } | null> {
      try {
        const payload = await verifySession(token);
        return { username: payload.username };
      } catch {
        return null;
      }
    },

    /**
     * Signs the given claims with a JWT, issuing a new token.
     * @param claims - The claims to include in the token.
     * @param ttlSec - Optional time-to-live for the token in seconds. Defaults to 300 seconds.
     * @returns A promise that resolves to the signed token.
     */
    async sign(
      claims: { sub: string; username: string },
      ttlSec?: number,
    ): Promise<string> {
      return await signSession(claims, ttlSec ?? 300);
    },
  };
}
