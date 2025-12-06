import { useState, useEffect, createContext } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const auth = getAuth();

  useEffect(() => {
    let myListener = onAuthStateChanged(auth, async (user) => {
      if (auth && user) {
        const token = user.accessToken;
        const response = await fetch(
          `http://localhost:3000/users/${user.uid}`,
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
        if (result.username) {
          user.username = result.username;
        } else {
          user.username = user.uid;
        }
      }

      setCurrentUser(user);
      console.log("onAuthStateChanged", user);
      setLoadingUser(false);
    });
    return () => {
      if (myListener) myListener();
    };
  }, []);

  if (loadingUser) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
