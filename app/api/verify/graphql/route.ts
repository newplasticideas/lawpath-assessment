import { NextRequest } from "next/server";
import { graphql } from "graphql";
import { composeServer } from "@/src/composition/server";
import { makeSchema } from "./schema";

async function getCtx(
  req: NextRequest,
  verifyToken: (t: string) => Promise<{ username: string } | null>,
) {
  const token = req.cookies.get("lp_sess")?.value || "";
  const session = await verifyToken(token);
  return { username: session?.username };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { usecases, session } = composeServer();
  const schema = makeSchema(usecases.verifyAddress);
  const contextValue = {
    ...(await getCtx(req, session.verify)),
    headers: Object.fromEntries(req.headers.entries()),
  };
  const result = await graphql({
    schema,
    source: body.query,
    variableValues: body.variables,
    contextValue,
  });
  return Response.json(result);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get("query") || "";
  const variables = JSON.parse(url.searchParams.get("variables") || "{}");
  const { usecases, session } = composeServer();
  const schema = makeSchema(usecases.verifyAddress);
  const contextValue = {
    ...(await getCtx(req, session.verify)),
    headers: Object.fromEntries(req.headers.entries()),
  };
  const result = await graphql({
    schema,
    source: query,
    variableValues: variables,
    contextValue,
  });
  return Response.json(result);
}
