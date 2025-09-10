import { UserRepository } from "../core/ports";

type Deps = {
  users: UserRepository;
  hasher: { hash(pwd: string): Promise<string> };
  session: { sign(claims: object, ttlSec?: number): string };
};

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
      return { ok: false as const, error: "Username taken" };
    }

    const passwordHash = await hasher.hash(password);
    const user = {
      id: crypto.randomUUID(),
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await users.create(user); // repo stores user object (no plaintext password!)
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
