import { bcryptHasher } from "../src/infrastructure/security/bcryptHasher";

describe("bcryptHasher", () => {
  const hasher = bcryptHasher();

  it("hashes and verifies", async () => {
    const hash = await hasher.hash("pw");
    expect(hash).toMatch(/^\$2[aby]\$/);
    const ok = await hasher.verify("pw", hash);
    expect(ok).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hasher.hash("pw");
    const ok = await hasher.verify("wrong", hash);
    expect(ok).toBe(false);
  });
});
