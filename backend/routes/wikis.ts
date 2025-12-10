import { Router } from "express";
import redisFunctions from "../lib/redis/redis.ts";
import wikiDataFunctions from "../data/wikis.ts";
import pageDataFunctions from "../data/pages.ts";
import userDataFunctions from "../data/users.ts";
import {
	checkString,
	checkId,
	checkAccess,
	checkCategory,
	checkDescription,
	checkUrlName,
	checkWikiOrPageName,
	checkContentArray,
	checkUsername
} from "../helpers.ts";
import user_data_functions from "../data/users.ts";

export const router = Router();

router
	.route("/")

	/**
	 *! Returns an object of three arrays: OWNER, COLLABORATOR, and PRIVATE_VIEWER.
	 */
	.get(async (req: any, res: any) => {

		if (!req.user) {
			return res.status(401).json({
				error: "/wiki: You must be logged in to perform this action."
			});
		}

		if (await redisFunctions.exists_in_cache(`${req.user.uid}/getWikisByUser`)) {
			return res.json(await redisFunctions.get_json(`${req.user.uid}/getWikisByUser`)); // REDIS
		}

		let wikis;
		try {
			wikis = await wikiDataFunctions.getWikisByUser(req.user.uid);
		} catch (e) {
			return res.status(500).json({error: e});
		}

		await redisFunctions.set_json(`${req.user.uid}/getWikisByUser`, wikis); // REDIS

		return res.json(wikis);

	})

	/**
	 *! Creates a wiki.
	 */
	.post(async (req: any, res) => {
		
		if (!(req as any).user) {
			return res.status(401).json({
				error: "/wiki: You must be logged in to perform this action."
			});
		}

		const FORBIDDEN_WIKI_URL_NAMES = [
          "browse",
          "create",
          "home",
          "profile",
          "user",
          "signin",
          "signup",
          "testing",
        ];

		let { name, urlName, description, access } = req.body;

		// 400: Input validation.
		try {

			name = checkWikiOrPageName(name);
			urlName = checkUrlName(urlName);
			if(FORBIDDEN_WIKI_URL_NAMES.includes(urlName)){
				throw ``
			}
			description = checkDescription(description);
			access = checkAccess(access);

		} catch (e) {
			return res.status(400).json({ error: e });
		}

		try {

			let wiki = await wikiDataFunctions.createWiki(
				name,
				urlName,
				description,
				access,
				(req as any).user.uid
			);

			await redisFunctions.set_json(`${(req as any).user.uid}/getWikisByUser`, await wikiDataFunctions.getWikisByUser((req as any).user.uid)); // REDIS

			if (wiki.access === "public-edit" || wiki.access === "public-view") {
				await redisFunctions.set_json("publicWikis", await wikiDataFunctions.getAllPublicWikis());
			}

			return res.json(wiki);

			// TODO: When adding collaborators/viewers, make sure that the user being added has their personal getWikisByUser key-value updated.
			// TODO: And if that wiki is also public, update the publicWikis entry as done above.

		} catch (e) {
			return res.status(500).json({ error: e });
		}
	});

router
	.route("/wikis")

	/**
	 *! Returns an array of public wikis.
	 */
	.get(async (req: any, res) => {

		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		try {

			if (await redisFunctions.exists_in_cache("publicWikis")) {
				return res.json(await redisFunctions.get("publicWikis")); // REDIS
			}

			const public_wikis = await wikiDataFunctions.getAllPublicWikis();

			// await redisFunctions.set("publicWikis", public_wikis); // REDIS (This line is breaking the browse page)

			return res.json(public_wikis);

		} catch (e) {
			return res.status(500).json({ error: e });
		}
	});

router.route("/search").post(async (req: any, res) => {
	
	if (!req.user) {
		return res
			.status(401)
			.json({ error: "You must be logged in to perform this action." });
	}

	const searchTerm = req.body.searchTerm.trim();
	if (searchTerm.length > 50) {
		return res
			.status(400)
			.json({ error: "Wiki names are less than 50 characters" });
	}

	try {
		const returnValue = await wikiDataFunctions.searchWikisByName(searchTerm);

		return res.json(returnValue);
	} catch (e) {
		return res.status(500).json({ error: e });
	}

	return;
});

