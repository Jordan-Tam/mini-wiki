import {ObjectId} from "mongodb";

const UPPERCASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const LETTERS_AND_NUMBERS = UPPERCASE_LETTERS + LOWERCASE_LETTERS + NUMBERS;
const LETTERS_AND_NUMBERS_PLUS = LETTERS_AND_NUMBERS + "._-";

const checkString = (str: string, varName: string, funcName?: string): string => {
    if (str.trim().length === 0) {
        throw `${varName} cannot be an empty string or just spaces.`;
    }
    return str.trim();
};

const checkId = (id: string, id_of_what: string, funcName?: string): string => {

    id = checkString(id, `${id_of_what} ID`, funcName);

    if (!ObjectId.isValid(id)) {
        throw `Invalid ${id_of_what} ID.`;
    }

    return id;

};

const checkWikiName = () => {

};

export {
    checkString,
    checkId
};