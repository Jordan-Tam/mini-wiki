import "../App.css";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
function Home() {
  const { currentUser } = useContext(AuthContext);
  return <h1>Welcome to Mini Wiki, {currentUser.displayName}!</h1>;
}

export default Home;
