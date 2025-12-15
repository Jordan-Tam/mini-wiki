import { ObjectId } from "mongodb";
import slugify from "slugify";
import { wikis } from "../config/mongoCollections.ts";
import wikiDataFunctions from "./wikis.ts";
import {
	checkString,
	checkId,
	checkUsername,
	checkCategory,
	checkWikiOrPageName
} from "../helpers.ts";
import { indexPage, deletePageFromIndex } from "../lib/search/indexer.ts";
import user_data_functions from "./users.ts";

const page_data_functions = {
	async getPageById(wikiId: string, pageId: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "getPageById");
		pageId = checkId(pageId, "Page", "getPageById");

		let wiki = await wikiDataFunctions.getWikiById(wikiId);

		for (let page of wiki.pages) {
			if (page._id.toString() === pageId.toString()) {
				return page;
			}
		}

		throw "Page not found.";
	},

	async getPageByUrlName(wikiId: string, urlName: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki");
		urlName = checkString(urlName, "Page URL");

		const wiki: any = await wikiDataFunctions.getWikiById(wikiId);

		for (let page of wiki.pages) {
			console.log(`${page.urlName} === ${urlName}`);
			if (page.urlName === urlName) {
				page._id = page._id.toString();
				return page;
			}
		}

		throw "Page not found.";
	},

	async getPagesByCategory(wikiId: string, category: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "createPage");
		category = checkCategory(category, "getPagesByCategory");

		await wikiDataFunctions.doesCategoryExist(wikiId, category);

		let wiki: any = await wikiDataFunctions.getWikiById(wikiId);

		let returnedPages = [];

		for (let page of wiki.pages) {
			if (page.category === category) {
				returnedPages.push(page);
			}
		}

		return returnedPages;
	},

	async createPage(
		wikiId: string,
		name: string,
		category: string,
		userFirebaseUID?: string
	) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "createPage");
		name = checkWikiOrPageName(name, "createPage");
		category = checkCategory(category, "createPage");

		// Create the new page object.
		const newPage = {
			_id: new ObjectId(),
			name,
			urlName: slugify(name, { replacement: "_" }),
			category,
			category_slugified: slugify(category, { replacement: "_" }),
			content: [],
			first_created: new Date().toLocaleString("en-US", {
				timeZone: "America/New_York"
			}),
			last_edited: new Date().toLocaleString("en-US", {
				timeZone: "America/New_York"
			}),
			first_created_by: userFirebaseUID
				? await user_data_functions.getUserByFirebaseUID(userFirebaseUID)
				: "N/A",
			last_edited_by: userFirebaseUID
				? await user_data_functions.getUserByFirebaseUID(userFirebaseUID)
				: "N/A"
		};

		const wikisCollection = await wikis();

		let wiki: any = await wikiDataFunctions.getWikiById(wikiId);

		// Make sure the page name is unique within its wiki.
		for (let page of wiki.pages) {
			if (page.name === name) {
				throw "Page name must be unique.";
			}
		}

		const insertPageToWikiInfo = await wikisCollection.findOneAndUpdate(
			{ _id: new ObjectId(wikiId) },
			{ $push: { pages: newPage } },
			{ returnDocument: "after" }
		);

		if (!insertPageToWikiInfo) {
			throw "Page could not be created.";
		}

		// Index the new page in Elasticsearch
		await indexPage(wikiId, newPage);

		//return newPage;

		return await wikiDataFunctions.getWikiById(wikiId.toString());
	},

	async deletePage(wikiId: string, pageId: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki");
		pageId = checkId(pageId, "Page");

		// Check if wiki exists.
		const wiki = await wikiDataFunctions.getWikiById(wikiId);
		console.log(wiki._id);

		const wikisCollection = await wikis();
		const deleteInfo = await wikisCollection.updateOne(
			{ _id: new ObjectId(wikiId) },
			{ $pull: { pages: { _id: new ObjectId(pageId) } } },
			{ returnDocument: "after" }
		);

		console.log("deleted");

		if (!deleteInfo) {
			throw "Page could not be deleted.";
		}

		// TODO: Elasticsearch indexing!!!

		return await wikiDataFunctions.getWikiById(wikiId.toString());
	},

	async changePageName(wikiId: string, pageId: string, newName: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki");
		pageId = checkId(pageId, "Page");
		newName = checkWikiOrPageName(newName);

		// Check if wiki exists.
		let wiki = await wikiDataFunctions.getWikiById(wikiId);

		for (let i = 0; i < wiki.pages.length; i++) {
			if (wiki.pages[i]._id === pageId) {
				wiki.pages[i].name = newName;
				wiki.pages[i].urlName = slugify(newName, { replacement: "_" });
			}

			const wikisCollection = await wikis();
			const updateInfo = await wikisCollection.findOneAndUpdate(
				{ _id: wikiId },
				{ $set: { pages: wiki.pages } },
				{ returnDocument: "after" }
			);

			if (!updateInfo) {
				throw "Page name could not be updated.";
			}

			return await wikiDataFunctions.getWikiById(wikiId.toString());
		}

		throw "Page not found.";
	},

	async changePageContent(
		wikiId: string,
		pageId: string,
		newContent: Array<{ editorType: string; contentString: string }>,
		userFirebaseUID?: string
	) {
		/**
		 * Creates the contnet of a given page in a wiki. NOTE: IS USED IN INITIAL PAGE CREATION
		 */

		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "changePageContent");
		pageId = checkId(pageId, "Page", "changePageContent");

		// Check if wiki and page exists.
		await wikiDataFunctions.getWikiById(wikiId);
		await this.getPageById(wikiId, pageId);

		const wikisCollection = await wikis();

		const updateInfo = await wikisCollection.findOneAndUpdate(
			{
				_id: new ObjectId(wikiId),
				"pages._id": new ObjectId(pageId)
			},
			{
				$set: {
					"pages.$.content": newContent,
					"pages.$.last_edited": new Date().toLocaleString("en-US", {
						timeZone: "America/New_York"
					}),
					"pages.$.last_edited_by": userFirebaseUID
						? await user_data_functions.getUserByFirebaseUID(userFirebaseUID)
						: "N/A"
				}
			},
			{ returnDocument: "after" }
		);

		if (!updateInfo) {
			throw "Page could not be updated.";
		}

		const updatedPage = await this.getPageById(wikiId, pageId);

		// Re-index the page with updated content
		await indexPage(wikiId, updatedPage);

		// return updatedPage;

		return await wikiDataFunctions.getWikiById(wikiId.toString());
	},

	async changePageCategory(
		wikiId: string,
		pageId: string,
		newCategory: string
	) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "changePageCategory");
		pageId = checkId(pageId, "Page", "changePageCategory");
		newCategory = checkCategory(newCategory, "changePageCategory");
		await wikiDataFunctions.doesCategoryExist(wikiId, newCategory);

		const wikisCollection = await wikis();

		const updateInfo = await wikisCollection.findOneAndUpdate(
			{
				_id: new ObjectId(wikiId),
				"pages._id": new ObjectId(pageId)
			},
			{
				$set: {
					"pages.$.category": newCategory,
					"pages.$.category_slugified": slugify(newCategory, {
						replacement: "_"
					})
				}
			},
			{ returnDocument: "after" }
		);

		if (!updateInfo) {
			throw "Could not update page category.";
		}

		const updatedPage = await this.getPageById(wikiId, pageId);

		// Re-index the page with updated category
		await indexPage(wikiId, updatedPage);

		// return updatedPage;

		return await wikiDataFunctions.getWikiById(wikiId.toString());
	}
};

export default page_data_functions;
