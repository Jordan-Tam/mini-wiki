import {ObjectId} from "mongodb";

const UPPERCASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const LETTERS_AND_NUMBERS = UPPERCASE_LETTERS + LOWERCASE_LETTERS + NUMBERS;
const LETTERS_AND_NUMBERS_PLUS = LETTERS_AND_NUMBERS + "._-";
const URL_NAME_ALLOWED_CHARACTERS = LETTERS_AND_NUMBERS + "_-";

const checkString = (
    str: string,
    varName: string,
    funcName?: string
): string => {

    console.log(str);

    // Check if "str" is composed of only spaces.
    if (str.trim().length === 0) {
        throw `${varName} cannot be an empty string or just spaces.`;
    }

    console.log(2);

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

const checkWikiOrPageName = (
  name: string,
  funcName?: string
): string => {
  // Basic string validation.
  name = checkString(name, "Wiki/Page Name", funcName);
  // Length restrictions.
  if (name.length < 1 || name.length > 40) {
    throw "Wiki/Page name must be between 1-40 characters long.";
  }

  return name

}

const checkCategory = (category: string, funcName?: string): string => {
  // Basic string validation.
  category = checkString(category, "Category name", funcName);
  // Length restrictions.
  if (category.length < 1 || category.length > 20) {
    throw "Category name must be between 1-20 characters long.";
  }

  return category;
};

const checkUrlName = (
  urlName: string,
  funcName?: string
): string => {

    // Basic string validation.
    urlName = checkString(urlName, "Wiki URL", funcName);

    // Length restrictions.
    if (urlName.length < 4 || urlName.length > 30) {
        throw "Wiki URL must be between 4-30 characters long.";
    }

    // Character restrictions.
    for (let char of urlName) {
        if (URL_NAME_ALLOWED_CHARACTERS.indexOf(char) === -1) {
            throw "Wiki URL Name must contain only letters, numbers, hyphens, and underscores.";
        }
    }

    return urlName;

}

const checkDescription = (description: string, funcName?: string): string => {
  // Basic string validation.
  description = checkString(description, "Wiki Description", funcName);
  // Length restrictions.
  if (description.length < 1 || description.length > 800) {
    throw "Description must be between 1-800 characters long.";
  }

  return description;
};

const checkUsername = (
    username: string,
    funcName?: string
): string => {

    // Basic string validation.
    username = checkString(username, "Username", funcName);

    // Length restrictions.
    if (username.length < 2 || username.length > 20) {
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
        (access !== "public-view")
        &&
        (access !== "public-edit")
        &&
        (access !== "private")
    ) {
        throw "Access type must be 'public-view', 'public-edit', or 'private'.";
    }

    return access;

};

const checkPassword = (
    password: string, 
    funcName: string
    ): string => {

    // Basic string validation.
    // Password cannot have spaces, so we do not accept the trimmed string.
    checkString(password, "Password", funcName);
  
    // Check that password is at least 8 characters long.
    if (password.length < 8) {
      throw {
        status: 400,
        function: funcName,
        error: "Password must be at least 8 characters long."
      };
    }
  
    const characters = {
      upper: 0,
      lower: 0,
      number: 0,
      special: 0
    };
  
    for (let char of password) {
      if (UPPERCASE_LETTERS.indexOf(char) > -1) {
        characters.upper++;
      } else if (LOWERCASE_LETTERS.indexOf(char) > -1) {
        characters.lower++;
      } else if (NUMBERS.indexOf(char) > -1) {
        characters.number++;
      } else {
        if (" ".indexOf(char) > -1) {
          throw "Password cannot have spaces."
        }
        characters.special++;
      }
    }
  
    if (characters['lower'] === 0 || characters['upper'] === 0 || characters['special'] === 0 || characters['number'] === 0) {
      throw "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."      
    }

    return password;
  
  }

  const checkEmail = (
    email: string,
    funcName: string
    ): string => {
    
        //basic string validation
        email = checkString(email, "email", funcName) 
    
        if (email === ""){
            throw "email cannot be empty spaces"
        }
  
        const emailREGEX = /^[a-zA-z0-9._-]+@[a-zA-z0-9]+\.[a-zA-z0-9]+$/;
  
        if (!emailREGEX.test(email)){
            throw 'Please provide a valid email.'
        }
  
        return email;
  }
export {
    checkString,
    checkId,
    checkUrlName,
    checkUsername,
    checkAccess,
    checkPassword,
    checkEmail,
    checkWikiOrPageName,
    checkDescription,
    checkCategory
};
