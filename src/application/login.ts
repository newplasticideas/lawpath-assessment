import { PasswordHasher, SessionIssuer, UserRepository } from "../core/ports";

type Deps = {
  users: UserRepository;
  hasher: { verify(pwd: string, hash: string): Promise<boolean> };
  session: { sign(claims: object, ttlSec?: number): string };
};

export function makeLogin({ users, hasher, session }: Deps) {
  return async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    const user = await users.findByUsername(username);
    if (!user) return { ok: false as const, error: "Invalid credentials" };

    const ok = await hasher.verify(password, user.passwordHash);
    if (!ok) return { ok: false as const, error: "Invalid credentials" };

    const token = session.sign(
      { sub: user.id, username: user.username },
      60 * 60 * 8,
    );
    return {
      ok: true as const,
      token,
      user: { id: user.id, username: user.username },
    };
  };
}
