import { ObjectId } from "mongodb";
import { wikis } from "../config/mongoCollections.js";
import {
    checkString,
    checkId,
    checkUsername
} from "../helpers.js";

const page_data_functions = {

    async createPage(
        wikiId: string,
        name: string,
        category: string,
        content: string
    ) {

        // Input validation.
        wikiId = checkId(wikiId, "Wiki", "createPage");
        name = checkString(name, "Page Name", "createPage");
        category = checkString(category, "Wiki Category", "createPage");
        content = checkString(content, "Page Content", "createPage");

        // Create the new page object.
        const newPage = {
            name,
            category,
            content
        };

        const wikisCollection = await wikis();

        const insertPageToWikiInfo = await wikisCollection.findOneAndUpdate(
            {_id: new ObjectId(wikiId)},
            {$push: {pages: newPage}},
            {returnDocument: "after"}
        );

        if (!insertPageToWikiInfo) {
            throw "Page could not be created.";
        }

        return newPage;

    },

    async deletePage() {
        
    }

};

export default page_data_functions;
