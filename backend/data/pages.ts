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

	async createPage(wikiId: string, name: string, category: string) {

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
			first_created: new Date().toLocaleString(),
			last_edited: new Date().toLocaleString(),
			first_created_by: "TO BE IMPLEMENTED",
			last_edited_by: "TO BE IMPLEMENTED"
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

		return (await wikiDataFunctions.getWikiById(wikiId.toString()));

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
					"pages.$.content": newContent,
					"pages.$.last_edited": new Date().toLocaleString()
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
