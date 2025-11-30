import { ObjectId } from "mongodb";
import { wikis } from "../config/mongoCollections.js";
import {
    checkString,
    checkId,
    checkAccess
} from "../helpers.js";

const wiki_data_functions = {

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

    async createWiki(
        name: string,
        owner: string,
        access: string
    ) {

        // Input validation.
        name = checkString(name, "Wiki Name", "createWiki");
        owner = checkId(owner, "Wiki Owner", "createWiki");
        access = checkAccess(access, "createWiki");

        // Create the new wiki object.
        let newWiki = {
            name,
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

        return (await this.getWikiById(insertInfo.insertedId));

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

        let updatedWiki = {
            categories: [...wiki.categories, category]
        };

        const wikisCollection = await wikis();
        const updateInfo = await wikisCollection.findOneAndReplace(
            { _id: new ObjectId(wikiId) },
            updatedWiki,
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

    async addCollaborator(
        wikiId: string,
        userId: string
    ) {

        // 

    },

    async removeCollaborator(
        wikiId: string,
        userId: string
    ) {

    },

};

export default wiki_data_functions;