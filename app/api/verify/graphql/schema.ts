import { makeExecutableSchema } from "@graphql-tools/schema";

/**
 * GraphQL SDL
 * Keep this tiny: just the pieces the app needs.
 */
export const typeDefs = /* GraphQL */ `
  type LatLng {
    lat: Float
    lng: Float
  }

  type Validation {
    ok: Boolean!
    message: String!
    latLng: LatLng
  }

  type Query {
    validate(postcode: String!, suburb: String!, state: String!): Validation!
  }
`;

/**
 * Factory that binds a use-case (verifyAddress) into resolvers.
 * We inject the function so tests can pass a fake; app passes the real one.
 */
export function makeResolvers(
  verify: (
    username: string,
    args: { postcode: string; suburb: string; state: string },
  ) => Promise<{
    ok: boolean;
    message: string;
    latLng?: { lat: number; lng: number };
  }>,
) {
  return {
    Query: {
      validate: async (
        _parent: unknown,
        args: { postcode: string; suburb: string; state: string },
        ctx: { username?: string },
      ) => {
        if (!ctx?.username) {
          return { ok: false, message: "Unauthorized" };
        }
        return verify(ctx.username, args);
      },
    },
  };
}

/**
 * Build an executable schema from SDL + injected resolvers.
 */
export function makeSchema(
  verify: (
    username: string,
    args: { postcode: string; suburb: string; state: string },
  ) => Promise<{
    ok: boolean;
    message: string;
    latLng?: { lat: number; lng: number };
  }>,
) {
  return makeExecutableSchema({
    typeDefs,
    resolvers: makeResolvers(verify),
  });
}
