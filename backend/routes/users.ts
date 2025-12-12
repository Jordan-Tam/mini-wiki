import { Router } from "express";
import { checkEmail, checkId, checkString, checkUsername } from "../helpers.ts";
import user_data_functions from "../data/users.ts";
import wiki_data_functions from "../data/wikis.ts";

export const router = Router();

/**
 * Users (list)
 */
router.route("/").get(async (req, res) => {});

/**
 * Check if a username is taken
 */
router.route("/usernameTaken/:username").post(async (req, res) => {
  let username = req.params.username.trim();
  try {
    username = checkUsername(username, "usernameTaken route");
  } catch (e) {
    return res.json({ error: e });
  }
  const takenUsernames = await user_data_functions.getTakenUsernames();
  if (takenUsernames.includes(username.toLowerCase())) {
    return res.json({ error: "Username taken" });
  }
  return res.json({ message: "Username available" });
});

/**
 * Register account using firebase
 */
router.route("/registerFB").post(async (req: any, res) => {
  let user = req.user;
  let firebaseUID = user.user_id;
  let email = user.email;
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
    );
    return newUser;
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

router
	.route("/favorites")

  /**
   * Get the user's list of favorite wikis.
   */
	.get(async (req: any, res) => {

		try {

			const user = await user_data_functions.getUserByFirebaseUID(req.user.uid);
		
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
      //console.log(favorites);
			return res.json(favorites)
		} catch (e) {
      //console.log("favorites error")
			//console.log(e);
      return res.status(500).json({ error: e });
		
    }

	})

  /**
   * Add a wiki to the user's favorites array.
   */
  .post(async (req: any, res) => {


		let { wikiId } = req.body;

		try {

			await wiki_data_functions.getWikiById(wikiId);

		} catch (e) {

			return res.status(404).json({error: e})

		}

		try {

			await user_data_functions.addFavorite(wikiId, req.user.uid);

			return res.json(true);
			
		} catch (e) {

			return res.status(500).json({error: e});

		}

  })

  /**
   * Removes a wiki from the user's favorites array.
   */
  .delete(async (req: any, res) => {

    let { wikiId } = req.body;

		try {

			await wiki_data_functions.getWikiById(wikiId);

		} catch (e) {

			return res.status(404).json({error: e})

		}

		try {

			await user_data_functions.removeFavorite(wikiId, req.user.uid);

			return res.json(true);

		} catch (e) {

			return res.status(500).json({error: e});

		}

  })

/**
 * Users (by ID)
 */
router
  .route("/:id")
  /**
   * get user by id
   */
  .get(async (req: any, res) => {
    let firebaseUID = req.params.id;
    let tokenId = req.user.user_id;
    if (firebaseUID !== tokenId) {
      return res.status(403).json({ error: "FirebaseUID mismatch" });
    }
    try {
      const user = await user_data_functions.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ error: "user not found" });
      }
      return res.json(user);
    } catch (e) {
      return res.json({ error: e });
    }
  })

  /**
   * update username
   */
  .patch(async (req: any, res) => {
    let firebaseUID = req.params.id;
    let tokenId = req.user.user_id;
    if (firebaseUID !== tokenId) {
      return res
        .status(403)
        .json({ error: "Cannot change another user's username" });
    }
    let newUsername = req.body.username;
    newUsername = checkUsername(newUsername, "patch user route");
    try {
      const updatedUser = await user_data_functions.changeUsername(
        firebaseUID,
        newUsername
      );
      if (updatedUser) {
        return res.json({ message: "Username changed" });
      } else {
        return res.json({ error: "Username could not be changed" }); // I don't think this can happen
      }
    } catch (e) {
      return res.json({ error: e });
    }
  })
  /**
   * Delete user (self)
   */
  .delete(async (req: any, res) => {
    let firebaseUID = req.params.id;
    let tokenId = req.user.user_id;
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

		try {
			const wikis = await wiki_data_functions.getWikisByUser(req.params.id)
			
			return res.json(wikis)
		} catch (e) {
			
      return res.status(500).json({ error: e });
		
    }
  });

  router
    .route("/:id/collaborator")
    /** 
     * List wikis that user is a collaborator of
     */
    .get(async (req: any, res) => {

      try{

        const wikis: any = await wiki_data_functions.getWikisByUser(req.params.id)
        const collaborateStatus = [];
        for (let wiki of wikis as any){
          if (wiki.owner !== req.params.id){
            collaborateStatus.push(wiki)
          }
        }
        //console.log(collaborateStatus[0])
        return res.json(collaborateStatus);
      } catch (e) {
        return res.status(500).json({error: e})
      }

    })

  router 
    .route(":id/bio")
    /** 
     * Edit user bio
     * New Bio provided in body
     */
    .post(async (req: any, res) => {
      const id = req.params.id.trim();
      const newBio = req.body.bio;

      try {
        
        const user = await user_data_functions.getUserByFirebaseUID(id)
        if (typeof newBio !== "string" || newBio.length > 255){
          throw 'Invalid bio.'
        }  

      } catch (e) {

        return res.status(400).json({error: e})

      }

      try {

        await user_data_functions.changeBio(id, newBio);
        const user = await user_data_functions.getUserByFirebaseUID(id)
        
        return user.bio;
        
      } catch (e) {

        return res.status(500).json({error: e})

      }

  });

export default router;
