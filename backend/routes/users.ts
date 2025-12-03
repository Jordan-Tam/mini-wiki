import { Router } from "express";
import { checkEmail, checkId, checkString } from "../helpers.ts";
import user_data_functions from "../data/users.ts";

export const router = Router();

/**
 * Users (list)
 */
router.route("/").get(async (req, res) => {});

/**
 * Register account using firebase
 */
router.route("/registerFB").post(async (req, res) => {
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
router.route("/:id/wikis").get(async (req, res) => {});
