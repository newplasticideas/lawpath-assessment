import { jest } from "@jest/globals";
jest.mock("@elastic/elasticsearch");
// @ts-expect-error jest mock exposes test-only helper (__resetEsMock)
import { __resetEsMock, __store } from "@elastic/elasticsearch";

import { esUserRepository } from "@/src/infrastructure/es/userRepository";
import { makeRegister } from "@/src/application/register";

const fakeHasher = {
  hash: async (pwd: string) => `h:${pwd}`,
};
const fakeSession = { sign: () => "t:alice" };

describe("Register stores hashed password only", () => {
  beforeEach(() => __resetEsMock());

  test("ES user doc contains passwordHash and no plaintext", async () => {
    const users = esUserRepository({
      node: "https://dummy:9200",
      apiKey: "dummy",
      index: "nick-johnson-users",
    });
    const register = makeRegister({
      users,
      hasher: fakeHasher as any,
      session: fakeSession as any,
    });

    const res = await register({ username: "alice", password: "pw" });
    expect(res.ok).toBe(true);

    const idx = __store["nick-johnson-users"];
    expect(idx).toBeTruthy();
    const doc = idx.docs.find((d: any) => d.username === "alice");
    expect(doc).toBeTruthy();
    expect(doc.password).toBeUndefined();
    expect(doc.passwordHash).toBeDefined();
    expect(doc.passwordHash).toMatch(/^h:/);
  });
});
