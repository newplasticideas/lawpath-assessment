import jwt from "jsonwebtoken";
import { SessionIssuer } from "../../core/ports";

/**
 * JWT-based implementation of SessionIssuer.
 * Issues & verifies tokens containing only the username.
 */
export function jwtSession(secret: string): SessionIssuer {
  return {
    async issue(username: string): Promise<string> {
      return jwt.sign({ username }, secret, { expiresIn: "7d" });
    },

    async verify(token: string): Promise<{ username: string } | null> {
      try {
        const payload = jwt.verify(token, secret) as { username: string };
        return { username: payload.username };
      } catch {
        return null;
      }
    },
  };
}
