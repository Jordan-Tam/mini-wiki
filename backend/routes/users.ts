import { Router } from "express";

export const router = Router();


/**
 * Users (list)
 */
router.route("/")
    .get(async(req,res) => {

    })

/**
 * Register account using firebase
 */
router.route("/registerFB")
   .post(async(req,res) => {

   })

/**
 * Register account through website
 */
router.route("/register")
   .post(async(req,res) => {
      
      if (!req.user) {
         return res.status(401).json({error: "error"});
      }

      console.log(req.user);

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