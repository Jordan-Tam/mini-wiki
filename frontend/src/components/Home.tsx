import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function Home() {
  const {currentUser} = useContext(AuthContext);

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
