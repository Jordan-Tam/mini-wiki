import express from "express";
import { searchWikis, SearchResult } from "../lib/search/search.ts";
import wikiDataFunctions from "../data/wikis.ts";

const router = express.Router();

/**
 * POST /search
 * Search across all wikis the user has access to
 * Body: { searchTerm: string }
 * Returns: { results: Record<wikiId, pages[]>, totalResults: number }
 */
router.post("/", async (req, res) => {
	try {
		const { searchTerm } = req.body;
		const user = (req as any).user;

		// Validate search term
		if (!searchTerm || typeof searchTerm !== "string") {
			return res.status(400).json({
				error: "Search term is required and must be a string"
			});
		}

		if (searchTerm.trim().length === 0) {
			return res.status(400).json({
				error: "Search term cannot be empty"
			});
		}

		if (searchTerm.length > 200) {
			return res.status(400).json({
				error: "Search term is too long (max 200 characters)"
			});
		}

		// Get user's accessible wiki IDs
		const accessibleWikiIds = await wikiDataFunctions.getUserAccessibleWikiIds(
			user.uid
		);

		if (accessibleWikiIds.length === 0) {
			return res.json({
				results: {},
				totalResults: 0,
				message: "No accessible wikis found"
			});
		}

		// Perform the search
		const searchResults: Record<string, SearchResult[]> = await searchWikis(
			searchTerm.trim(),
			accessibleWikiIds
		);

		// Calculate total results
		let totalResults = 0;
		for (const wikiId in searchResults) {
			totalResults += searchResults[wikiId].length;
		}

		// Enrich results with wiki metadata
		const enrichedResults: Record<
			string,
			{ wikiName: string; wikiUrlName: string; pages: SearchResult[] }
		> = {};
		for (const wikiId in searchResults) {
			try {
				const wiki = await wikiDataFunctions.getWikiById(wikiId);
				enrichedResults[wikiId] = {
					wikiName: wiki.name,
					wikiUrlName: wiki.urlName,
					pages: searchResults[wikiId]
				};
			} catch (error) {
				// If wiki not found, just include the raw results
				enrichedResults[wikiId] = {
					wikiName: "Unknown",
					wikiUrlName: "",
					pages: searchResults[wikiId]
				};
			}
		}

		return res.json({
			results: enrichedResults,
			totalResults,
			searchTerm: searchTerm.trim()
		});
	} catch (error: any) {
		console.error("Search error:", error);
		return res.status(500).json({
			error: "An error occurred while searching",
			message: error.message
		});
	}
});

export default router;
