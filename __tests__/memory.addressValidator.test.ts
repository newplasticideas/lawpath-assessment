import { memoryAddressValidator } from "../src/infrastructure/es/addressValidator";

describe("memoryAddressValidator (structural only)", () => {
  const validator = memoryAddressValidator();

  it("fails on non-4-digit postcode", async () => {
    const res = await validator.validate({
      postcode: "12",
      suburb: "Sydney",
      state: "NSW",
    });
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/4 digits/i);
  });

  it("fails on empty suburb", async () => {
    const res = await validator.validate({
      postcode: "2000",
      suburb: "  ",
      state: "NSW",
    });
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/Suburb is required/i);
  });

  it("fails on invalid state", async () => {
    const res = await validator.validate({
      postcode: "2000",
      suburb: "Sydney",
      state: "NXX",
    });
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/Invalid state/i);
  });

  it("passes structurally valid input", async () => {
    const res = await validator.validate({
      postcode: "2000",
      suburb: "Sydney",
      state: "NSW",
    });
    expect(res.ok).toBe(true);
    expect(res.message).toMatch(/structurally valid/i);
  });
});
