// scripts/es-setup.ts
import { Client } from "@elastic/elasticsearch";

async function main() {
  const client = new Client({ node: process.env.ELASTICSEARCH_NODE || "http://localhost:9200" });

  // Users index (simple)
  const usersIndex = "users";
  const usersExists = await client.indices.exists({ index: usersIndex });
  if (!usersExists) {
    await client.indices.create({
      index: usersIndex,
      mappings: {
        properties: {
          username: { type: "keyword" },
          passwordHash: { type: "keyword" },
          createdAt: { type: "date" }
        }
      }
    });
    console.log("Created index:", usersIndex);
  }

  // Verifications template for verifications-*
  const templateName = "verifications-template";
  await client.indices.putIndexTemplate({
    name: templateName,
    index_patterns: ["verifications-*"],
    template: {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0
      },
      mappings: {
        properties: {
          username: { type: "keyword" },
          "input.postcode": { type: "keyword" },
          "input.suburb": { type: "text", fields: { keyword: { type: "keyword" } } },
          "input.state": { type: "keyword" },
          result: { type: "keyword" },
          error: { type: "text" },
          ts: { type: "date" }
        }
      }
    }
  });
  console.log("Upserted index template:", templateName);

  // Ensure current month index exists
  const now = new Date();
  const month = `${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const verIndex = `verifications-${month}`;
  const verExists = await client.indices.exists({ index: verIndex });
  if (!verExists) {
    await client.indices.create({ index: verIndex });
    console.log("Created index:", verIndex);
  }

  console.log("ES setup complete");
}

main().catch((e) => { console.error(e); process.exit(1); });
