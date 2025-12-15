import { esClient, WIKI_INDEX } from "./search";

export async function indexPage(wikiId: string, page: any) {
	// Join the page content together into single string for elastic search
	const contentJoined = Array.isArray(page.content)
		? page.content.map((item: any) => item.contentString || "").join("\n\n")
		: "";

	// Make the doc
	const doc = {
		wikiId,
		pageId: page._id?.toString() ?? page.id,
		pageUrlName: page.urlName,
		pageTitle: page.name,
		category: page.category ?? "UNCATEGORIZED",
		content: contentJoined
	};

	// Index the page
	// https://www.elastic.co/docs/reference/elasticsearch/clients/javascript/api-reference#_arguments_index
	await esClient.index({
		index: WIKI_INDEX,
		id: doc.pageId,
		document: doc,
		refresh: "wait_for"
	});
}

export async function deletePageFromIndex(pageId: string) {
	try {
		await esClient.delete({
			index: WIKI_INDEX,
			id: pageId,
			refresh: "wait_for"
		});
	} catch (err: any) {
		if (err.statusCode !== 404) throw err;
	}
}
