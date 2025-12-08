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
			mappings: {
				properties: {
					wikiId: { type: "keyword" },
					pageId: { type: "keyword" },
					pageTitle: { type: "text" },
					category: { type: "keyword" },
					content: { type: "text" }
				}
			}
		} as any);
		console.log("Created index:", WIKI_INDEX);
	} else {
		console.log("Index exists:", WIKI_INDEX);
	}
}

export interface SearchResult {
	wikiId: string;
	pageId: string;
	pageTitle: string;
	category: string;
	score: number;
	highlights: Record<string, string[]>;
}

export async function searchWikis(
	searchTerm: string,
	wikiIds: string[]
): Promise<Record<string, SearchResult[]>> {
	/**
	 * Search across multiple wikis that the user has access to
	 */

	if (!searchTerm || searchTerm.trim() === "") {
		throw new Error("Search term cannot be empty");
	}

	if (!wikiIds || wikiIds.length === 0) {
		return {};
	}

	const response = await esClient.search({
		index: WIKI_INDEX,
		query: {
			bool: {
				must: [
					{
						multi_match: {
							query: searchTerm,
							fields: ["pageTitle^2", "content"],
							type: "best_fields",
							fuzziness: "AUTO"
						}
					}
				],
				filter: [
					{
						terms: {
							wikiId: wikiIds
						}
					}
				]
			}
		},
		highlight: {
			fields: {
				pageTitle: {},
				content: {
					fragment_size: 150,
					number_of_fragments: 3
				}
			}
		},
		size: 100
	} as any);

	// Group results by wikiId for easier frontend consumption
	const results: SearchResult[] = response.hits.hits.map((hit: any) => ({
		wikiId: hit._source.wikiId,
		pageId: hit._source.pageId,
		pageTitle: hit._source.pageTitle,
		category: hit._source.category,
		score: hit._score,
		highlights: hit.highlight || {}
	}));

	// Group by wiki
	const groupedResults: Record<string, SearchResult[]> = {};
	results.forEach((result: SearchResult) => {
		if (!groupedResults[result.wikiId]) {
			groupedResults[result.wikiId] = [];
		}
		groupedResults[result.wikiId].push(result);
	});

	return groupedResults;
}