router
	.route("/urlTaken/:url")
	
	/**
	 *! Checks if the wiki URL name is already taken.
	 *! Used for real-time feedback.
	 */
	.post(async (req, res) => {
	
	let url = req.params.url.trim();
	//console.log(url);
	try {
		url = checkUrlName(url, "URL Taken route");
	} catch (e) {
		return res.json({ error: e });
	}
	const takenURLs = await wikiDataFunctions.getAllWikiUrlNames();
	if (takenURLs.includes(url.toLowerCase())) {
		return res.json({ error: "URL taken" });
	}
	return res.json({ message: "URL available" });
	});

router
	.route("/:urlName")

	/**
	 *! Returns the wiki specified by "req.params.urlName".
	 */
	.get(async (req: any, res) => {

		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		let urlName = req.params.urlName;

		// This comes before checking the cache in order to trim the string first.
		try {
			urlName = checkUrlName(urlName);
		} catch (e) {
			return res.status(400).json({error: e});
		}

		if (await redisFunctions.exists_in_cache(urlName)) {
			let cached_wiki = await redisFunctions.get_json(urlName); // REDIS
			if (
				cached_wiki.access !== "public-edit"
				&&
				cached_wiki.access !== "public-view"
				&&
				cached_wiki.owner !== req.user.uid
				&&
				!(cached_wiki.collaborators.includes(req.user.uid))
				&&
				!(cached_wiki.private_viewers.includes(req.user.uid))
			) {
				return res.status(403).json({error: "You do not have access to this wiki."});
			} else {
				return res.json(cached_wiki);
			}
		}

		try {
			
			let wiki: any = await wikiDataFunctions.getWikiByUrlName(urlName);

			if (
				wiki.owner !== req.user.uid &&
				!wiki.collaborators.includes(req.user.uid) &&
				wiki.access !== "public-edit" &&
				wiki.access !== "public-view"
			) {
				return res
					.status(403)
					.json({ error: "You do not permission to access this resource." });
			}

			await redisFunctions.set_json(urlName, wiki); // REDIS

			return res.json(wiki);

		} catch (e) {
			return res.json(400).json({ error: e });
		}
	})

	/**
	 * Edits the wiki specified by "req.params.id".
	 */
	.patch(async (req, res) => {
		return;
	})

	/**
	 * Deletes the wiki specified by "req.params.id".
	 */
	.delete(async (req, res) => {
		return;
	});

router
	.route("/:urlName/category/:category")

	/**
	 * ! Returns a list of pages associated with the wiki URL name and category.
	 * TODO: THIS ROUTE IS MARKED FOR DELETION
	 */
	.get(async (req: any, res) => {


		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		let wikiUrlName = req.params.urlName;
		let category = req.params.category;
		let wiki: any;

		// Basic input validation.
		try {
			wikiUrlName = checkUrlName(wikiUrlName, "GET /:urlName/:category");
			category = checkCategory(category, "GET /:urlName/:category");
		} catch (e) {
			return res.status(400).json({ error: e });
		}

		// Check if wiki exists.
		try {
			wiki = await wikiDataFunctions.getWikiByUrlName(wikiUrlName);
		} catch (e) {
			return res.status(404).json({ error: e });
		}

		// Call the data function.
		try {
			return res.json(
				await pageDataFunctions.getPagesByCategory(
					wiki._id.toString(),
					category
				)
			);
		} catch (e) {
			return res.status(500).json({ error: e });
		}
	});

