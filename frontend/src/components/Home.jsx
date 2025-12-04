import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function Home() {

  const {currentUser} = useContext(AuthContext);

  const [token, setToken] = useState(currentUser ? currentUser.accessToken : "");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(true);
  

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/wikis", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token
          }
        });
      } catch (e) {
        console.log(response.status + "Error");
        return;
      }
    }
  }, []);

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <p>Welcome to Mini Wiki, {currentUser.displayName}!</p>
      <p>
        ik theres a bug with the display name not loading when you first sign up
        with email... working on it - Owen
      </p>
    </>
  );
}

export default Home;
