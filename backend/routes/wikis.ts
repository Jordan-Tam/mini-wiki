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
	checkUsername,
	checkUrlName2
} from "../helpers.ts";
import user_data_functions from "../data/users.ts";
import wiki_data_functions from "../data/wikis.ts";
import { Wiki } from "../data/types.ts";
import redis_functions from "../lib/redis/redis.ts";

export const router = Router();

/**
 * This object will be used to manage how the routes responds to outdated information in the Redis cache.
 * Options: ["UPDATE", "DELETE"]
 * UPDATE: When an entry becomes outdated, immediately replace it with an up-to-date version of it.
 * DELETE: When an entry becomes outdated, delete it (the entry will only be cached the next time the resource is accessed).
 */
const redis_policy = {

	/**
	 * KEY OF ENTRY: publicWikis
	 * VALUE OF ENTRY: List of public-edit/public-view wikis.
	 * 
	 * EVENTS THAT CAUSE THE VALUE TO BECOME OUTDATED:
	 	* A new public wiki is created.
		* A public wiki is deleted.
		* A public wiki's description is updated.
		* A user favorites a public wiki.
		* A user unfavorites a public wiki.
	 */
	publicWikis_policy: "UPDATE",

	/**
	 * KEY OF ENTRY: ${req.user.uid}/getWikisByUser
	 * VALUE OF ENTRY: An object containing three array fields: OWNER, COLLABORATOR, and PRIVATE VIEWER.
	 * 
	 * EVENTS THAT CAUSE THE VALUE TO BECOME OUTDATED:
	 	* The user creates a new wiki.
		* The user deletes a wiki they own.
		* The user is added as a collaborator to a wiki.
		* The user is removed as a collaborator a wiki.
		* A wiki they are a collaborator of is deleted.
		* The user is added as a private viewer to a wiki.
		* A wiki they are a private viewer of is deleted.
		* The description of any of the above wikis is updated.
	 */
	getWikisByUser_policy: "UPDATE",

	/**
	 * KEY OF ENTRY: ${wiki.urlName}
	 * VALUE OF ENTRY: Wiki object.
	 * 
	 * EVENTS THAT CAUSE THE VALUE TO BECOME OUTDATED:
	 	* The description is updated.
		* A new category is created. 
		* A category's name is updated.
		* A category is deleted.
		* A page is created.
		* A page is moved to another category.
		* A collaborator is added.
		* A collaborator is removed.
		* A private viewer is added.
		* A private viewer is removed.
		* The wiki is deleted.
		* One of the wiki's page's contents are changed.
	 */
	wiki_policy: "UPDATE",

	/**
	 * KEY OF ENTRY: ${req.user.uid}
	 * VALUE OF ENTRY: User object.
	 * 
	 * EVENTS THAT CAUSE THE VALUE TO BECOME OUTDATED:
	 	* The user changes their username.
		* The user updates their bio.
		* The user favorites a wiki.
		* The user unfavorites a wiki.
	 */
	user_policy: "UPDATE"
}

