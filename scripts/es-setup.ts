// scripts/es-setup.ts
import { Client } from "@elastic/elasticsearch";

async function main() {
  const client = new Client({
    node: process.env.ELASTICSEARCH_NODE!,
    auth: { apiKey: process.env.ELASTICSEARCH_API_KEY! },
  });

  const firstname = "Nick";
  const lastname = "Johnson";
  const index = `${firstname.toLowerCase()}-${lastname.toLowerCase()}-index`;

  // Ensure index exists first (safe if it already exists)
  const exists = await client.indices.exists({ index });
  if (!exists) {
    await client.indices.create({ index });
    console.log("Created index:", index);
  }

  // Update mapping with "semantic_text" (unknown to TS types)
  await client.indices.putMapping({
    index,
    // The client expects body: { properties: ... } in v8
    // Cast only the bit TS can't infer:
    body: {
      properties: {
        text: { type: "semantic_text" } as any,
      },
    } as any,
  });

  console.log(`Updated mapping on ${index} (text.semantic_text)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
