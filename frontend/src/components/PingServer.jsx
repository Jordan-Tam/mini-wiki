import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function PingServer() {
  const { currentUser } = useContext(AuthContext);
  let token;
  if (currentUser) {
    token = currentUser.accessToken;
  }

  const [res, setRes] = useState("No click");

  const submit = async (event) => {
    setRes(null);
    try {
      const response = await fetch("http://localhost:3000/api/ping", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      if (!response.ok) {
        console.log(response.status + " Error");
        return
      }
      const result = await response.json();
      console.log(result);
      setRes(result.message);
    } catch (e) {
      setRes(e.message);
      console.log(e);
    }
  };

  return (
    <div>
      <button onClick={submit}>Ping Server</button>
      {res === "No click" && <p>Button not clicked yet</p>}
      {res && res !== "No click" && <p>Server Response: {res}</p>}
      {!res && <p>Loading...</p>}
    </div>
  );
}

export default PingServer;