router
	.route("/")

	/**
	 *! Returns an object of three arrays: OWNER, COLLABORATOR, and PRIVATE_VIEWER.
	 */
	.get(async (req: any, res: any) => {

		// REDIS: Check if the object already exists in cache.
		if (await redisFunctions.exists_in_cache(`${req.user.uid}/getWikisByUser`)) {
			return res.json(await redisFunctions.get_json(`${req.user.uid}/getWikisByUser`));
		}

		let wikis;
		try {
			wikis = await wikiDataFunctions.getWikisByUser(req.user.uid);
		} catch (e) {
			return res.status(500).json({error: e});
		}

		// REDIS: Add the object to the cache.
		await redisFunctions.set_json(`${req.user.uid}/getWikisByUser`, wikis);

		return res.json(wikis);

	})

	/**
	 *! Creates a wiki.
	 */
	.post(async (req: any, res) => {
		

		const FORBIDDEN_WIKI_URL_NAMES = [
          "discover",
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
				throw `Cannot use this wiki name.`
			}
			description = checkDescription(description);
			access = checkAccess(access);

		} catch (e) {
			return res.status(400).json({ error: e });
		}

		let wiki;
		try {

			wiki = await wikiDataFunctions.createWiki(
				name,
				urlName,
				description,
				access,
				(req as any).user.uid
			);

			// REDIS: The getWikisByUser entry is now outdated because there is a new wiki in the OWNER list, so update/delete it from the cache.
			if (redis_policy.wiki_policy === "UPDATE") {

				await redisFunctions.set_json(
					`${(req as any).user.uid}/getWikisByUser`,
					await wikiDataFunctions.getWikisByUser((req as any).user.uid)
				);

			} else {
				
				await redisFunctions.del_json(`${(req as any).user.uid}/getWikisByUser`);

			}

			// REDIS: If the wiki is public, update/delete the public wikis entry from the cache.
			if (wiki.access === "public-edit" || wiki.access === "public-view") {
				
				//await redisFunctions.set_json("publicWikis", await wikiDataFunctions.getAllPublicWikis());
				await redisFunctions.del_json("publicWikis");

			}

			// REDIS: Add the newly created wiki to the cache.
			// TODO:

			return res.json(wiki);
			

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

		try {

			// REDIS: Check if the public wikis array already exists in cache.
			if (await redisFunctions.exists_in_cache("publicWikis")) {
				return res.json(await redisFunctions.get_json("publicWikis"));
			}

			const public_wikis = await wikiDataFunctions.getAllPublicWikis();

			// REDIS: Add the public wikis array to the cache.
			await redisFunctions.set_json("publicWikis", public_wikis);

			return res.json(public_wikis);

		} catch (e) {
			return res.status(500).json({ error: e });
		}
	});

