import { describe, it } from "node:test";
import { TaxiiClient } from "../src/2.1/taxii.js";

describe("TAXII 2.1 Client", () => {
  it("should work", async () => {
    const client = new TaxiiClient({
      endpoint: process.env.TAXII2_ENDPOINT!,
      authorization: process.env.TAXII2_API_KEY,
    });

    const discovery = await client.getDiscovery();
    console.log(discovery);

    const root = await client.getApiRoot(discovery.default!);
    console.log(root);

    const collections = await client.getCollections(discovery.default!);
    console.log(collections);

    const objects = await client.getObjects(
      discovery.default!,
      collections.collections![1].id,
      {
        limit: 500,
      },
    );
    console.log(objects.objects.length, objects.objects.slice(0, 2));

    const allObjects = await client.getAllObjects(
      discovery.default!,
      collections.collections![1].id,
      {
        limit: 500,
      },
    );
    console.log(allObjects.length, allObjects.slice(0, 2));
  });
});
