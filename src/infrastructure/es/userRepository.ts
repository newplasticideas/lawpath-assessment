import { User, UserRepository } from "../../core/ports";
import { Client, errors as EsErrors } from "@elastic/elasticsearch";

type EsRepoOpts = {
  node: string; // e.g. https://<host>:9200
  apiKey: string; // Elastic API key (Cloud or self-managed)
  index: string; // e.g. "nick-johnson-users"
};

/**
 * Elasticsearch-backed UserRepository (no in-memory fallback).
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

  // Memoize index creation to avoid races on first boot
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
                username: { type: "keyword" }, // exact-match search
                passwordHash: { type: "keyword" },
                createdAt: { type: "date" },
              },
            },
          });
        }
      })().catch((e) => {
        // Reset memoized promise so a later call can retry
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

      // Enforce unique username (fast path).
      const existing = await this.findByUsername(user.username);
      if (existing) {
        // Surface as an application error; your route/usecase can map to 400.
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