router
	.route("/:wikiId/categories")

	/**
	 *! Creates a new category in the wiki
	 */
	.post(async (req: any, res) => {
		//console.log("POST /:wikiId/categories");

		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		let wikiId = req.params.wikiId;
		let { categoryName } = req.body;

		let wiki;
		try {
			categoryName = checkCategory(categoryName, "POST :wikiId/categories route");
			wiki = await wikiDataFunctions.getWikiById(wikiId);
		} catch (e) {
			return res.status(400).json({ error: e });
		}

		try {

			let updatedWiki = await (wikiDataFunctions.createCategory(
				wiki._id,
				categoryName
			));

			await redisFunctions.set_json(wiki.urlName, updatedWiki); // REDIS

			return res.json(updatedWiki);

		} catch (e) {
			return res.status(500).json({ error: e });
		}
	})

	/**
	 *! Edits an existing category in the wiki.
	 */
	.patch(async (req: any, res) => {

		// Make sure user is logged in.
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		// Retrieve path and request body parameters.
		let wikiId = req.params.wikiId;
		let { oldCategoryName, newCategoryName } = req.body;

		// Input validation.
		try {

			wikiId = checkId(wikiId, "Wiki");
			oldCategoryName = checkCategory(oldCategoryName); // this should never error
			newCategoryName = checkCategory(newCategoryName);

		} catch (e) {

			return res.status(400).json({error: e});

		}

		// Check if wiki exists.
		let wiki;
		try {

			wiki = await wikiDataFunctions.getWikiById(wikiId);
		
		} catch (e) {
			
			return res.status(404).json({error: e});
		
		}

		// Call the edit function.
		try {

			let updatedWiki = await (wikiDataFunctions.editCategory(wikiId, oldCategoryName, newCategoryName));

			await redisFunctions.set_json(wiki.urlName, updatedWiki); // REDIS

			return res.json(updatedWiki);

		} catch (e) {

			return res.status(500).json({error: e});

		}

	})

	/**
	 *! Deletes a category from the wiki.
	 */
	.delete(async (req: any, res) => {

		//console.log("DELETE /:wikiId/categories");

		// Make sure user is logged in.
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		// Retrieve path and request body parameters.
		let wikiId = req.params.wikiId;
		let { categoryName } = req.body;

		// Input validation.
		try {

			wikiId = checkId(wikiId, "Wiki");
			categoryName = checkCategory(categoryName);

		} catch (e) {

			return res.status(400).json({error: e});

		}

		// Check if wiki exists.
		let wiki;
		try {

			wiki = await wikiDataFunctions.getWikiById(wikiId);
		
		} catch (e) {
			
			return res.status(404).json({error: e});
		
		}

		// Call the edit function.
		try {

			let updatedWiki = await (wikiDataFunctions.deleteCategory(wikiId, categoryName));

			await redisFunctions.set_json(wiki.urlName, updatedWiki); // REDIS

			return res.json(updatedWiki);

		} catch (e) {

			return res.status(500).json({error: e});

		}

	});

router
	.route("/:id/pages")
	/**
	 * Creates a new page in the wiki
	 */
	.post(async (req: any, res) => {
		
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		let wikiId = req.params.id;
		let { pageName, category } = req.body;

		// 400: Input validation
		try {
			wikiId = checkId(wikiId, "Wiki");
			pageName = checkWikiOrPageName(pageName, "POST :/id/pages");
			category = checkCategory(category, "POST :/id/pages");
		} catch (e) {
			return res.status(400).json({ error: e });
		}

		// 404: Check if wiki exists.
		let wiki;
		try {
			wiki = await wikiDataFunctions.getWikiById(wikiId);
		} catch (e) {
			return res.status(404).json({error: e});
		}


		try {
			let updatedWiki = await pageDataFunctions.createPage(
				wikiId,
				pageName,
				category
			);

			await redisFunctions.set_json(wiki.urlName, updatedWiki);

			return res.json(updatedWiki);

			//return res.json({ pageId: newPage._id.toString(), page: newPage });

		} catch (e) {
			return res.status(500).json({ error: e });
		}
	});

router
	.route("/:wikiUrlName/pages/:pageUrlName")

	/**
	 * TODO: THIS ROUTE IS MARKED FOR DELETION
	 */
	.get(async (req: any, res) => {
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		let wikiUrlName = req.params.wikiUrlName;
		let pageUrlName = req.params.pageUrlName;
		let wiki: any;

		// Input validation.
		try {
			wikiUrlName = checkUrlName(wikiUrlName);
			pageUrlName = checkString(pageUrlName, "Page URL");
		} catch (e) {
			return res.status(400).json({ error: e });
		}

		// Check if wiki exists.
		try {
			wiki = await wikiDataFunctions.getWikiByUrlName(wikiUrlName);
		} catch (e) {
			return res.status(404).json({ error: e });
		}

		// Get page from wiki document.
		try {
			return res.json(
				await pageDataFunctions.getPageByUrlName(wiki._id, pageUrlName)
			);
		} catch (e) {
			return res.status(404).json({ error: `${e}` });
		}
	});

