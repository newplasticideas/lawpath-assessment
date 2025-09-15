import { graphql, type ExecutionResult } from "graphql";
import { makeSchema } from "../app/api/verify/graphql/schema";

type ValidateResult = { validate: { ok: boolean; message: string } };

// Fake verify use-case that matches the expected signature
async function fakeVerify(
  username: string,
  args: { postcode: string; suburb: string; state: string },
): Promise<{ ok: boolean; message: string }> {
  if (!username) throw new Error("no auth");
  if (!/^\d{4}$/.test(args.postcode)) {
    return { ok: false, message: "Postcode must be 4 digits." };
  }
  return { ok: true, message: "ok" };
}

describe("GraphQL validate schema", () => {
  const schema = makeSchema(fakeVerify);

  it("returns validation error message", async () => {
    const query = `query Validate($postcode: String!, $suburb: String!, $state: String!){
      validate(postcode: $postcode, suburb: $suburb, state: $state){ ok message }
    }`;

    const res = (await graphql({
      schema,
      source: query,
      variableValues: { postcode: "12", suburb: "Sydney", state: "NSW" },
      contextValue: { username: "alice" },
    })) as ExecutionResult<ValidateResult>;

    expect(res.data?.validate.ok).toBe(false);
    expect(res.data?.validate.message).toMatch(/4 digits/i);
  });

  it("succeeds when valid", async () => {
    const res = (await graphql({
      schema,
      source: `query{
        validate(postcode:"2000", suburb:"Sydney", state:"NSW"){ ok message }
      }`,
      contextValue: { username: "alice" },
    })) as ExecutionResult<ValidateResult>;

    expect(res.data?.validate.ok).toBe(true);
    expect(res.data?.validate.message).toBe("ok");
  });

  it("blocks when no username in context", async () => {
    const schemaWithAuthGate = makeSchema(async (u: string) => {
      if (!u) return { ok: false, message: "Unauthorized" };
      return { ok: true, message: "ok" };
    });

    const res = (await graphql({
      schema: schemaWithAuthGate,
      source: `query{
        validate(postcode:"2000", suburb:"Sydney", state:"NSW"){ ok message }
      }`,
      contextValue: {}, // no username
    })) as ExecutionResult<ValidateResult>;

    expect(res.data?.validate.ok).toBe(false);
    expect(res.data?.validate.message).toMatch(/unauthorized/i);
  });
});
