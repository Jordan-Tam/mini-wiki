import { Router } from "express";
import { checkEmail, checkString } from "../helpers.ts";
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
  let firebaseUID = req.body.firebaseUID;
  let email = req.body.email;
  let displayName = req.body.displayName;
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
  .delete(async (req, res) => {});

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
