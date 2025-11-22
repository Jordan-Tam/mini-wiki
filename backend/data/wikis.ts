import { ObjectId } from "mongodb";
import { wikis } from "../config/mongoCollections.js";
import {
    checkString,
    checkId
} from "../helpers.js";

const wiki_data_functions = {

    async createWiki(
        name: string,
        owner: string
    ) {

        // Input validation.
        name = checkString(name, "Wiki Name", "createWiki");
        owner = checkId(owner, "Wiki Owner", "createWiki");

        // Create the new wiki object.
        let newWiki = {
            name,
            owner,
            collaborators: [],
            pages: []
        };

        const wikisCollection = await wikis();

        const insertInfo = await wikisCollection.insertOne(newWiki);

        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw "";
        }

        return insertInfo;

    },

    async deleteWiki() {

    }

};

export default wiki_data_functions;