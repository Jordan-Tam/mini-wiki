import { Router } from "express";

export const router = Router();

import user_data_functions from "../data/users";
import { checkEmail, checkPassword, checkString, checkUsername } from "../helpers";

/**
 * Users (list)
 */
router.route("/")
   .get(async(req,res) => {
      try {

         let allUsers = await user_data_functions.getUsers();
         return res.json(allUsers)

      } catch (e) {

         return res.status(500).json("500 error: " + e)
      }
   })

/**
 * Register account using firebase
 */
router.route("/registerFB")
   .post(async(req,res) => {
      let {firebaseUID, email} = req.body;
      try{
      
         email = checkEmail(email, "POST /registerFB");
         firebaseUID = checkString(firebaseUID, "firebaseUID", "POST /registerFB");
      
      } catch (e) {
         return res.status(400).json("400 error: " + e);
      }

      try{
         
         let newUser = await user_data_functions.createUser(email, undefined, undefined, firebaseUID);
         return res.json("User successfully created");

      } catch (e) {
         return res.status(500).json("error: " + e)
      }
   })

/**
 * Register account through website
 */
router.route("/register")
   .post(async(req,res) => {
      let {username, password, email} = req.body;
      try {
         
         username = checkUsername(username, "POST /REGISTER");
         password = checkPassword(password, "POST /REGISTER");

      } catch (e) {
         return res.status(400).json("400 error: " + e);
      }

      try {

         let newUser = await user_data_functions.createUser(email, username, password, undefined);
         return res.json("User successfully created");

      } catch (e) {
         return res.status(500).json("error: " + e)
      }

   })

/**
 * Users (by ID)
 */
router.route("/:id")
    /**
    * get user by id
    */
    .get(async(req,res) => {
        
    })
    /**
    * update username
    */
   .patch(async(req, res) => {

   })
   /**
    * Delete user (self)
    */
   .delete(async(req,res) => {

   })


/**
 * Pending invites
 */
router.route("/:id/invites")
   /**
    * View wikis user[id] has been given access to
    */
   .get(async(req,res) => {

   })


/**
 * Wikis of user[id]
 */
router.route("/:id/wikis")
   .get(async (req,res) =>{

   })

