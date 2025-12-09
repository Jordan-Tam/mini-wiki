import { ObjectId } from "mongodb";
import { users, wikis } from "../config/mongoCollections.ts";
import wikiDataFunctions from "./wikis.ts";
import {
    checkString,
    checkId,
    checkUsername,
    checkEmail
} from "../helpers.ts";

type User = {
  username: string;
  email: string;
  firebaseUID: string;
  //wikis: string[];
  //wikis_given_access: string[];
  favorites: string[];
  following: string[]
};

const user_data_functions = {

  async createUser(email: string, firebaseUID: string) {

    // Input validation.
    email = checkEmail(email, "createUser");

    let newUser: User;

    newUser = {
      username: firebaseUID,
      email: email,
      firebaseUID,
      favorites: [],
      following: []
    };

    const userCollection = await users();

    const insertInfo = await userCollection.insertOne(newUser);

    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw "User could not be added to database.";
    }

    return insertInfo;

  },

  async getUserByFirebaseUID(firebaseUID: string) {

    const userCollection = await users();

    const user = await userCollection.findOne({ firebaseUID: firebaseUID });

    if (!user) {
      throw `User Not Found.`;
    }

    return user;

  },

  async getUserIdByUsername(username: string) {

    const userCollection = await users();

    const user = await userCollection.findOne({ username: username });

    if (!user) {
      throw `User Not Found.`;
    }

    return user._id;

  },

  async getUsers() {

    const userCollection = await users();

    const allUsers = await userCollection.find({}).toArray();

    if (!allUsers) {
      throw "could not fetch all users";
    }

    return allUsers;

  },

  async getTakenUsernames() {

    let userList = await this.getUsers();

    let usernames = userList.map((user: User) => user.username.toLowerCase());

    return usernames;

  },

  async changeUsername(id: string, newUsername: string) {

    // Input validation
    newUsername = checkUsername(newUsername, "changeUsername");

    let takenUsernames = await this.getTakenUsernames();

    if (takenUsernames.includes(newUsername.toLowerCase())) {
      throw "username already exists";
    }

    const user = await this.getUserByFirebaseUID(id);

    const updatedUser = { ...user, username: newUsername };

    const usersCollection = await users();
    const updateInfo = await usersCollection.findOneAndUpdate(
      {
        firebaseUID: id,
      },
      { $set: updatedUser },
      { returnDocument: "after" }
    );

    if (!updateInfo) {
      throw "unable to update username";
    }

    return updateInfo;

  },

  async addFavorite(
    wikiId: string,
    userId: string) {

        //Input validation
        wikiId = checkId(wikiId, "Wiki", "addFavorite");

        //throws if wiki doesnt exist
        const wiki = await wikiDataFunctions.getWikiById(wikiId);

        //throws if user doesnt exist
        const user = await this.getUserByFirebaseUID(userId);
    
        const favorites = user.favorites;

        for (let fav_wiki of favorites){
            if(fav_wiki === wikiId){
                throw 'wiki is already favorited'
            }
        }

        favorites.push(wikiId);

        const updatedUser = {
            favorites: favorites,
        };

        const usersCollection = await users();

        const updateInfo = await usersCollection.findOneAndUpdate(
            { firebaseUID: userId },
            { $set: updatedUser },
            { returnDocument: "after" }
        );
        
        if (!updateInfo) {
            throw "unable to favorite wiki";
        }

      const updatedWiki = {
          favorites: wiki.favorites + 1,
      };

      console.log("Favorites: " + updatedWiki.favorites)

      const wikisCollection = await wikis();

      const updateWikiInfo = await wikisCollection.findOneAndUpdate(
          { _id: new ObjectId(wikiId) },
          { $set: updatedWiki },
          { returnDocument: "after" }
      );

      if (!updateWikiInfo) {
          throw "unable to add to wiki favorites";
      }


        return updateInfo;

  },

  async removeFavorite(wikiId: string, userId: string) {

    // Input validation
    wikiId = checkId(wikiId, "Wiki", "unfavorite");

    // throws if wiki doesn't exist
    const wiki = await wikiDataFunctions.getWikiById(wikiId);

    // throws if user doesn't exist
    const user = await this.getUserByFirebaseUID(userId);

    const favorites = user.favorites;

    const index = favorites.indexOf(wikiId);
    if (index === -1) {
        throw "wiki is not currently favorited";
    }

    //remove wiki from favs
    favorites.splice(index, 1);  

    const updatedUser = {
        favorites: favorites,
    };

    const usersCollection = await users();

    const updateInfo = await usersCollection.findOneAndUpdate(
        { firebaseUID: userId },
        { $set: updatedUser },
        { returnDocument: "after" }
    );

    if (!updateInfo) {
        throw "unable to unfavorite wiki";
    }

    if (wiki.favorites === 0){
      throw "cant unfavorite"
    }

    const updatedWiki = {
      favorites: wiki.favorites - 1,
    };

    console.log("Favorites: " + updatedWiki.favorites)

    const wikisCollection = await wikis();

    const updateWikiInfo = await wikisCollection.findOneAndUpdate(
        { _id: new ObjectId(wikiId) },
        { $set: updatedWiki },
        { returnDocument: "after" }
    );

    if (!updateWikiInfo) {
        throw "unable to add to wiki favorites";
    }
    return updateInfo;

  },

  async addFollowing() {

  },

  async removeFollowing() {

  },

  //do we delete wikis or make the author [deleted] and keep wikis up?
  //TODO: We didn't have a delete user functionality in our project last semester, so I think we can do the same thing for this one and just not let them delete their accounts.
  async deleteUser(firebaseUID: string) {

    const user_to_delete = await this.getUserByFirebaseUID(firebaseUID);

    if (!user_to_delete) {
      throw "user with this ID does not exist";
    }

    const userCollection = await users();

    const deleteUser = await userCollection.deleteOne({
      firebaseUID: firebaseUID,
    });

    if (!deleteUser) {
      throw "user not deleted";
    }

    return { userDeleted: true };

  }

};

export default user_data_functions;
