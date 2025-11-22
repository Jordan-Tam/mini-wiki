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

        return insertInfo;

    },

    async deleteWiki(id: string) {
        
    }

};

export default wiki_data_functions;
