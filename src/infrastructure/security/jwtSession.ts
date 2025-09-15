import { SessionIssuer } from "../../core/ports";
import { signSession, verifySession } from "@/lib/auth";

/**
 * JWT-based implementation of SessionIssuer.
 * Issues & verifies tokens containing only the username.
 */
export function jwtSession(): SessionIssuer {
  return {
    async issue(username: string): Promise<string> {
      return await signSession({ sub: username, username: username }, 300);
    },

    async verify(token: string): Promise<{ username: string } | null> {
      try {
        const payload = await verifySession(token);
        return { username: payload.username };
      } catch {
        return null;
      }
    },

    async sign(
      claims: { sub: string; username: string },
      ttlSec?: number,
    ): Promise<string> {
      return await signSession(claims, ttlSec ?? 300);
    },
  };
}
