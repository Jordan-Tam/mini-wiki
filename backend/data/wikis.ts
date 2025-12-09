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

const wiki_data_functions = {
	/**
	 * Returns an array of every wiki in existence.
	 */
	async getAllWikis() {
		const wikisCollection = await wikis();

		const wikisList = await wikisCollection.find({}).toArray();

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
	async getWikiById(id: string) {
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
	async getWikiByUrlName(urlName: string) {
		// Input validation.
		urlName = checkUrlName(urlName, "getWikiByUrl");

		const wikisCollection = await wikis();

		const wiki = await wikisCollection.findOne({
			urlName
		});

		if (wiki === null) {
			throw "No wiki with that URL.";
		}

		wiki._id = wiki._id.toString();

		return wiki;
	},

	/**
	 * Returns an array of wikis that the user is either an owner of or a collaborator of.
	 */
	async getWikisByUser(userFirebaseUID: string) {
		let wikisList = await this.getAllWikis();

		return wikisList.filter(
			(wiki: any) =>
				wiki.owner === userFirebaseUID ||
				wiki.collaborators.includes(userFirebaseUID)
		);
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

		const wikisCollection = await wikis();

		const deletionInfo = await wikisCollection.findOneAndDelete({
			_id: new ObjectId(id)
		});

		if (!deletionInfo) {
			throw "Could not delete wiki.";
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

	async changeWikiOwner(wikiId: string, newOwner: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "changeWikiOwner");

		// Check if user exists.
		await userDataFunctions.getUserByFirebaseUID(newOwner);

		// Create the updated wiki object.
		let updatedWiki = {
			owner: newOwner
		};

		const wikisCollection = await wikis();

		const updateInfo = await wikisCollection.findOneAndReplace(
			{ _id: new ObjectId(wikiId) },
			updatedWiki,
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
			{ $push: {
				categories: category,
				categories_slugified: slugify(category, {replacement: "_"})
			} },
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
			return await this.getWikiById(wikiId.toString());;
		}

		// Make sure the new name is unique.
		if (wiki.categories.includes(newCategoryName)) {
			throw "Duplicate categories are not allowed.";
		}

		const wikisCollection = await wikis();
		const updateInfo = await wikisCollection.findOneAndUpdate(
			{ _id: new ObjectId(wikiId) },
			{ $set: {
				categories: wiki.categories.map((c: any) =>
					c === oldCategoryName ? newCategoryName : c
				),
				categories_slugified: wiki.categories_slugified.map((c: any) =>
					c === slugify(oldCategoryName, {replacement: "_"})
					?
					slugify(newCategoryName, {replacement: "_"})
					:
					c
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
					page._id,
					newCategoryName
				);
			}
		}

		return await this.getWikiById(wikiId.toString());
	},

	async deleteCategory(wikiId: string, category: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "deleteCategory");
		category = checkCategory(category, "deleteCategory");

		let wiki = await this.getWikiById(wikiId);

		// Pages associated with the deleted category are moved to the UNCATEGORIZED category.
		let updatedWiki = {
			categories: wiki.categories.filter((c: string) => c !== category),
			pages: wiki.pages.map((page: any) => {
				if (page.category === category) {
					page.category = "UNCATEGORIZED";
					return page;
				} else {
					return page;
				}
			})
		};

		const wikisCollection = await wikis();
		const updateInfo = await wikisCollection.findOneAndUpdate(
			{ _id: new ObjectId(wikiId) },
			updatedWiki,
			{ returnDocument: "after" }
		);

		if (!updateInfo) {
			throw "Could not delete wiki category.";
		}

		return await this.getWikiById(wikiId.toString());
	},

	async doesCategoryExist(wikiId: string, category: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "doesCategoryExist");
		category = checkCategory(category, "doesCategoryExist");

		let wiki = await this.getWikiById(wikiId);

		return (wiki.categories.includes(category) && wiki.categories_slugified.includes(slugify(category, {replacement: "_"})));
	},

	async addCollaborator(wikiId: string, userFirebaseUID: string) {
		// Input validation.
		wikiId = checkId(wikiId, "Wiki", "addCollaborator");

		// Check if wiki exists.
		let wiki = await this.getWikiById(wikiId);

		// Check if user exists.
		await userDataFunctions.getUserByFirebaseUID(userFirebaseUID);

		// Check if user is already a collaborator.
		if (wiki.collaborators.includes(userFirebaseUID)) {
			throw "User is already a collaborator.";
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
		if (wiki.collaborators.includes(userFirebaseUID)) {
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

		// Check if user already wasn't a collaborator.
		if (wiki.private_viewers.includes(userFirebaseUID)) {
			throw "User isn't a private viewer.";
		}

		const wikisCollection = await wikis();

		const removePrivateViewerFromWikiInfo =
			await wikisCollection.findOneAndUpdate(
				{ _id: new ObjectId(wikiId) },
				{ $pull: { private_viewers: userFirebaseUID } },
				{ returnDocument: "after" }
			);

		if (!removePrivateViewerFromWikiInfo) {
			throw "Private viewer could not be removed.";
		}

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
