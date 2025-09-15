import { User, UserRepository } from "../../core/ports";
import { Client, errors as EsErrors } from "@elastic/elasticsearch";

type EsRepoOpts = {
  node: string;
  apiKey: string;
  index: string;
};

/**
 * Elasticsearch-backed user repository implementation.
 * - Ensures index exists with keyword mappings.
 * - findByUsername() uses a term query on keyword field.
 * - create() returns the stored user and enforces unique username.
 *
 * NOTE: Match client version to cluster:
 *   - ES 8.x  →  @elastic/elasticsearch@8
 *   - ES 9.x  →  @elastic/elasticsearch@9
 */
export function esUserRepository(opts: EsRepoOpts): UserRepository {
  const client = new Client({ node: opts.node, auth: { apiKey: opts.apiKey } });
  const index = opts.index;

  let ensureIndexOnce: Promise<void> | null = null;
  async function ensureIndex(): Promise<void> {
    if (!ensureIndexOnce) {
      ensureIndexOnce = (async () => {
        const exists = await client.indices.exists({ index });
        if (!exists) {
          await client.indices.create({
            index,
            settings: { number_of_shards: 1, number_of_replicas: 0 },
            mappings: {
              properties: {
                id: { type: "keyword" },
                username: { type: "keyword" },
                passwordHash: { type: "keyword" },
                createdAt: { type: "date" },
              },
            },
          });
        }
      })().catch((e) => {
        ensureIndexOnce = null;
        throw e;
      });
    }
    return ensureIndexOnce;
  }

  return {
    async findByUsername(username: string): Promise<User | null> {
      try {
        await ensureIndex();
        const res = await client.search<User>({
          index,
          size: 1,
          query: { term: { username: { value: username } } },
        });
        const hit = res.hits.hits[0];
        return hit ? (hit._source as User) : null;
      } catch (err: any) {
        if (err instanceof EsErrors.ResponseError) {
          const metaBody = err.meta?.body as { error?: { type?: string } };
          const type = metaBody?.error?.type;
          if (type === "index_not_found_exception") return null;
        }
        throw err;
      }
    },

    async create(user: User): Promise<User> {
      await ensureIndex();

      const existing = await this.findByUsername(user.username);
      if (existing) {
        throw new Error("Username taken");
      }

      await client.index({
        index,
        document: user,
        refresh: "wait_for",
      });
      return user;
    },
  };
}
