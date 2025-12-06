import { ObjectId } from "mongodb";
import slugify from "slugify";
import { users, wikis } from "../config/mongoCollections.ts";
import userDataFunctions from "./users.ts";
import {
    checkString,
    checkId,
    checkUrlName,
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

    async getWikiByUrl(
        url: string
    ) {

    },

    async getWikisByUser(
        userFirebaseUID: string,
    ) {

        let wikisList = await this.getAllWikis();

        return wikisList.filter((wiki: any) => wiki.owner === userFirebaseUID || wiki.collaborators.includes(userFirebaseUID));

    },

    /**
     * 
     * @param name 
     * @param description 
     * @param access 
        * If this parameter is "public-view", all users will be able to view this wiki, but only the owner and the users listed in the "collaborators" array will be allowed to edit it.
        * If this parameter is "public-edit", all users will be able to view AND edit this wiki.
        * If this parameter is "private", only the owner and the users listed in the "collaborators" array will be allowed to view and edit, and only users listed in the "private_viewers" array will be allowed to view but not edit.
     * @param owner 
     * @returns 
     */
    async createWiki(
        name: string,
        urlName: string,
        description: string,
        access: string,
        owner: string
    ) {

        // Input validation.
        name = checkString(name, "Wiki Name", "createWiki");
        urlName = checkUrlName(urlName, "Wiki URL Name", "createWiki");
        description = checkString(description, "Wiki Description", "createWiki");
        access = checkAccess(access, "createWiki");

        // Check if user exists.
        await userDataFunctions.getUserByFirebaseUID(owner);

        // Create the new wiki object.
        let newWiki = {
            name,
            urlName,
            description,
            owner,
            access,
            categories: ["UNCATEGORIZED"],
            collaborators: [],
            private_viewers: [],
            pages: []
        };

        const wikisCollection = await wikis();

        const insertInfo = await wikisCollection.insertOne(newWiki);

        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw "Wiki could not be created.";
        }

        return (await this.getWikiById(insertInfo.insertedId.toString()));

    },

    /**
     * The DELETE WIKI route should first make sure that the logged-in user is the owner of this wiki before calling this function.
     */
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

        return (await this.getWikiById(wikiId.toString()));

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

        // Check if user exists.
        await userDataFunctions.getUserByFirebaseUID(newOwner);

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

        return (await this.getWikiById(wikiId.toString()));

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

        return (await this.getWikiById(wikiId.toString()));

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

        return (await this.getWikiById(wikiId.toString()));

    },

    async editCategory(
        wikiId: string,
        oldCategoryName: string,
        newCategoryName: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "editCategory");
        oldCategoryName = checkString(oldCategoryName, "Original Wiki Category Name", "editCategory");
        newCategoryName = checkString(newCategoryName, "Updated Wiki Category Name", "editCategory");

        let wiki = await this.getWikiById(wikiId);

        // Check if "oldCategoryName" exists in the categories array.
        if (!(wiki.categories.includes(oldCategoryName))) {
            throw "Category to edit does not exist.";
        }

        // Return early if old and new category names are the same.
        if (oldCategoryName === newCategoryName) {
            return;
        }

        // Make sure the new name is unique.
        if (wiki.categories.includes(newCategoryName)) {
            throw "Duplicate categories are not allowed.";
        }

        const wikisCollection = await wikis();
        const updateInfo = await wikisCollection.findOneAndUpdate(
            { _id: new ObjectId(wikiId) },
            {
                categories: wiki.categories.map((c: any) => c === oldCategoryName ? newCategoryName : c)
            },
            { returnDocument: "after" }
        );

        return (await this.getWikiById(wikiId.toString()));

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

        return (await this.getWikiById(wikiId.toString()));

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
        let wiki = await this.getWikiById(wikiId);

        // Check if user exists.
        await userDataFunctions.getUserByFirebaseUID(userFirebaseUID);

        // Check if user is already a collaborator.
        if (wiki.collaborators.includes(userFirebaseUID)) {
            throw "User is already a collaborator.";
        }

        const wikisCollection = await wikis();

        const insertCollaboratorToWikiInfo = await wikisCollection.findOneAndUpdate(
            {_id: new ObjectId(wikiId)},
            {$push: {collaborators: userFirebaseUID}},
            {returnDocument: "after"}
        );

        if (!insertCollaboratorToWikiInfo) {
            throw "Collaborator could not be added.";
        }

        return (await this.getWikiById(wikiId.toString()));

    },

    async removeCollaborator(
        wikiId: string,
        userFirebaseUID: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "removeCollaborator");

        // Check if wiki exists.
        let wiki = await this.getWikiById(wikiId);

        // Check if user exists.
        await userDataFunctions.getUserByFirebaseUID(userFirebaseUID);

        // Check if user already wasn't a collaborator.
        if (wiki.collaborators.includes(userFirebaseUID)) {
            throw "User isn't a collaborator.";
        }

        const wikisCollection = await wikis();

        const removeCollaboratorFromWikiInfo = await wikisCollection.findOneAndUpdate(
            {_id: new ObjectId(wikiId)},
            {$pull: {collaborators: userFirebaseUID}},
            {returnDocument: "after"}
        );

        if (!removeCollaboratorFromWikiInfo) {
            throw "Collaborator could not be removed.";
        }

        return (await this.getWikiById(wikiId.toString()));

    },

    async addPrivateViewer(
        wikiId: string,
        userFirebaseUID: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "addPrivateViewer");

        // Check if wiki exists.
        let wiki = await this.getWikiById(wikiId);

        // Check if user exists.
        await userDataFunctions.getUserByFirebaseUID(userFirebaseUID);

        // Check if user is already a private viewer.
        if (wiki.private_viewers.includes(userFirebaseUID)) {
            throw "User is already a private viewer.";
        }

        const wikisCollection = await wikis();

        const insertPrivateViewerToWikiInfo = await wikisCollection.findOneAndUpdate(
            {_id: new ObjectId(wikiId)},
            {$push: {private_viewers: userFirebaseUID}},
            {returnDocument: "after"}
        );

        if (!insertPrivateViewerToWikiInfo) {
            throw "Private viewer could not be added.";
        }

        return (await this.getWikiById(wikiId.toString()));

    },

    async removePrivateViewer(
        wikiId: string,
        userFirebaseUID: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "removePrivateViewer");

        // Check if wiki exists.
        let wiki = await this.getWikiById(wikiId);

        // Check if user exists.
        await userDataFunctions.getUserByFirebaseUID(userFirebaseUID);

        // Check if user already wasn't a collaborator.
        if (wiki.private_viewers.includes(userFirebaseUID)) {
            throw "User isn't a private viewer.";
        }

        const wikisCollection = await wikis();

        const removePrivateViewerFromWikiInfo = await wikisCollection.findOneAndUpdate(
            {_id: new ObjectId(wikiId)},
            {$pull: {private_viewers: userFirebaseUID}},
            {returnDocument: "after"}
        );

        if (!removePrivateViewerFromWikiInfo) {
            throw "Private viewer could not be removed.";
        }

        return (await this.getWikiById(wikiId.toString()));

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