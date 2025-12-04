import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.ts";
import {
    checkString,
    checkId,
    checkUsername,
    checkEmail
} from "../helpers.ts";
import bcrypt from 'bcryptjs' 
let saltRounds = 10;

type User = {
    username: string;
    email: string;
    firebaseUID?: string;
    displayName?: string,
    wikis: string[];
    wikis_given_access: string[]; //not a string, needs to be updated
}
const user_data_functions = {
  async createUser(
    email: string,
    firebaseUID: string,
    username?: string
  ) {
    if (username) {
      username = checkUsername(username, "createUser");
    }
    email = checkEmail(email, "createUser");

    let newUser: User;
    if (!firebaseUID && username) {
      newUser = {
        username,
        email,
        wikis: [],
        wikis_given_access: [], //array of {wiki_id: string, permission: bool}
      };
    } else if (firebaseUID && !username) {
      newUser = {
        username: firebaseUID,
        email: email,
        firebaseUID,
        wikis: [],
        wikis_given_access: [],
      };
    } else {
      throw "unexpected input";
    }

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
    //both will throw on error
    id = checkId(id, "User ID", "changeUsername");
    newUsername = checkUsername(newUsername, "changeUsername");

    let takenUsernames = await this.getTakenUsernames();

    if (takenUsernames.includes(newUsername.toLowerCase())) {
      throw "username already exists";
    }

    const user = await this.getUserByFirebaseUID(id);

    const updatedUser = {
      username: newUsername,
    };

    const usersCollection = await users();
    const updateInfo = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedUser },
      { returnDocument: "after" }
    );

    if (!updateInfo) {
      throw "unable to update username";
    }

    return updateInfo;
  },

  //do we delete wikis or make the author [deleted] and keep wikis up?
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
  },
};

export default user_data_functions;
