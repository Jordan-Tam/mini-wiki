import { ObjectId } from "mongodb";
import slugify from "slugify";
import { users, wikis } from "../config/mongoCollections.ts";
import userDataFunctions from "./users.ts";
import pageDataFunctions from "./pages.ts";
import {
	checkString,
	checkId,
	checkUrlName,
	checkAccess,
	checkWikiOrPageName,
	checkDescription,
	checkCategory
} from "../helpers.ts";
import { indexPage, deletePageFromIndex } from "../lib/search/indexer.ts";
import { Wiki } from "./types.ts";

const wiki_data_functions = {
	/**
	 * Returns an array of every wiki in existence.
	 */
	async getAllWikis() {
		const wikisCollection = await wikis();

		const wikisList = await wikisCollection.find({}).toArray();

		console.log(wikisList);

		return wikisList;
	},

	/**
	 * Returns an array of every public wiki.
	 */
	async getAllPublicWikis() {
		const wikisCollection = await wikis();
		const wikisList = await wikisCollection.find({
			access: {$in: ["public-edit", "public-view"]}
		}).toArray();
		return wikisList;
	},

	/**
	 * Returns an array of every taken wiki URL name.
	 */
	async getAllWikiUrlNames() {
		const wikisCollection = await wikis();

		const wikisList = await this.getAllWikis();

		return wikisList.map((wiki: any) => wiki.urlName);
	},

	/**
	 * Retrieves wiki object based on ObjectId and returns it.
	 */
	async getWikiById(id: string): Promise<Wiki> {
		// Input validation.
		id = checkId(id, "Wiki", "getWikiById");

		const wikisCollection = await wikis();

		const wiki = await wikisCollection.findOne({
			_id: new ObjectId(id)
		});

		if (wiki === null) {
			throw "No wiki with that ID.";
		}

		wiki._id = wiki._id.toString();

		return wiki;
	},

	/**
	 * Returns wiki object based on unique URL Name field and returns it.
	 */
	async getWikiByUrlName(urlName: string): Promise<Wiki> {
		// Input validation.
		urlName = checkUrlName(urlName, "getWikiByUrl");

		const wikisCollection = await wikis();

		const wiki = await wikisCollection.findOne({
			urlName
		});

		if (wiki === null) {
			throw "Wiki URL not found!";
		}

		wiki._id = wiki._id.toString();

		return wiki;
	},

	/**
	 * Returns an array of wikis that the user is either an owner of or a collaborator of.
	 */
	async getWikisByUser(userFirebaseUID: string) {
		
		let wikisList = await this.getAllWikis();

		return {
			OWNER: wikisList.filter((wiki:any) => wiki.owner === userFirebaseUID),
			COLLABORATOR: wikisList.filter((wiki:any) => wiki.owner !== userFirebaseUID && wiki.collaborators.includes(userFirebaseUID)),
			PRIVATE_VIEWER: wikisList.filter((wiki:any) => wiki.owner !== userFirebaseUID && wiki.private_viewers.includes(userFirebaseUID))
		};

	},

	/**
   	* Get wikis by user (firebase) uid
   	*/
	async getWikisByOwner(firebaseUID:string): Promise<Array<any>> {
		return await (await wikis()).find({owner: firebaseUID}).toArray() as Array<any>;
	},

	authorized(
		wiki: Wiki,
		firebaseUID: string
	) {
        if (wiki.access === "public-edit" || wiki.access === "public-view") {
            return true;
        } else {
            if (wiki.owner === firebaseUID) {
                return true;
            } else if (wiki.collaborators.includes(firebaseUID)) {
                return true;
            } else if (wiki.private_viewers.includes(firebaseUID)) {
                return true;
            } else {
                return false;
            }
        }
	},

	/**
	 *
	 * @param name
	 * @param description
	 * @param access
	 * If this parameter is "public-view", all users will be able to view this wiki, but only the owner and the users listed in the "collaborators" array will be allowed to edit it.
	 * If this parameter is "public-edit", all users will be able to view AND edit this wiki.
	 * If this parameter is "private", only the owner and the users listed in the "collaborators" array will be allowed to view and edit, and only users listed in the "private_viewers" array will be allowed to view but not edit.
	 * @param owner
	 * @returns
	 */
	async createWiki(
		name: string,
		urlName: string,
		description: string,
		access: string,
		owner: string
	) {
		// Input validation.
		name = checkWikiOrPageName(name, "createWiki");
		urlName = checkUrlName(urlName, "createWiki");
		description = checkDescription(description, "createWiki");
		access = checkAccess(access, "createWiki");

		// Check if user exists.
		await userDataFunctions.getUserByFirebaseUID(owner);

		// Make sure URL name is unique.
		if ((await this.getAllWikiUrlNames()).includes(urlName)) {
			throw "URL Name is already taken.";
		}

		// Create the new wiki object.
		let newWiki = {
			name,
			urlName,
			description,
			owner,
			access,
			categories: ["UNCATEGORIZED"],
			categories_slugified: [slugify("UNCATEGORIZED", { replacement: "_" })],
			collaborators: [],
			private_viewers: [],
			pages: [],
			favorites: 0
		};

		const wikisCollection = await wikis();

		const insertInfo = await wikisCollection.insertOne(newWiki);

		if (!insertInfo.acknowledged || !insertInfo.insertedId) {
			throw "Wiki could not be created.";
		}

		return await this.getWikiById(insertInfo.insertedId.toString());
	},

	/**
	 * The DELETE WIKI route should first make sure that the logged-in user is the owner of this wiki before calling this function.
	 */
	async deleteWiki(id: string) {
		// Input validation.
		id = checkId(id, "Wiki", "deleteWiki");

		// Get the wiki to access its pages before deletion
		const wiki = await this.getWikiById(id);

		const wikisCollection = await wikis();

		const deletionInfo = await wikisCollection.findOneAndDelete({
			_id: new ObjectId(id)
		});

		if (!deletionInfo) {
			throw "Could not delete wiki.";
		}

		// Remove all pages from Elasticsearch index
		for (let page of wiki.pages) {
			await deletePageFromIndex(page._id.toString());
		}

		// Iterate through every user and delete the wiki's ID if it appears in their favorites array.
		const usersList = await userDataFunctions.getUsers();
		for (let user of usersList) {
			if (user.favorites.includes(id)) {
				await userDataFunctions.removeFavorite(id, user.firebaseUID);
			}
		}

		return true;
	},

	async changeWikiName(wikiId: string, newName: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "changeWikiName");
		newName = checkDescription(newName, "changeWikiName");

		// Create the updated wiki object.
		let updatedWiki = {
			name: newName
		};

		const wikisCollection = await wikis();

		const updateInfo = await wikisCollection.findOneAndReplace(
			{ _id: new ObjectId(wikiId) },
			updatedWiki,
			{ returnDocument: "after" }
		);

		if (!updateInfo) {
			throw "Could not update wiki name.";
		}

		return await this.getWikiById(wikiId.toString());
	},

	async changeWikiDescription() {},

	async changeWikiOwner(wikiId: string, newOwner: string): Promise<Wiki> {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "changeWikiOwner");

		// Check if user exists.
		await userDataFunctions.getUserByFirebaseUID(newOwner);

		// Create the updated wiki object.
		let updatedWiki = {
			owner: newOwner
		};

		const wikisCollection = await wikis();

		const updateInfo = await wikisCollection.findOneAndUpdate(
			{ _id: new ObjectId(wikiId) },
			{$set: {owner: newOwner}},
			{ returnDocument: "after" }
		);

		if (!updateInfo) {
			throw "Could not update wiki owner.";
		}

		return await this.getWikiById(wikiId.toString());
	},

	async changeWikiAccess(wikiId: string, newAccess: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "changeWikiAccess");
		newAccess = checkAccess(newAccess, "changeWikiAccess");

		// Create the updated wiki object.
		let updatedWiki = {
			access: newAccess
		};

		const wikisCollection = await wikis();

		const updateInfo = await wikisCollection.findOneAndReplace(
			{ _id: new ObjectId(wikiId) },
			updatedWiki,
			{ returnDocument: "after" }
		);

		if (!updateInfo) {
			throw "Could not update wiki access.";
		}

		return await this.getWikiById(wikiId.toString());
	},

	async createCategory(wikiId: string, category: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "createCategory");
		category = checkCategory(category, "createCategory");

		let wiki = await this.getWikiById(wikiId);
		if (wiki.categories.includes(category)) {
			throw "Duplicate categories are not allowed.";
		}

		const wikisCollection = await wikis();
		const updateInfo = await wikisCollection.findOneAndUpdate(
			{ _id: new ObjectId(wikiId) },
			{
				$push: {
					categories: category,
					categories_slugified: slugify(category, { replacement: "_" })
				}
			},
			{ returnDocument: "after" }
		);

		if (!updateInfo) {
			throw "Could not create wiki category.";
		}

		return await this.getWikiById(wikiId.toString());
	},

	async editCategory(
		wikiId: string,
		oldCategoryName: string,
		newCategoryName: string
	) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "editCategory");
		oldCategoryName = checkCategory(oldCategoryName, "editCategory");
		newCategoryName = checkCategory(newCategoryName, "editCategory");

		let wiki = await this.getWikiById(wikiId);

		// Check if "oldCategoryName" exists in the categories array.
		if (!wiki.categories.includes(oldCategoryName)) {
			throw "Category to edit does not exist.";
		}

		// Return early if old and new category names are the same.
		if (oldCategoryName === newCategoryName) {
			return await this.getWikiById(wikiId.toString());
		}

		// Make sure the new name is unique.
		if (wiki.categories.includes(newCategoryName)) {
			throw "Duplicate categories are not allowed.";
		}

		const wikisCollection = await wikis();
		const updateInfo = await wikisCollection.findOneAndUpdate(
			{ _id: new ObjectId(wikiId) },
			{
				$set: {
					categories: wiki.categories.map((c: any) =>
						c === oldCategoryName ? newCategoryName : c
					),
					categories_slugified: wiki.categories_slugified.map((c: any) =>
						c === slugify(oldCategoryName, { replacement: "_" })
							? slugify(newCategoryName, { replacement: "_" })
							: c
					)
				}
			},
			{ returnDocument: "after" }
		);

		// For each page in the category, update their category field to reflect the new category name.
		for (let page of wiki.pages) {
			if (page.category === oldCategoryName) {
				await pageDataFunctions.changePageCategory(
					wiki._id,
					page._id.toString(),
					newCategoryName
				);
				// Note: changePageCategory already handles re-indexing
			}
		}

		return await this.getWikiById(wikiId.toString());
	},

	async deleteCategory(wikiId: string, category: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "deleteCategory");
		category = checkCategory(category, "deleteCategory");

		console.log(1);

		let wiki = await this.getWikiById(wikiId);

		console.log(2);

		// Get pages that will be affected (moved to UNCATEGORIZED)
		const affectedPages = wiki.pages.filter((page: any) => page.category === category);

		console.log(3);

		// Pages associated with the deleted category are moved to the UNCATEGORIZED category.
		let updatedWiki = {
			categories: wiki.categories.filter((c: string) => c !== category),
			categories_slugified: wiki.categories_slugified.filter((c: string) => c !== slugify(category, {replacement: "_"})),
			pages: wiki.pages.map((page: any) => {
				if (page.category === category) {
					page.category = "UNCATEGORIZED";
					return page;
				} else {
					return page;
				}
			})
		};

		console.log(updatedWiki);

		console.log(4);

		const wikisCollection = await wikis();
		const updateInfo = await wikisCollection.findOneAndUpdate(
			{ _id: new ObjectId(wikiId) },
			{$set: updatedWiki},
			{ returnDocument: "after" }
		);

		console.log(5);

		if (!updateInfo) {
			throw "Could not delete wiki category.";
		}

		console.log(6);

		// Re-index affected pages with their new UNCATEGORIZED category
		for (let page of affectedPages) {
			const updatedPage = await pageDataFunctions.getPageById(wikiId, page._id.toString());
			await indexPage(wikiId, updatedPage);
		}

		console.log(7);

		return await this.getWikiById(wikiId.toString());
	},

	async doesCategoryExist(wikiId: string, category: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "doesCategoryExist");
		category = checkCategory(category, "doesCategoryExist");

		let wiki = await this.getWikiById(wikiId);

		const categoriesSlugified = wiki.categories_slugified || [];

		return (
			wiki.categories.includes(category) &&
			categoriesSlugified.includes(slugify(category, { replacement: "_" }))
		);
	},

	async addCollaborator(wikiId: string, userFirebaseUID: string) {

		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "addCollaborator");

		// Check if wiki exists.
		let wiki = await this.getWikiById(wikiId);

		// Check if user exists.
		await userDataFunctions.getUserByFirebaseUID(userFirebaseUID);

		// Check if wiki is "public-edit".
		if (wiki.access === "public-edit") {
			throw "User already has edit permissions.";
		}

		// Check if user is already a collaborator.
		if (wiki.collaborators.includes(userFirebaseUID)) {
			throw "User is already a collaborator.";
		}

		// Check if user is already the owner
		if(wiki.owner === userFirebaseUID){
			throw "Owner cannot add themself as a collaborator!"
		}

		const wikisCollection = await wikis();

		const insertCollaboratorToWikiInfo = await wikisCollection.findOneAndUpdate(
			{ _id: new ObjectId(wikiId) },
			{ $push: { collaborators: userFirebaseUID } },
			{ returnDocument: "after" }
		);

		if (!insertCollaboratorToWikiInfo) {
			throw "Collaborator could not be added.";
		}

		return await this.getWikiById(wikiId.toString());
	},

	async removeCollaborator(wikiId: string, userFirebaseUID: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "removeCollaborator");

		// Check if wiki exists.
		let wiki = await this.getWikiById(wikiId);

		// Check if user exists.
		await userDataFunctions.getUserByFirebaseUID(userFirebaseUID);

		// Check if user already wasn't a collaborator.
		if (!wiki.collaborators.includes(userFirebaseUID)) {
			throw "User isn't a collaborator.";
		}

		const wikisCollection = await wikis();

		const removeCollaboratorFromWikiInfo =
			await wikisCollection.findOneAndUpdate(
				{ _id: new ObjectId(wikiId) },
				{ $pull: { collaborators: userFirebaseUID } },
				{ returnDocument: "after" }
			);

		if (!removeCollaboratorFromWikiInfo) {
			throw "Collaborator could not be removed.";
		}

		return await this.getWikiById(wikiId.toString());
	},

	async addPrivateViewer(wikiId: string, userFirebaseUID: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "addPrivateViewer");

		// Check if wiki exists.
		let wiki = await this.getWikiById(wikiId);

		// Check if user exists.
		await userDataFunctions.getUserByFirebaseUID(userFirebaseUID);

		// Check if user is already a private viewer.
		if (wiki.private_viewers.includes(userFirebaseUID)) {
			throw "User is already a private viewer.";
		}

		const wikisCollection = await wikis();

		const insertPrivateViewerToWikiInfo =
			await wikisCollection.findOneAndUpdate(
				{ _id: new ObjectId(wikiId) },
				{ $push: { private_viewers: userFirebaseUID } },
				{ returnDocument: "after" }
			);

		if (!insertPrivateViewerToWikiInfo) {
			throw "Private viewer could not be added.";
		}

		return await this.getWikiById(wikiId.toString());
	},

	async removePrivateViewer(wikiId: string, userFirebaseUID: string) {
		// Input validation.

		wikiId = checkId(wikiId, "Wiki", "removePrivateViewer");

		// Check if wiki exists.
		let wiki = await this.getWikiById(wikiId);

		// Check if user exists.
		await userDataFunctions.getUserByFirebaseUID(userFirebaseUID);

		// Check if user already wasn't a private viewer already.
		if (!wiki.private_viewers.includes(userFirebaseUID)) {
			throw "User isn't a private viewer.";
		}


		const wikisCollection = await wikis();

		const removePrivateViewerFromWikiInfo =
			await wikisCollection.findOneAndUpdate(
				{ _id: new ObjectId(wikiId) },
				{ $pull: { private_viewers: userFirebaseUID } },
				{ returnDocument: "after" }
			);

		console.log("POOP7")
		if (!removePrivateViewerFromWikiInfo) {
			throw "Private viewer could not be removed.";
		}

		console.log("POOP8")
		return await this.getWikiById(wikiId.toString());
	},

	/**
	 * Gonna be used on browsing page to search for Wikis
	 */
	async searchWikisByName(searchTerm: string) {
		searchTerm = searchTerm.trim();
		if (searchTerm.length > 30) {
			throw "wiki names are less than 30 characters";
		}

		const wikiCollection = await wikis();
		const wikiSearch = await wikiCollection
			.find({ name: { $regex: searchTerm, $options: "i" } })
			.toArray();

		// if(wikiSearch.length === 0 ){
		//     return [];
		// }

		return wikiSearch;
	},

	/**
	 * Returns an array of wiki IDs that the user has access to (either as owner, collaborator, or based on access level)
	 */
	async getUserAccessibleWikiIds(userFirebaseUID: string): Promise<string[]> {
		const wikisList = await this.getAllWikis();

		const accessibleWikis = wikisList.filter((wiki: any) => {
			// User is owner or collaborator
			if (
				wiki.owner === userFirebaseUID ||
				wiki.collaborators.includes(userFirebaseUID)
			) {
				return true;
			}

			// Wiki is public (public-view or public-edit)
			if (wiki.access === "public-view" || wiki.access === "public-edit") {
				return true;
			}

			// Wiki is private and user is in private_viewers
			if (
				wiki.access === "private" &&
				wiki.private_viewers.includes(userFirebaseUID)
			) {
				return true;
			}

			return false;
		});

		return accessibleWikis.map((wiki: any) => wiki._id.toString());
	}
};


export default wiki_data_functions;
