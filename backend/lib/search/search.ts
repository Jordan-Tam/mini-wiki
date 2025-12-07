// backend/src/lib/search.ts
import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
	node: process.env.ES_URL || "http://localhost:9200"
});

export const WIKI_INDEX = "wiki_pages";

export async function ensureIndex() {
	const exists = await esClient.indices.exists({ index: WIKI_INDEX });
	if (!exists) {
		await esClient.indices.create({
			index: WIKI_INDEX,
			body: {
				mappings: {
					properties: {
						wikiId: { type: "keyword" },
						pageId: { type: "keyword" },
						title: { type: "text" },
						category: { type: "keyword" },
						content: { type: "text" }
					}
				}
			}
		});
		console.log("Created index:", WIKI_INDEX);
	} else {
		console.log("Index exists:", WIKI_INDEX);
	}
}
