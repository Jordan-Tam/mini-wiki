import type { ObjectId } from "mongodb";

export interface User {
	_id: string;
	bio: string;
	email: string;
	favorites?: Array<any>;
	firebaseUID: string;
	following?: Array<any>;
	username: string;
}

export interface Wiki {
    _id: string;
    name: string;
    description: string;
    urlName: string;
    owner: string;
    access: string;
    categories: Array<string>;
    categories_slugified: Array<string>;
    collaborators: Array<string>;
    private_viewers: Array<string>;
    favorites: number;
    pages: Array<{
        _id: ObjectId;
        name: string;
        urlName: string;
        category: string;
        category_slugified: string;
        content: Array<any>;
        first_created: string;
        last_edited: string;
        first_created_by: string;
        last_edited_by:string;
    }>;
}

export interface UserContext {
    "uid": string,
    accessToken: string;
    "email": string,
    "emailVerified": boolean,
    "isAnonymous":   boolean,
    "providerData": Array<
      {
        "providerId": string,
        "uid": string,
        "displayName": string | null,
        "email": string,
        "phoneNumber": string | null,
        "photoURL": string | null,
      }
    >,
    "stsTokenManager": {
      "refreshToken": string,
      "accessToken": string,
      "expirationTime": number
    },
    "createdAt": string,
    "lastLoginAt": string,
    "apiKey": string,
    "appName": string
}

export interface WikiModalParams {
    isOpen: boolean;
    handleClose: () => any;
    setWiki: React.Dispatch<React.SetStateAction<Wiki | null>>,
    wikiId: string;
}

export interface UserModalParams {
  isOpen: boolean;
  handleClose: () => any;
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  user: User;
}

export interface WikisResponse {
  OWNER: Array<Wiki>;
  COLLABORATOR: Array<Wiki>;
  PRIVATE_VIEWER: Array<Wiki>;
}