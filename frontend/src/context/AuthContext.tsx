import React, { useState, useEffect, createContext } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";

export const AuthContext = createContext<FbUserContextMaybe | null>(null);

interface FbUser extends User {
  accessToken: string;
  username: string;
  email: string;
}

export interface FbUserContextMaybe {
  currentUser: FbUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<FbUser | null>>; 
}
export interface FbUserContext {
  currentUser: FbUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<FbUser>>; 
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FbUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const auth = getAuth();

  useEffect(() => {
    let myListener = onAuthStateChanged(auth, async (_user) => {
      let user = _user as FbUser;

      if (auth && user) {
        const token = user.accessToken;
        const response = await fetch(
          `/api/users/${user.uid}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        if (!response.ok) {
          console.log("Server Error");
          return;
        }
        const result = await response.json();
        console.log(result);
        if (result.username) {
          console.log("AAA")
          user.username = result.username;
        } else {
          console.log("AAA")
          user.username = user.uid;
        }
      }
      setCurrentUser(user);
      //console.log("onAuthStateChanged", user);
      setLoadingUser(false);
    });
    return () => {
      if (myListener) myListener();
    };
  }, []);

  if (loadingUser) {
    return (
      <div className="container-fluid">
        <h1>Loading...</h1>
      </div>
    );
  } else {
    return (
      <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
        {children}
      </AuthContext.Provider>
    );
  }
};
