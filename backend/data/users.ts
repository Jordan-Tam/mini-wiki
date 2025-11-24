import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import {
    checkString,
    checkId,
    checkUsername,
    checkPassword,
    checkEmail
} from "../helpers.js";

type User = {
    username: string;
    email: string;
    firebaseUID: string;
    wikis: string[];
    wikis_given_access: string[];
}
const user_data_functions = {

    async createUser(
        username: string,
        email: string, 
        firebaseUID: string) {

        username = checkUsername(username, "createUser");
        email = checkEmail(email, "createUser")
        firebaseUID = checkString(firebaseUID, "firebaseUID", "createUser")

        let newUser = {
            username, 
            email,
            firebaseUID,
            wikis: [],
            wikis_given_access: [] //array of {wiki_id: string, permission: bool}
        }

        const userCollection = await users();

        const insertInfo = await userCollection.insertOne(newUser);

        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw "User could not be added to database.";
        }

        return insertInfo;
    },

    async getUserById(
        firebaseUID: string
    ){
        firebaseUID = checkString(firebaseUID, "firebaseUID", "updateUser");
        
        const userCollection = await users();
        
        const user = await userCollection.findOne({firebaseUID: firebaseUID});

        if (!user){
            throw `No user with the id ${firebaseUID}`
        }

        return user;
    },

    async getUsers(){
        const userCollection = await users();
        
        const allUsers = await userCollection.find({}).toArray();

        if (!allUsers){
            throw 'could not fetch all users'
        }

        return allUsers
    },
    
    async getTakenUsernames(){

        let userList = await this.getUsers();

        let usernames = userList.map((user: User) => user.username.toLowerCase());

        return usernames;
    },

    async changeUsername(
        firebaseUID: string,
        newUsername: string
    ){  
        //both will throw on error
        firebaseUID = checkString(firebaseUID, "firebaseUID", "changeUsername");
        newUsername = checkUsername(newUsername, "changeUsername");


        //const userCollection = await users();
        
        let takenUsernames = await this.getTakenUsernames();

        for (let username in takenUsernames){
            if (username === newUsername){
                throw 'username already exists'
            }
        }

        const user = await this.getUserById(firebaseUID);

        const updatedUser = {
            username: newUsername
        };

        const usersCollection = await users();
        const updateInfo = await usersCollection.findOneAndUpdate(
            {firebaseUID: new ObjectId(firebaseUID)},
            {$set: updatedUser},
            {returnDocument: 'after'}
        );

        if(!updateInfo){
            throw 'unable to update username'
        }

        return updateInfo



    }




};

export default user_data_functions;
