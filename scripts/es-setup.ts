import { Client } from "@elastic/elasticsearch";

async function main() {
  const client = new Client({
    node: process.env.ELASTICSEARCH_NODE!,
    auth: { apiKey: process.env.ELASTICSEARCH_API_KEY! },
  });

  const firstname = "Nick";
  const lastname = "Johnson";
  const index = `${firstname.toLowerCase()}-${lastname.toLowerCase()}-verifications`;

  // Ensure index exists first (safe if it already exists)
  const exists = await client.indices.exists({ index });
  if (!exists) {
    await client.indices.create({ index });
    console.log("Created index:", index);
  }

  // Update mapping for verification logs
  await client.indices.putMapping({
    index,
    body: {
      properties: {
        username: { type: "keyword" },
        input: { type: "object" },
        result: { type: "keyword" },
        error: { type: "text" },
        ts: { type: "date" },
      },
    },
  });

  console.log(`Updated mapping on ${index} (verification log fields)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
