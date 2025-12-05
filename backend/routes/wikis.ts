import { Router } from "express";
import wikiDataFunctions from "../data/wikis.ts";
import pageDataFunctions from "../data/pages.ts";

export const router = Router();

router
	.route("/")

	/**
	 * Returns every wiki where the user is an owner or collaborator.
	 */
	.get(async (req: any, res: any) => {
		if (!req.user) {
			return res
				.status(401)
				.json({
					error: "/wiki: You must be logged in to perform this action."
				});
		}

		return res.json({
			wikis: await wikiDataFunctions.getWikisByUser(req.user.uid)
		});
	})

	/**
	 * Creates a wiki.
	 */
	.post(async (req, res) => {
		if (!(req as any).user) {
			return res
				.status(401)
				.json({
					error: "/wiki: You must be logged in to perform this action."
				});
		}

		console.log(req.body);
		let { name, description, access } = req.body;

		try {
			return res.json(
				await wikiDataFunctions.createWiki(
					name,
					description,
					access,
					(req as any).user.uid
				)
			);
		} catch (e) {
			console.log("POST PROBLEM:" + e);
			return res.status(500).json({ error: e });
		}
	});

router
	.route("/:id")

	/**
	 * Returns the wiki specified by "req.params.id".
	 */
	.get(async (req: any, res) => {
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		let id = req.params.id;

		let wiki: any = await wikiDataFunctions.getWikiById(id);

		if (wiki.owner !== req.user.uid && !wiki.collaborators.includes(req.user.uid)) {
			return res
				.status(403)
				.json({ error: "You do not permission to access this resource." });
		}

		return res.json(wiki);
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
	.route("/:id/categories")
	/**
	 * Creates a new category in the wiki
	 */
	.post(async (req: any, res) => {
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		let id = req.params.id;
		let { categoryName } = req.body;

		try {
			const updatedWiki = await wikiDataFunctions.createCategory(
				id,
				categoryName
			);
			return res.json({ name: categoryName, wiki: updatedWiki });
		} catch (e) {
			return res.status(500).json({ error: e });
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
	.route("/:id/pages/:pageId")
	/**
	 * Gets a specific page by ID
	 */
	.get(async (req: any, res) => {
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		try {
			const page = await pageDataFunctions.getPageById(
				req.params.id,
				req.params.pageId
			);
			return res.json(page);
		} catch (e) {
			return res.status(500).json({ error: e });
		}
	});

router
	.route("/:id/pages/:pageId/content")
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
			const updatedPage = await pageDataFunctions.changePageContent(
				req.params.id,
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
