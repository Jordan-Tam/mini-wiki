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
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
