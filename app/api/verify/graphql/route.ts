import { NextRequest } from "next/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql } from "graphql";

const typeDefs = /* GraphQL */ `
  type Validation { ok: Boolean!, message: String! }
  type Query {
    validate(postcode: String!, suburb: String!, state: String!): Validation!
  }
`;

const resolvers = {
  Query: {
    // Day 1 stub — returns success if fields look non-empty, else a friendly message.
    // Day 2 will call AusPost REST here and log attempts to Elasticsearch.
    async validate(_: any, args: { postcode: string; suburb: string; state: string }) {
      const { postcode, suburb, state } = args;
      if (!/^\d{4}$/.test(postcode)) return { ok: false, message: "Postcode must be 4 digits." };
      if (!suburb.trim()) return { ok: false, message: "Suburb is required." };
      if (!["NSW","VIC","QLD","SA","WA","TAS","NT","ACT"].includes(state)) return { ok: false, message: "Invalid state." };
      return { ok: true, message: "Stub: validation ran (AusPost integration pending)." };
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get("query") || "";
  const variables = JSON.parse(url.searchParams.get("variables") || "{}");
  const result = await graphql({ schema, source: query, variableValues: variables, contextValue: {} });
  return Response.json(result);
}

export async function POST(req: NextRequest) {
  const { query, variables } = await req.json();
  const result = await graphql({ schema, source: query, variableValues: variables, contextValue: {} });
  return Response.json(result);
}
