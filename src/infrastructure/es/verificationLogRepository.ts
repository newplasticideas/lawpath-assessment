import { VerificationLogRepository } from "../../core/ports";
import { Client } from "@elastic/elasticsearch";

function monthlyIndex(prefix: string, d = new Date()) {
  const m = `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${prefix}-${m}`;
}

export function esVerificationLogRepository(opts: {
  node: string;
  apiKey: string;
  prefix: string; // <- make prefix explicit
}): VerificationLogRepository {
  const client = new Client({ node: opts.node, auth: { apiKey: opts.apiKey } });
  const prefix = opts.prefix;

  return {
    async log(entry) {
      await client.index({
        index: monthlyIndex(prefix),
        document: entry,
      });
    },
  };
}
