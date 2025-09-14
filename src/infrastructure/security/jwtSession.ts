import { SessionIssuer } from "../../core/ports";
import { signSession, verifySession } from "@/lib/auth";

/**
 * JWT-based implementation of SessionIssuer.
 * Issues & verifies tokens containing only the username.
 */
export function jwtSession(): SessionIssuer {
  return {
    async issue(username: string): Promise<string> {
      return signSession({ sub: username, username: username }, 300);
    },

    async verify(token: string): Promise<{ username: string } | null> {
      try {
        const payload = verifySession(token);
        return { username: payload.username };
      } catch {
        return null;
      }
    },

    sign(claims: { sub: string; username: string }, ttlSec?: number): string {
      return signSession(claims, ttlSec ?? 300);
    },
  };
}
