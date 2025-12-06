import { Router } from "express";
import { checkEmail, checkId, checkString } from "../helpers.ts";
import user_data_functions from "../data/users.ts";
import wiki_data_functions from "../data/wikis.ts";

export const router = Router();

/**
 * Users (list)
 */
router.route("/").get(async (req, res) => {});

/**
 * Register account using firebase
 */
router.route("/registerFB").post(async (req, res) => {
  console.log("Here!");
  let user = (req as any).user;
  let firebaseUID = user.user_id;
  let email = user.email;
  // let displayName = user.displayName;
  try {
    firebaseUID = checkString(firebaseUID, "firebaseUID");
    email = checkEmail(email, firebaseUID);
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  try {
    const newUser = await user_data_functions.createUser(
      (email = email),
      (firebaseUID = firebaseUID)
      // (displayName = displayName)
    );
    return newUser;
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

/**
 * Users (by ID)
 */
router
  .route("/:id")
  /**
   * get user by id
   */
  .get(async (req, res) => {})
  /**
   * update username
   */
  .patch(async (req, res) => {})
  /**
   * Delete user (self)
   */
  .delete(async (req, res) => {
    let firebaseUID = req.params.id;
    let tokenId = (req as any).user.user_id;
    if (firebaseUID !== tokenId) {
      return res
        .status(403)
        .json({ error: "Cannot delete a user that isn't you" });
    }
    const deleted = await user_data_functions.deleteUser(firebaseUID);
    if (deleted.userDeleted) {
      return res.json(deleted);
    } else {
      return res.status(404).json({ error: "User not deleted" });
    }
  });

/**
 * Pending invites
 */
router
  .route("/:id/invites")
  /**
   * View wikis user[id] has been given access to
   */
  .get(async (req, res) => {});

/**
 * Wikis of user[id]
 */
router
  .route("/:id/wikis")
  .get(async (req: any, res) => {
    if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		try {
			const wikis = await wiki_data_functions.getWikisByUser(req.params.id)
			
			return res.json(wikis)
		} catch (e) {
			
      return res.status(500).json({ error: e });
		
    }
  });

router
	.route("/:id/favorites")
	.get(async (req: any, res) => {

		if (!req.user) {
			return res
				.status(401)
				.json({ error: "You must be logged in to perform this action." });
		}

		try {

			const user = await user_data_functions.getUserByFirebaseUID(req.params.id);
			
  
			const favoriteIds = [];

      if (user.favorites.length > 0)
      {
        for (let wiki of user.favorites){
          favoriteIds.push(wiki)
        }
      }

      const favorites = [];
      for (let favorite of favoriteIds){
        let favorited_wiki = await wiki_data_functions.getWikiById(favorite);
        favorites.push(favorited_wiki)
      }
			return res.json(favorites)
		} catch (e) {
			
      return res.status(500).json({ error: e });
		
    }

	});

export default router;