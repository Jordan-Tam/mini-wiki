import { Router } from "express";
import wikiDataFunctions from "../data/wikis.ts";

const router = Router();

/**
 * Wikis (general)
 */
router.route("/")
    .get(async(req, res) => {

        if (!req.user) {
            return res.status(401).json({error: "You must be logged in to perform this action."});
        }

        console.log(req.user);        

    });

/**
 * Spesific wiki (by id)
 */
router.route("/:id")
    /**
     * Get wiki by id
     */
    .get(async(req,res) => {

    })

    /**
     * Delete a wiki by id
     */
    .delete(async(req,res) => {

    })

/**
 * Spesific wiki (actions) By id
 */
router.route("/:id/save")
    /**
     * Save changes to wiki
     * Requires wiki content in body
     */
    .post(async(req,res) => {

    })

router.route("/:id/publish")
    /**
     * Publish changes publicly
     */
    .post(async(req,res) => {

    })

/**
 * Wiki collaborator actions
 */
router.route("/:id/collaborators")
    /**
     * List collabortors on wiki
     */
    .get(async (req,res) => {

    })

    /**
     * Add collaborator to wiki
     * (specify collaborator in body)
     */
    .post(async(req,res) => {

    })

    /**
     * Remove collaborator
     * (specify collaborator in body)
     */
    .delete(async(req,res) => {
        
    })

export default router;