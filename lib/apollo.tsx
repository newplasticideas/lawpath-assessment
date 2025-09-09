"use client";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react"; // <-- v4 path
import { ReactNode } from "react";

const client = new ApolloClient({
  link: new HttpLink({ uri: "/api/verify/graphql", credentials: "same-origin" }),
  cache: new InMemoryCache(),
});

export default function ApolloClientProvider({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
