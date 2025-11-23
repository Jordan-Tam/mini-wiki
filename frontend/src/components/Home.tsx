import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const { currentUser } = useContext(AuthContext);
  return (
    <>
      <p>Welcome {currentUser.displayName}!</p>
    </>
  );
}

export default Home;
