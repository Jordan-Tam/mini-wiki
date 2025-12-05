import { Router } from "express";
import wikiDataFunctions from "../data/wikis.ts";

export const router = Router();

router.route("/")

    /**
     * Returns every wiki where the user is an owner or collaborator.
     */
    .get(async (req: any, res: any) => {

        if (!req.user) {
            return res.status(401).json({error: "/wiki: You must be logged in to perform this action."});
        }

        return res.json({wikis: await (wikiDataFunctions.getWikisByUser(req.user.uid))});

    })

    /**
     * Creates a wiki.
     */
    .post(async (req, res) => {

        if (!(req as any).user) {
            return res.status(401).json({error: "/wiki: You must be logged in to perform this action."});
        }

        console.log(req.body);
        let {name, description, access} = req.body;

        try {
            return res.json(await (wikiDataFunctions.createWiki(
                name, description, access, (req as any).user.uid
            )));
        } catch (e) {
            console.log("POST PROBLEM:" + e);
            return res.status(500).json({error: e});
        }

    })


router.route("/:id")

    /**
     * Returns the wiki specified by "req.params.id".
     */
    .get(async(req: any, res) => {

        if (!req.user) {
            return res.status(401).json({error: "You must be logged in to perform this action."});
        }

        let id = req.params.id;

        let wiki: any = wikiDataFunctions.getWikiById(id);

        if (!(wiki.collaborators.includes(req.user))) {
            return res.status(403).json({error: "You do not permission to access this resource."});
        }

        return;

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
    .delete(async(req,res) => {

        return;

    });

    
//! IGNORE EVERYTHING BELOW THIS LINE

/**
 * Spesific wiki (actions) By id
 */
router.route("/:id/save")
    /**
     * Save changes to wiki
     * Requires wiki content in body
     */
    .post(async(req,res) => {

        return;

    })

router.route("/:id/publish")
    /**
     * Publish changes publicly
     */
    .post(async(req,res) => {

        return;

    })

/**
 * Wiki collaborator actions
 */
router.route("/:id/collaborators")
    /**
     * List collabortors on wiki
     */
    .get(async (req,res) => {

        return;

    })

    /**
     * Add collaborator to wiki
     * (specify collaborator in body)
     */
    .post(async(req,res) => {

        return;

    })

    /**
     * Remove collaborator
     * (specify collaborator in body)
     */
    .delete(async(req,res) => {

        return;
        
    })