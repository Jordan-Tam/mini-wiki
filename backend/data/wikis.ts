import { ObjectId } from "mongodb";
import { users, wikis } from "../config/mongoCollections.ts";
import userDataFunctions from "./users.ts";
import {
    checkString,
    checkId,
    checkAccess
} from "../helpers.ts";

const wiki_data_functions = {

    async getAllWikis() {
        
        const wikisCollection = await wikis();

        const wikisList = await wikisCollection.find({}).toArray();

        return wikisList;

    },

    async getWikiById(
        id: string
    ) {
        
        // Input validation.
        id = checkId(id, "Wiki", "getWikiById");

        const wikisCollection = await wikis();

        const wiki = await wikisCollection.findOne({
            _id: new ObjectId(id)
        });

        if (wiki === null) {
            throw "No wiki with that ID.";
        }

        wiki._id = wiki._id.toString();

        return wiki;

    },

    async getWikisByUser(
        userFirebaseUID: string,
    ) {

        let wikisList = await this.getAllWikis();

        return wikisList.filter((wiki: any) => wiki.owner === userFirebaseUID || wiki.collaborators.includes(userFirebaseUID));

    },

    async createWiki(
        name: string,
        description: string,
        access: string,
        owner: string
    ) {

        // Input validation.
        name = checkString(name, "Wiki Name", "createWiki");
        description = checkString(description, "Wiki Description", "createWiki");
        access = checkAccess(access, "createWiki");

        // Check if user exists.
        await userDataFunctions.getUserByFirebaseUID(owner);

        // Create the new wiki object.
        let newWiki = {
            name,
            description,
            owner,
            access,
            categories: ["UNCATEGORIZED"],
            collaborators: [],
            pages: []
        };

        const wikisCollection = await wikis();

        const insertInfo = await wikisCollection.insertOne(newWiki);

        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw "Wiki could not be created.";
        }

        return (await this.getWikiById(insertInfo.insertedId.toString()));

    },

    async deleteWiki(id: string) {

        // Input validation.
        id = checkId(id, "Wiki", "deleteWiki");

        const wikisCollection = await wikis();

        const deletionInfo = await wikisCollection.findOneAndDelete({
            _id: new ObjectId(id)
        });

        if (!deletionInfo) {
            throw "Could not delete wiki.";
        }

        return true;
        
    },

    async changeWikiName(
        wikiId: string,
        newName: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "changeWikiName");
        newName = checkString(newName, "Wiki Name", "changeWikiName");

        // Create the updated wiki object.
        let updatedWiki = {
            name: newName
        };

        const wikisCollection = await wikis();

        const updateInfo = await wikisCollection.findOneAndReplace(
            { _id: new ObjectId(wikiId) },
            updatedWiki,
            { returnDocument: "after" }
        );

        if (!updateInfo) {
            throw "Could not update wiki name.";
        }

        updateInfo._id = updateInfo._id.toString();

        return updateInfo;

    },

    async changeWikiDescription(

    ) {

    },

    async changeWikiOwner(
        wikiId: string,
        newOwner: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "changeWikiOwner");
        newOwner = checkId(newOwner, "Wiki Owner", "changeWikiOwner");

        // Create the updated wiki object.
        let updatedWiki = {
            owner: newOwner
        };

        const wikisCollection = await wikis();

        const updateInfo = await wikisCollection.findOneAndReplace(
            { _id: new ObjectId(wikiId) },
            updatedWiki,
            { returnDocument: "after" }
        );

        if (!updateInfo) {
            throw "Could not update wiki owner.";
        }

        updateInfo._id = updateInfo._id.toString();

        return updateInfo;

    },

    async changeWikiAccess(
        wikiId: string,
        newAccess: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "changeWikiAccess");
        newAccess = checkAccess(newAccess, "changeWikiAccess");

        // Create the updated wiki object.
        let updatedWiki = {
            access: newAccess
        };

        const wikisCollection = await wikis();

        const updateInfo = await wikisCollection.findOneAndReplace(
            { _id: new ObjectId(wikiId) },
            updatedWiki,
            { returnDocument: "after" }
        );

        if (!updateInfo) {
            throw "Could not update wiki access.";
        }

        updateInfo._id = updateInfo._id.toString();

        return updateInfo;

    },

    async createCategory(
        wikiId: string,
        category: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "createCategory");
        category = checkString(category, "Wiki Category", "createCategory");

        let wiki = await this.getWikiById(wikiId);
        if (wiki.categories.includes(category)) {
            throw "Duplicate categories are not allowed.";
        }

        const wikisCollection = await wikis();
        const updateInfo = await wikisCollection.findOneAndUpdate(
            { _id: new ObjectId(wikiId) },
            { $push: { categories: category } },
            { returnDocument: "after" }
        );

        if (!updateInfo) {
            throw "Could not create wiki category.";
        }

        updateInfo._id = updateInfo._id.toString();

        return updateInfo;

    },

    async deleteCategory(
        wikiId: string,
        category: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "deleteCategory");
        category = checkString(category, "Wiki Category", "deleteCategory");

        let wiki = await this.getWikiById(wikiId);

        // Pages associated with the deleted category are moved to the UNCATEGORIZED category.
        let updatedWiki = {
            categories: wiki.categories.filter((c: string) => c !== category),
            pages: wiki.pages.map((page: any) => {
                if (page.category === category) {
                    page.category = "UNCATEGORIZED";
                    return page;
                } else {
                    return page;
                }
            })
        };

        const wikisCollection = await wikis();
        const updateInfo = await wikisCollection.findOneAndReplace(
            { _id: new ObjectId(wikiId) },
            updatedWiki,
            { returnDocument: "after" }
        );

        if (!updateInfo) {
            throw "Could not delete wiki category.";
        }

        updateInfo._id = updateInfo._id.toString();

        return updateInfo;

    },

    async doesCategoryExist(
        wikiId: string,
        category: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "doesCategoryExist");
        category = checkString(category, "Wiki Category", "doesCategoryExist");

        let wiki = await this.getWikiById(wikiId);

        return wiki.categories.includes(category);

    },

    async addCollaborator(
        wikiId: string,
        userFirebaseUID: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "addCollaborator");

        // Check if wiki exists.
        await this.getWikiById(wikiId);

        // Check if user exists.
        await userDataFunctions.getUserByFirebaseUID(userFirebaseUID);

    },

    async removeCollaborator(
        wikiId: string,
        userFirebaseUID: string
    ) {

    },
    
    async favorite(
        wikiId: string,
        userId: string
    ) {

        //Input validation
        wikiId = checkId(wikiId, "Wiki", "addCollaborator");

        //throws if wiki doesnt exist
        const wiki = await this.getWikiById(wikiId);

        //throws if user doesnt exist
        const user = await userDataFunctions.getUserByFirebaseUID(userId);
    
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
        
        return updateInfo;
    },

    async unfavorite(wikiId: string, userId: string) {
        // Input validation
        wikiId = checkId(wikiId, "Wiki", "unfavorite");
    
        // throws if wiki doesn't exist
        const wiki = await this.getWikiById(wikiId);
    
        // throws if user doesn't exist
        const user = await userDataFunctions.getUserByFirebaseUID(userId);
    
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
    
        return updateInfo;
    }
    

};

export default wiki_data_functions;