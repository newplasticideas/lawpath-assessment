/**
 * __tests__/application.auth.test.ts
 * Uses the Jest manual mock for @elastic/elasticsearch so esUserRepository
 * runs without a real cluster. Asserts against non-throwing use-cases:
 *   - success: { ok: true, token }
 *   - failure: { ok: false, error }
 */

import { jest } from "@jest/globals";
jest.mock("@elastic/elasticsearch");
// @ts-expect-error jest mock exposes test-only helper (__resetEsMock)
import { __resetEsMock } from "@elastic/elasticsearch";

import { esUserRepository } from "../src/infrastructure/es/userRepository";
import { makeRegister } from "../src/application/register";
import { makeLogin } from "../src/application/login";

const fakeHasher = {
  hash: async (pwd: string) => `h:${pwd}`,
  verify: async (pwd: string, hash: string) => hash === `h:${pwd}`,
};

const fakeSession = {
  sign: (claims: object) => `t:${(claims as any).username}`,
};

describe("register/login use-cases", () => {
  beforeEach(() => {
    __resetEsMock();
  });

  function users() {
    return esUserRepository({
      node: "https://dummy:9200",
      apiKey: "dummy",
      index: "nick-johnson-users",
    });
  }

  it("registers new user and logs in", async () => {
    const u = users();
    const register = makeRegister({
      users: u,
      hasher: fakeHasher as any,
      session: fakeSession as any,
    });
    const login = makeLogin({
      users: u,
      hasher: fakeHasher as any,
      session: fakeSession as any,
    });

    const r1 = await register({ username: "alice", password: "pw" });
    expect(r1.ok).toBe(true);

    const r2 = await login({ username: "alice", password: "pw" });
    expect(r2.ok).toBe(true);
    expect(r2.token).toBe("t:alice");
  });

  it("prevents duplicate usernames", async () => {
    const u = users();
    const register = makeRegister({
      users: u,
      hasher: fakeHasher as any,
      session: fakeSession as any,
    });

    const r1 = await register({ username: "bob", password: "pw" });
    expect(r1.ok).toBe(true);

    const r2 = await register({ username: "bob", password: "pw2" });
    expect(r2.ok).toBe(false);
    expect(r2.error?.toLowerCase()).toMatch(/taken/);
  });

  it("rejects invalid credentials", async () => {
    const u = users();
    const register = makeRegister({
      users: u,
      hasher: fakeHasher as any,
      session: fakeSession as any,
    });
    const login = makeLogin({
      users: u,
      hasher: fakeHasher as any,
      session: fakeSession as any,
    });

    const r1 = await register({ username: "chris", password: "secret" });
    expect(r1.ok).toBe(true);

    const bad1 = await login({ username: "chris", password: "bad" });
    expect(bad1.ok).toBe(false);
    expect(bad1.error?.toLowerCase()).toMatch(/invalid/);

    const bad2 = await login({ username: "nobody", password: "pw" });
    expect(bad2.ok).toBe(false);
    expect(bad2.error?.toLowerCase()).toMatch(/invalid/);
  });
});
