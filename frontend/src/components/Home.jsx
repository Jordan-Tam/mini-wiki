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
        const response = await fetch("/api/wiki", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token
          }
        });
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
        return;
      }
    }
    fetchData();
  }, []);

  if (!currentUser) {
    return <Navigate to="/signin" />;
  }

  if (loading) {
    return (
      <h1>Loading...</h1>
    );
  } else if (!data) {
    return (
      <h1>Error</h1>
    );
  } else {
    return (
      <div className="container-fluid">
        {data.wikis && data.wikis.map((wiki) => {
          return (
            <div className="col">
              <div className="card">
                <p className="card-title">
                  {wiki.name}
                </p>
                <p className="card-text">
                  {wiki.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    )
  }

  /* return (
    <>
      <p>Welcome to Mini Wiki, {currentUser.displayName}!</p>
      <p>
        ik theres a bug with the display name not loading when you first sign up
        with email... working on it - Owen
      </p>
    </>
  ); */
}

export default Home;
