import {databaseConnection} from "./mongoConnection.js";

const getCollectionFunction = (collection: string) => {
    let _col: any = undefined;
  
    return async () => {
      if (!_col) {
        const db = await databaseConnection();
        _col = await db.collection(collection);
      }
      return _col;
    };
};

export const users = getCollectionFunction("users");
export const wikis = getCollectionFunction("wikis");