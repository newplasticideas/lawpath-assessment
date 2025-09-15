import { UserRepository } from "../core/ports";
import { JWT_SHORT_TTL_SEC, ERR_USERNAME_TAKEN } from "../core/constants";

type Deps = {
  users: UserRepository;
  hasher: { hash(pwd: string): Promise<string> };
  session: { sign(claims: object, ttlSec?: number): Promise<string> };
};

/**
 * Creates a register use-case handler.
 * @param deps - Dependencies: users repo, hasher, session
 * @returns Function to perform registration
 */
export function makeRegister({ users, hasher, session }: Deps) {
  return async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    const existing = await users.findByUsername(username);
    if (existing) {
      return { ok: false as const, error: ERR_USERNAME_TAKEN };
    }

    const passwordHash = await hasher.hash(password);
    const user = {
      id: crypto.randomUUID(),
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await users.create(user);
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
 * Attempts to register a new user.
 * @param params - Registration parameters
 * @returns Result object with ok, token, or error
 */
export type RegisterParams = {
  username: string;
  password: string;
};
