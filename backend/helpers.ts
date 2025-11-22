import {ObjectId} from "mongodb";

const UPPERCASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const LETTERS_AND_NUMBERS = UPPERCASE_LETTERS + LOWERCASE_LETTERS + NUMBERS;
const LETTERS_AND_NUMBERS_PLUS = LETTERS_AND_NUMBERS + "._-";

const checkString = (
    str: string,
    varName: string,
    funcName?: string
): string => {

    // Check if "str" is composed of only spaces.
    if (str.trim().length === 0) {
        throw `${varName} cannot be an empty string or just spaces.`;
    }

    // Return trimmed string.
    return str.trim();

};

const checkId = (
    id: string,
    id_of_what: string,
    funcName?: string
): string => {

    // Basic string validation.
    id = checkString(id, `${id_of_what} ID`, funcName);

    // Check if "id" is a valid ObjectId.
    if (!ObjectId.isValid(id)) {
        throw `Invalid ${id_of_what} ID.`;
    }

    return id;

};

const checkUsername = (
    username: string,
    funcName?: string
): string => {

    // Basic string validation.
    username = checkString(username, "Username", funcName);

    // Length restrictions.
    if (username.length < 2 && username.length > 20) {
        throw "Username must be between 2-20 characters long.";
    }

    // Character restrictions.
    for (let char of username) {
        if (LETTERS_AND_NUMBERS_PLUS.indexOf(char) === -1) {
            throw "Username must contain only letters, numbers, periods, hyphens, and underscores.";
        }
    }

    return username;

};

const checkAccess = (
    access: string,
    funcName?: string
): string => {

    // Basic string validation.
    access = checkString(access, "Access", funcName);

    if (
        (access !== "public")
        &&
        (access !== "permissioned")
        &&
        (access !== "private")
    ) {
        throw "Access type must be 'public', 'permissioned', or 'private'."
    }

    return access;

}

export {
    checkString,
    checkId,
    checkUsername,
    checkAccess
};
