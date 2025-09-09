import { jest } from "@jest/globals";
jest.mock("@elastic/elasticsearch");

// Use the mocked client + in-memory ES store
// @ts-expect-error jest mock exposes test-only helper (__resetEsMock)
import { Client, __resetEsMock, __store } from "@elastic/elasticsearch";

import { buildSchema, execute, parse } from "graphql";

describe("GraphQL validate logs to Elasticsearch", () => {
  beforeEach(() => __resetEsMock());

  test("success path writes a verification log with userId", async () => {
    // 1) Build a minimal schema just for this test
    const sdl = /* GraphQL */ `
      type NormalizedAddress {
        postcode: String!
        suburb: String!
        state: String!
      }
      type ValidationResult {
        isValid: Boolean!
        normalized: NormalizedAddress
        errors: [String!]
      }
      type Query {
        validateAddress(
          postcode: String!
          suburb: String!
          state: String!
        ): ValidationResult!
      }
    `;
    const schema = buildSchema(sdl);

    // 2) Our verify function (stands in for AusPost)
    async function verifyFn(
      _username: string,
      args: { postcode: string; suburb: string; state: string },
    ) {
      return { ok: true as const, message: "ok", normalized: args };
    }

    // 3) Our logAttempt writes to mocked ES so assertions can see it
    const client = new Client({}); // mocked
    const VERIF_INDEX = "nick-johnson-verifications";

    async function logAttempt(entry: {
      userId: string;
      postcode: string;
      suburb: string;
      state: string;
      success: boolean;
      message: string;
    }) {
      await client.index({
        index: VERIF_INDEX,
        document: { ...entry, createdAt: new Date().toISOString() },
        refresh: "wait_for",
      });
    }

    // 4) Root resolver uses context.user.sub and calls both verify + logAttempt
    const rootValue = {
      async validateAddress(
        args: { postcode: string; suburb: string; state: string },
        context: { user?: { sub?: string } },
      ) {
        const userId = context?.user?.sub ?? "anonymous";
        const res = await verifyFn(userId, args);
        await logAttempt({
          userId,
          postcode: args.postcode,
          suburb: args.suburb,
          state: args.state,
          success: res.ok,
          message: res.message,
        });
        if (res.ok) {
          return { isValid: true, normalized: res.normalized, errors: [] };
        }
        return { isValid: false, normalized: null, errors: [res.message] };
      },
    };

    // 5) Execute query with a context that has user.sub
    const query = parse(/* GraphQL */ `
      query ($postcode: String!, $suburb: String!, $state: String!) {
        validateAddress(postcode: $postcode, suburb: $suburb, state: $state) {
          isValid
          normalized {
            postcode
            suburb
            state
          }
          errors
        }
      }
    `);
    const contextValue = { user: { sub: "user-123" } };

    const result = await execute({
      schema,
      document: query,
      rootValue,
      contextValue,
      variableValues: { postcode: "2007", suburb: "Broadway", state: "NSW" },
    });

    expect(result.errors).toBeUndefined();

    // 6) Assert ES (mock) received a verification log
    const keys = Object.keys(__store);
    const verifIndexKey =
      keys.find((k) => /verif/i.test(k)) ||
      keys.find((k) => k.endsWith("-verifications")) ||
      keys.find((k) => k.includes("verifications"));

    expect(verifIndexKey).toBeTruthy();

    const docs = __store[verifIndexKey!].docs;
    expect(docs.length).toBeGreaterThan(0);

    const last = docs[docs.length - 1];
    expect(last.userId).toBe("user-123");
    expect(last.postcode).toBe("2007");
    expect(String(last.suburb)).toBe("Broadway");
    expect(last.state).toBe("NSW");
    expect(typeof last.success).toBe("boolean");
    expect(last.message).toBe("ok");
  });
});