router
	.route("/:urlName/pages/:pageId/content")

	/**
	 * ! Updates page content
	 */
	.post(async (req: any, res) => {
		
		
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		// Get path and request body parameters.
		let urlName = req.params.urlName;
		let pageId = req.params.pageId;
		let {content} = req.body;

		// 400: Input validation
		try {
			urlName = checkUrlName(urlName);
			pageId = checkId(pageId, "Page");
			content = checkContentArray(content);
		} catch (e) {
			return res.status(400).json({error: e});
		}

		// 404: Check if wiki exists.
		let wiki;
		try {

			// Get wiki by urlName to get the ID
			wiki = await wikiDataFunctions.getWikiByUrlName(urlName);

		} catch (e) {
			return res.status(404).json({error: e});
		}

		try {
			const updatedWiki = await pageDataFunctions.changePageContent(
				wiki._id.toString(),
				pageId,
				content
			);

			//return res.json(updatedPage);

			await redisFunctions.set_json(urlName, updatedWiki);
			return res.json(updatedWiki);

		} catch (e) {
			return res.status(500).json({ error: e });
		}
	});

//! IGNORE EVERYTHING BELOW THIS LINE

/**
 * Spesific wiki (actions) By id
 */
router
	.route("/:id/save")
	/**
	 * Save changes to wiki
	 * Requires wiki content in body
	 */
	.post(async (req, res) => {
		
		return;
	});

router
	.route("/:id/publish")
	/**
	 * Publish changes publicly
	 */
	.post(async (req, res) => {
		
		return;
	});

/**
 * Wiki collaborator actions
 */
router
	.route("/:id/collaborators")
	/**
	 * List collaborators on wiki
	 */
	.get(async (req:any, res) => {
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}
		const wikiId = req.params.id.trim();
		try {
			checkId(wikiId, "wiki", "POST /:id/collaborators");
		} catch (e){
			return res.status(400).json({error: e})
		}

		try {
			
			const wiki = await wikiDataFunctions.getWikiById(wikiId);

			const collaborators = wiki.collaborators;

			const usernames = [];
			for (let account of collaborators){
				let user = await user_data_functions.getUserByFirebaseUID(account);
				usernames.push(user.username)
			}

			return res.json(usernames);

		} catch (e) {

			return res 
				.status(500)
				.json({error: e})

		}


	})

	/** 
	 * Add collaborator to wiki 
	 * (specify collaborator in body) 
	 */ 
	.post(async (req: any, res) => {
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		let username = ""
		const wikiId = req.params.id.trim();
		try {
			checkId(wikiId, "wiki", "POST /:id/collaborators");
			username = checkUsername(req.body.username, "POST");
		} catch (e){
			return res.status(400).json({error: e})
		}
		let user = ""

		try {
			user = await userDataFunctions.getUserIdByUsername(username)
		} catch (e){
			return res.status(404).json({error: "User not found"})
		}

		try {
			//console.log(user)
			const retVal = await wikiDataFunctions.addCollaborator(wikiId, user)
			//console.log(retVal)
			return res.json(retVal);

		} catch (e) {
			return res 
				.status(500)
				.json({error: e})
		}
		
	})

	/**
	 * Remove collaborator
	 * (specify collaborator in body)
	 */
	.delete(async (req:any, res) => {
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		let username = ""
		const wikiId = req.params.id.trim();
		try {
			checkId(wikiId, "wiki", "DELETE /:id/collaborators");
			username = checkUsername(req.body.username, "POST");
		} catch (e){
			return res.status(400).json({error: e})
		}
		let user = ""

		try {
			user = await userDataFunctions.getUserIdByUsername(username)
		} catch (e){
			return res.status(404).json({error: "User not found"})
		}

		try {

			//console.log(user)
			const retVal = await wikiDataFunctions.removeCollaborator(wikiId, user);
			return res.json(retVal);

		} catch (e) {

			return res 
				.status(500)
				.json({error: e})
		}
	});

export default router;
