import { Router } from "express";
import { createClient } from "redis";
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
	checkWikiOrPageName
} from "../helpers.ts";

export const router = Router();

/* const client = createClient();
await client.connect(); */

router
	.route("/")

	/**
	 *! Returns every wiki where the user is an owner or collaborator.
	 */
	.get(async (req: any, res: any) => {
		if (!req.user) {
			return res.status(401).json({
				error: "/wiki: You must be logged in to perform this action."
			});
		}

		/* let exists_in_cache = await clientInformation.exists(``) */

		return res.json({
			wikis: await wikiDataFunctions.getWikisByUser(req.user.uid)
		});
	})

	/**
	 *! Creates a wiki.
	 */
	.post(async (req, res) => {
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

		//console.log(req.body);
		let { name, urlName, description, access } = req.body;
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
			return res.json(
				await wikiDataFunctions.createWiki(
					name,
					urlName,
					description,
					access,
					(req as any).user.uid
				)
			);
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
			const wikis = await wikiDataFunctions.getAllWikis();

			const public_wikis = [];
			for (let wiki of wikis) {
				if (wiki.access === "public-edit" || wiki.access === "public-view") {
					public_wikis.push(wiki);
				}
			}

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
	console.log(url);
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
	 *! Returns a list of pages associated with the wiki URL name and category.
	 */
	.get(async (req: any, res) => {

		console.log("hi");

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

		console.log("POST /:wikiId/categories");

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
			return res.json(await (wikiDataFunctions.createCategory(
				wiki._id,
				categoryName
			)));
			/* return res.json({ name: categoryName, wiki: updatedWiki }); */
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
		try {

			await wikiDataFunctions.getWikiById(wikiId);
		
		} catch (e) {
			
			return res.status(404).json({error: e});
		
		}

		// Call the edit function.
		try {

			return res.json(await (wikiDataFunctions.editCategory(wikiId, oldCategoryName, newCategoryName)));

		} catch (e) {

			return res.status(500).json({error: e});

		}

	})

	/**
	 *! Deletes a category from the wiki.
	 */
	.delete(async (req: any, res) => {

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
		try {

			await wikiDataFunctions.getWikiById(wikiId);
		
		} catch (e) {
			
			return res.status(404).json({error: e});
		
		}

		// Call the edit function.
		try {

			return res.json(await (wikiDataFunctions.deleteCategory(wikiId, categoryName)));

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

		try {
			pageName = checkWikiOrPageName(pageName, "POST :/id/pages");
			category = checkCategory(category, "POST :/id/pages");
		} catch (e) {
			return res.status(400).json({ error: e });
		}

		try {
			const newPage = await pageDataFunctions.createPage(
				wikiId,
				pageName,
				category
			);
			return res.json({ pageId: newPage._id.toString(), page: newPage });
		} catch (e) {
			return res.status(500).json({ error: e });
		}
	});

router
	.route("/:wikiUrlName/pages/:pageUrlName")

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

/* router
	.route("/:id/pages/:pageId")

	//! Gets a specific page by ID
	.get(async (req: any, res) => {
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		try {
			// console.log("Fetching page with urlName:", req.params.urlName, "pageId:", req.params.pageId);

			// Get wiki by urlName to get the ID
			const wiki = await wikiDataFunctions.getWikiByUrlName(req.params.urlName);
			// console.log("Found wiki with ID:", wiki._id);

			const page = await pageDataFunctions.getPageById(
				wiki._id.toString(),
				req.params.pageId
			);
			return res.json(page);
		} catch (e) {
			return res.status(500).json({ error: e });
		}
	}); */

router
	.route("/:urlName/pages/:pageId/content")
	/**
	 * Updates page content
	 */
	.post(async (req: any, res) => {
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		try {
			// Get wiki by urlName to get the ID
			const wiki = await wikiDataFunctions.getWikiByUrlName(req.params.urlName);

			const updatedPage = await pageDataFunctions.changePageContent(
				wiki._id.toString(),
				req.params.pageId,
				req.body.content
			);
			return res.json(updatedPage);
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
	 * List collabortors on wiki
	 */
	.get(async (req, res) => {
		return;
	})

	/**
	 * Add collaborator to wiki
	 * (specify collaborator in body)
	 */
	.post(async (req, res) => {
		return;
	})

	/**
	 * Remove collaborator
	 * (specify collaborator in body)
	 */
	.delete(async (req, res) => {
		return;
	});

export default router;
