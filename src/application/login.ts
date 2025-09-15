import { UserRepository } from "../core/ports";
import { JWT_SHORT_TTL_SEC, ERR_INVALID_CREDENTIALS } from "../core/constants";

type Deps = {
  users: UserRepository;
  hasher: { verify(pwd: string, hash: string): Promise<boolean> };
  session: { sign(claims: object, ttlSec?: number): Promise<string> };
};

/**
 * Creates a login use-case handler.
 * @param deps - Dependencies: users repo, hasher, session
 * @returns Function to perform login
 */
export function makeLogin({ users, hasher, session }: Deps) {
  return async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    const user = await users.findByUsername(username);
    if (!user) return { ok: false as const, error: ERR_INVALID_CREDENTIALS };

    const ok = await hasher.verify(password, user.passwordHash);
    if (!ok) return { ok: false as const, error: ERR_INVALID_CREDENTIALS };

    const token = await session.sign(
      { sub: user.id, username: user.username },
      JWT_SHORT_TTL_SEC,
    );
    return {
      ok: true as const,
      token,
      user: { id: user.id, username: user.username },
    };
  };
}

/**
 * Attempts to log in a user.
 * @param params - Login parameters
 * @returns Result object with ok, token, or error
 */
export type LoginParams = {
  username: string;
  password: string;
};
