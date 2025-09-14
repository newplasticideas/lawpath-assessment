import { makeAusPostRestAdapter } from "@/src/infrastructure/auspost/restAdapter";

describe("AusPost REST adapter error handling", () => {
  it("returns a friendly error when API fails", async () => {
    const adapter = makeAusPostRestAdapter({
      baseUrl: "https://invalid-url.example.com",
      apiKey: "bad-key",
      timeoutMs: 100,
    });

    const result = await adapter.validate({
      postcode: "2000",
      suburb: "Sydney",
      state: "NSW",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/address service error/i);
  });
});
