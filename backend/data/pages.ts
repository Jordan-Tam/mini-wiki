import { ObjectId } from "mongodb";
import { wikis } from "../config/mongoCollections.ts";
import wikiDataFunctions from "./wikis.ts";
import { checkString, checkId, checkUsername, checkCategory, checkWikiOrPageName } from "../helpers.ts";

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

	async getPageByUrl() {
		
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

	async createPage(wikiId: string, name: string, category: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "createPage");
		name = checkWikiOrPageName(name, "createPage");
		category = checkCategory(category, "createPage");

		// Create the new page object.
		const newPage = {
			_id: new ObjectId(),
			name,
			url: name, //TODO: Remove all forbidden characters and turn spaces into underscores
			category,
			content: []
		};

		const wikisCollection = await wikis();

		let wiki: any = await wikiDataFunctions.getWikiById(wikiId);

		// Make sure the page name is unique within its category.
		for (let page of wiki.pages) {
			if (page.name === name) {
				throw "Page name must be unique within its category.";
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

		return newPage;
	},

	async deletePage(wikiId: string, pageId: string) {},

	async changePageName(wikiId: string, pageId: string, newName: string) {},

	async changePageContent(
		wikiId: string,
		pageId: string,
		newContent: string[]
	) {
		/**
		 * Creates the contnet of a given page in a wiki. NOTE: IS USED IN INITIAL PAGE CREATION
		 */

		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "changePageContent");
		pageId = checkId(pageId, "Page", "changePageContent");

		const wikisCollection = await wikis();

		const updateInfo = await wikisCollection.findOneAndUpdate(
			{
				_id: new ObjectId(wikiId),
				"pages._id": new ObjectId(pageId)
			},
			{
				$set: {
					"pages.$.content": newContent
				}
			},
			{ returnDocument: "after" }
		);

		if (!updateInfo) {
			throw "Page could not be updated.";
		}

		return await this.getPageById(wikiId, pageId);
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
	}
};

export default page_data_functions;
