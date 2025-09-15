import {
  AddressInput,
  AddressValidation,
  AddressValidator,
} from "../../core/ports";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  HttpLink,
} from "@apollo/client/core";
import fetch from "cross-fetch";

/**
 * Adapter for AusPost GraphQL address validation.
 */
export function makeAusPostGraphQLAdapter(opts: {
  endpoint: string;
  apiKey: string;
}): AddressValidator {
  const client = new ApolloClient({
    link: new HttpLink({
      uri: opts.endpoint,
      fetch,
      headers: { Authorization: `Bearer ${opts.apiKey}` },
    }),
    cache: new InMemoryCache(),
    defaultOptions: { query: { fetchPolicy: "no-cache" } },
  });

  const QUERY = gql`
    query Validate($postcode: String!, $suburb: String!, $state: String!) {
      validate(postcode: $postcode, suburb: $suburb, state: $state) {
        ok
        message
        coordinates {
          lat
          lng
        }
      }
    }
  `;

  type ValidateResult = { validate: AddressValidation };
  return {
    async validate(input: AddressInput): Promise<AddressValidation> {
      const { data } = await client.query<ValidateResult>({
        query: QUERY,
        variables: input,
      });
      if (!data?.validate) {
        throw new Error("No validation result from AusPost GraphQL API");
      }
      return data.validate;
    },
  };
}