router.route("/search").post(async (req: any, res) => {

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


		let urlName = req.params.urlName;

		// This comes before checking the cache in order to trim the string first.
		try {
			urlName = checkUrlName(urlName);
		} catch (e) {
			return res.status(400).json({error: e});
		}

		// REDIS: Check if the wiki object already exists in the cache.
		if (await redisFunctions.exists_in_cache(urlName)) {

			let cached_wiki = await redisFunctions.get_json(urlName);

			// Ensure that the user is authorized to view this wiki.
			if (wikiDataFunctions.authorized(cached_wiki, req.user.uid)) {

				return res.json(cached_wiki);

			} else {

				return res.status(403).json({error: "You do not have access to this wiki."});
			
			}
		}

		try {
			
			let wiki: any = await wikiDataFunctions.getWikiByUrlName(urlName);

			if (wikiDataFunctions.authorized(wiki, req.user.uid)) {

				// REDIS: Cache the wiki object.
				await redisFunctions.set_json(urlName, wiki);

				return res.json(wiki);

			} else {

				return res.status(403).json({error: "You do not have access to this wiki."});

			}

		} catch (e) {
			return res.status(404).json({ error: e });
		}
	})

	/**
	 * Edits the wiki specified by "req.params.id".
	 * expect req.body.name, req.body.description
	 */
	.patch(async (req, res) => {
		const wikiUrl = req.params.urlName.trim();

		// test req body
		if(!req.body) {
			return res.status(400).json({error: `Missing request body.`});
		}

		try {
            checkWikiOrPageName(req.body.name as string);
        } catch (e) {
            return res.status(400).json({error: `Invalid wiki name.`});
        }

        try {
            checkDescription(req.body.description as string);
        } catch (e) {
            return res.status(400).json({error: `Invalid wiki description.`});
        }

		// test if wiki exists
		let wiki:Wiki;
		try {
			wiki = await wiki_data_functions.getWikiByUrlName(wikiUrl);
		} catch (e) {
			return res.status(404).json({error: `Wiki not found.`});
		}

		const wikiId = wiki._id.toString();

		let update:Wiki;
		try {
			await wiki_data_functions.changeWikiName(wikiId, req.body.name);
			update = await wiki_data_functions.changeWikiDescription(wikiId, req.body.description);
		} catch (e) {
			return res.status(500).json({error: `Failed to update wiki: ${e}`});
		}

		// redis update
		await redis_functions.set_json(update.urlName, update);

		let redis_target_uids = [...wiki.collaborators, ...wiki.private_viewers, wiki.owner];
		for(const uid of redis_target_uids) {
			await redis_functions.del(`${uid}/getWikisByUser`);
		}

		return res.status(200).json(update);
	})

	/**
	 * Deletes the wiki specified by "req.params.id".
	 */
	.delete(async (req: any, res) => {
		console.log("deleting wiki route")
		// I'm just sending the id over as urlName to make it easier.
		let wikiId = req.params.urlName

		// Input validation
		try {
			wikiId = checkId(wikiId, "wikiId", "Delete Wiki route")
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

		// Check if the user is allowed to delete the wiki.
		try {
			if (wiki.owner !== req.user.uid) {
				throw "You can only delete wikis you own.";
			}
		} catch (e) {
			return res.status(403).json({error: e});
		}

		// Delete the wiki.
		try {

			await wikiDataFunctions.deleteWiki(wikiId);

			// REDIS: The ${req.user.uid}/getWikisByUser entry is now outdated. Update/delete it from the cache.
			await redisFunctions.del_json(`${req.user.uid}/getWikisByUser`);
			
			// REDIS: Delete the wiki object from the cache.
			await redisFunctions.del_json(`${wiki.urlName}`);

			// REDIS: If the wiki is not private, update/delete the public wikis entry from the cache.
			if(wiki.access !== "private"){
				await redisFunctions.del_json(`publicWikis`);
			}

		} catch (e) {

			return res.status(500).json({error: e})
		
		}

		return res.json({message: "Success"});

	});

router
	.route("/:urlName/category/:category")

	/**
	 * ! Returns a list of pages associated with the wiki URL name and category.
	 * TODO: THIS ROUTE IS MARKED FOR DELETION
	 */
	.get(async (req: any, res) => {

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

		let wikiId = req.params.wikiId;
		let { categoryName } = req.body;

		// 400: Input validation.
		try {
			wikiId = checkId(wikiId, "Wiki", "POST :wikiId/categories route");
			categoryName = checkCategory(categoryName, "POST :wikiId/categories route");
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

		// 500: Update the wiki.
		try {

			let updatedWiki = await (wikiDataFunctions.createCategory(
				wiki._id,
				categoryName
			));

			// REDIS: The wiki.urlName entry in the cache is now outdated because a new category has been added. Update/delete it from the cache. There is no need to update the publicWikis or getWikisByUser entries because when those entries are retrieved, the categories are not being displayed.
			await redisFunctions.set_json(wiki.urlName, updatedWiki);

			return res.json(updatedWiki);

		} catch (e) {
			return res.status(500).json({ error: e });
		}
	})

	/**
	 *! Edits an existing category in the wiki.
	 */
	.patch(async (req: any, res) => {

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

			// REDIS: The wiki.urlName entry in the cache is now outdated because a category has been edited. Update/delete it from the cache. There is no need to update the publicWikis or getWikisByUser entries because when those entries are retrieved, the categories are not being displayed.
			await redisFunctions.set_json(wiki.urlName, updatedWiki);

			return res.json(updatedWiki);

		} catch (e) {

			return res.status(500).json({error: e});

		}

	})

	/**
	 *! Deletes a category from the wiki.
	 */
	.delete(async (req: any, res) => {

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

		// Call the delete function.
		try {

			let updatedWiki = await (wikiDataFunctions.deleteCategory(wikiId, categoryName));

			// REDIS: The wiki.urlName entry in the cache is now outdated because a category has been deleted. Update/delete it from the cache. There is no need to update the publicWikis or getWikisByUser entries because when those entries are retrieved, the categories are not being displayed.
			await redisFunctions.set_json(wiki.urlName, updatedWiki);

			return res.json(updatedWiki);

		} catch (e) {

			return res.status(500).json({error: e});

		}

	});

router
	.route("/:id/pages")
	
	/**
	 * ! Creates a new page in the wiki
	 */
	.post(async (req: any, res) => {

		let wikiId = req.params.id;
		let { pageName, category } = req.body;

		// 400: Input validation
		try {
			wikiId = checkId(wikiId, "Wiki");
			pageName = checkUrlName2(pageName, "POST :/id/pages");
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

		// 500: Add the page.
		try {
			let updatedWiki = await pageDataFunctions.createPage(
				wikiId,
				pageName,
				category,
				req.user.uid
			);

			// REDIS: The wiki.urlName entry in the cache is now outdated because a new page has been created. Update/delete it from the cache. There is no need to update the publicWikis or getWikisByUser entries because when those entries are retrieved, the categories are not being displayed.
			await redisFunctions.set_json(wiki.urlName, updatedWiki);

			return res.json(updatedWiki);

			//return res.json({ pageId: newPage._id.toString(), page: newPage });

		} catch (e) {
			return res.status(500).json({ error: e });
		}
	});

router 
	.route("/:id/private_viewer")

	/**
	 * ! Get a list of private viewers.
	 */
	.get(async (req:any, res) => {

		const wikiId = req.params.id.trim();
		try {
			checkId(wikiId, "wiki", "GET /:id/private_viewer");
		} catch (e){
			return res.status(400).json({error: e})
		}

		try {
			
			const wiki = await wikiDataFunctions.getWikiById(wikiId);

			const private_viewers = wiki.private_viewers;

			const user_list = [];
			for (let account of private_viewers){
				let user = await user_data_functions.getUserByFirebaseUID(account);
				user_list.push(user)
			}

			return res.json(user_list);

		} catch (e) {

			return res 
				.status(500)
				.json({error: e})

		}


	})

	/**
	 * ! Add a new private viewer.
	 */
	.post(async (req: any, res) => {

		let username = ""
		const wikiId = req.params.id.trim();
		try {

			checkId(wikiId, "wiki", "POST /:id/private_viewer");
			username = checkUsername(req.body.username, "POST");

		} catch (e){
			return res.status(400).json({error: e});
		}
		let user = ""

		try {
			user = await userDataFunctions.getUserIdByUsername(username)
		} catch (e){
			return res.status(404).json({error: "User not found"})
		}

		// 404: Check if wiki exists.
		let wiki;
		try {
			wiki = await wikiDataFunctions.getWikiById(wikiId);
		} catch (e) {
			return res.status(404).json({error: "Wiki not found"});
		}

		try {
			
			const retVal = await wikiDataFunctions.addPrivateViewer(wikiId, user)
			
			// REDIS: The wiki.urlName entry in the cache is now outdated because a private viewer has been added. Update/delete it from the cache.
			await redisFunctions.set_json(wiki.urlName, retVal);

			// REDIS: Update/delete the getWikisByUser entry of the new private viewer so that their home page displays the new wiki they can see.
			await redisFunctions.set_json(
				`${user}/getWikisByUser`,
				await wikiDataFunctions.getWikisByUser(user)
			);

			// REDIS: There is no need to update the publicWikis entry because this is a private wiki so it doesn't appear in that list.

			return res.json(retVal);

		} catch (e) {
			return res 
				.status(500)
				.json({error: e})
		}
		
	})

	/**
	 * ! Remove a private viewer.
	 */
	.delete(async (req:any, res) => {

		let username = ""
		const wikiId = req.params.id.trim();
		try {
			checkId(wikiId, "wiki", "DELETE /:id/private_viewers");
			username = checkUsername(req.body.username, "POST");
		} catch (e){
			return res.status(400).json({error: e})
		}
		let user = ""

		// 404: Check if user exists.
		try {
			user = await userDataFunctions.getUserIdByUsername(username);
		} catch (e){
			return res.status(404).json({error: "User not found"});
		}

		// 404: Check if wiki exists.
		let wiki;
		try {
			wiki = await wikiDataFunctions.getWikiById(wikiId);
		} catch (e) {
			return res.status(404).json({error: "Wiki not found"});
		}

		// 500: Delete the private viewer.
		try {

			const retVal = await wikiDataFunctions.removePrivateViewer(wikiId, user);

			// REDIS: The wiki.urlName entry in the cache is now outdated because a private viewer has been deleted. Update/delete it from the cache.
			await redisFunctions.set_json(wiki.urlName, retVal);

			// REDIS: Update/delete the getWikisByUser entry of the removed private viewer so that their home page no longer displays the wiki.
			await redisFunctions.set_json(
				`${user}/getWikisByUser`,
				await wikiDataFunctions.getWikisByUser(user)
			);

			// REDIS: There is no need to update the publicWikis entry because this is a private wiki so it doesn't appear in that list.

			return res.json(retVal);

		} catch (e) {

			return res 
				.status(500)
				.json({error: e})
		}
	});

router
	.route("/:wikiUrlName/pages/:pageUrlName")

	/**
	 * TODO: THIS ROUTE IS MARKED FOR DELETION
	 */
	.get(async (req: any, res) => {

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
	})

	.patch(async (req: any, res) => {
		let wikiUrlName = req.params.wikiUrlName;
        let pageUrlName = req.params.pageUrlName;
        let wiki: any;
		let page: any;
		let newCategory = req.body.newCategory;
		let newCategory: any;

		try {

			pageUrl = checkUrlName(pageUrlName)
			wikiUrlName = checkUrlName(wikiUrlName);
			newCategory = checkCategory(newCategory, "PATCH ")

		} catch (e) {

			return res.status(400).json({error: e})

		}

		try {

			page = getPageByUrlName(pageUrlName)
			wiki = getWikiByUrlName(wikiUrlName)
			if (!wiki.categories.includes(newCategory)) {
				throw "NEW CATEGORY DOES NOT EXIST.";
			}

		} catch (e) {

			return res.status(404).json({error: e})

		}

		try {

			await pageDataFunctions.changePageCategory(wiki._id, page._id, newCategory);
			return res.json({changed: true})
		} catch (e) {

			returm res.status(500).json({error: e})
			
		}

	})
	/**
	 * ! Delete a page from a wiki.
	 */
	.delete(async (req: any, res) => {
		//console.log("DELETE PAGE")

		let wikiUrlName = req.params.wikiUrlName;
        let pageUrlName = req.params.pageUrlName;
        let wiki: any;
		let page: any;

		// Input validation.
		try {
			wikiUrlName = checkUrlName(wikiUrlName);
			pageUrlName = checkString(pageUrlName, "Page URL");
		} catch (e) {
			return res.status(400).json({ error: e });
		}

		// Check if wiki exists and get page with page name.
		try {
			wiki = await wikiDataFunctions.getWikiByUrlName(wikiUrlName);
			page = await pageDataFunctions.getPageByUrlName(wiki._id, pageUrlName);
		} catch (e) {
			return res.status(404).json({ error: e });
		}

		if(req.user.uid !== wiki.owner && !wiki.collaborators.includes(req.user.uid)){
			return res.status(403).json({error: "You are not an owner/collaborator of this wiki."})
		}

		try{
			await pageDataFunctions.deletePage(wiki._id, page._id);
		} catch (e) {
			console.log("ts fucked up")
			return res.status(500).json({error: e});
		}

        await redisFunctions.del_json(`${wikiUrlName}`);
		
		return res.json({message: "Success"})

	});



	
router
	.route("/:urlName/pages/:pageId/content")

	/**
	 * ! Updates page content
	 */
	.post(async (req: any, res) => {

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

		// 500: Change the page content.
		try {
			const updatedWiki = await pageDataFunctions.changePageContent(
				wiki._id.toString(),
				pageId,
				content,
				req.user.uid
			);

			// REDIS: The wiki.urlName entry in the cache is now outdated because a page's contents have been edited. Update/delete it from the cache.
			await redisFunctions.set_json(wiki.urlName, updatedWiki);

			// REDIS: There is no need to update the publicWikis or getWikisByUser entries because when those entries are retrieved, the pages are not being displayed.

			await redisFunctions.set_json(urlName, updatedWiki);

			return res.json(updatedWiki);

		} catch (e) {
			return res.status(500).json({ error: e });
		}
	});

/**
 * Wiki collaborator actions
 */
router
	.route("/:id/collaborators")

	/**
	 *! List collaborators on wiki
	 */
	.get(async (req:any, res) => {

		const wikiId = req.params.id.trim();
		try {
			checkId(wikiId, "wiki", "POST /:id/collaborators");
		} catch (e){
			return res.status(400).json({error: e})
		}

		try {
			
			const wiki = await wikiDataFunctions.getWikiById(wikiId);

			const collaborators = wiki.collaborators;

			const user_list = [];
			for (let account of collaborators){
				let user = await user_data_functions.getUserByFirebaseUID(account);
				user_list.push(user)
			}

			return res.json(user_list);

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

		let username = ""
		const wikiId = req.params.id.trim();
		try {
			checkId(wikiId, "wiki", "POST /:id/collaborators");
			username = checkUsername(req.body.username, "POST");
		} catch (e){
			return res.status(400).json({error: e})
		}
		let user = ""

		// 404: Check if user exists.
		try {
			user = await userDataFunctions.getUserIdByUsername(username);
		} catch (e){
			return res.status(404).json({error: "User not found"});
		}

		// 404: Check if wiki exists.
		let wiki;
		try {
			wiki = await wikiDataFunctions.getWikiById(wikiId);
		} catch (e) {
			return res.status(404).json({error: "Wiki not found"});
		}

		try {
			const retVal = await wikiDataFunctions.addCollaborator(wikiId, user);

			// REDIS: The wiki.urlName entry in the cache is now outdated because a collaborator has been added. Update/delete it from the cache.
			await redisFunctions.set_json(wiki.urlName, retVal);

			// REDIS: Update/delete the getWikisByUser entry of the new collaborator so that their home page displays the new wiki in the COLLABORATOR section.
			await redisFunctions.set_json(
				`${user}/getWikisByUser`,
				await wikiDataFunctions.getWikisByUser(user)
			);

			// REDIS: There is no need to update the publicWikis entry because the Discover page is not displaying the collaborators lists so the outdated entry is still okay to use.

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

		let username = ""
		const wikiId = req.params.id.trim();
		try {
			checkId(wikiId, "wiki", "DELETE /:id/collaborators");
			username = checkUsername(req.body.username, "POST");
		} catch (e){
			return res.status(400).json({error: e})
		}
		let user = ""

		// 404: Check if user exists.
		try {
			user = await userDataFunctions.getUserIdByUsername(username);
		} catch (e){
			return res.status(404).json({error: "User not found"});
		}

		// 404: Check if wiki exists.
		let wiki;
		try {
			wiki = await wikiDataFunctions.getWikiById(wikiId);
		} catch (e) {
			return res.status(404).json({error: "Wiki not found"});
		}

		try {

			const retVal = await wikiDataFunctions.removeCollaborator(wikiId, user);
			
			// REDIS: The wiki.urlName entry in the cache is now outdated because a collaborator has been removed. Update/delete it from the cache.
			await redisFunctions.set_json(wiki.urlName, retVal);

			// REDIS: Update/delete the getWikisByUser entry of the removed collaborator so that their home page no longer displays the wiki in their COLLABORATOR section.
			await redisFunctions.set_json(
				`${user}/getWikisByUser`,
				await wikiDataFunctions.getWikisByUser(user)
			);

			// REDIS: There is no need to update the publicWikis entry because the Discover page is not displaying the collaborators lists so the outdated entry is still okay to use.
			
			return res.json(retVal);

		} catch (e) {

			return res 
				.status(500)
				.json({error: e})
		}
	});

/**
 * Transfer ownership route
 */
router.route("/:urlname/transfer/:userId/:newOwnerId")
	.post(async (req,res) => {
		const wikiId = req.params.urlname.trim();
		const userId = req.params.userId.trim();
		const newOwnerId = req.params.newOwnerId.trim();

		let wiki;
		try {
			wiki = await wiki_data_functions.getWikiById(wikiId);
		} catch (e) {
			return res.status(404).json({error: `Wiki not found!`});
		}

		console.log(`Transf:: ${userId} ${newOwnerId}`);
		if(typeof userId !== "string" || typeof newOwnerId !== "string") {
			return res.status(400).json({error: `Missing fields. Expected userId:string, newOwnerId:string`});
		}

		// check if user is owner of wiki
		if(wiki.owner !== userId.trim()) {
			return res.status(401).json({error: `You must be the owner of the wiki to transfer ownership.`});
		}

		// transfer wiki owner
		let newWiki;
		try {
			newWiki = await wiki_data_functions.changeWikiOwner(wikiId, userId, newOwnerId);
			await redisFunctions.set_json(wiki.urlName, newWiki);
			await redisFunctions.set_json(
				`${userId}/getWikisByUser`,
				await wikiDataFunctions.getWikisByUser(userId)
			);
			await redisFunctions.set_json(
				`${newOwnerId}/getWikisByUser`,
				await wikiDataFunctions.getWikisByUser(newOwnerId)
			);
		} catch (e) {
			return res.status(500).json({error: `Failed to update wiki owner: ${e}`})
		}

		return res.status(200).json(newWiki);
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



export default router;
