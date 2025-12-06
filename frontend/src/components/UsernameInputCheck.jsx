import { useEffect } from "react";

function UsernameInputCheck(props) {
  useEffect(() => {
    async function checkUsernameTaken(username) {
      if (!username || !username.trim()) {
        document.getElementById("usernameStatus").hidden = true;
        props.setChangeUsernameOK(false);
        return;
      }
      try {
        console.log(`checking if ${username} is taken.`);
        let response = await fetch(
          `http://localhost:3000/users/usernameTaken/${username}`,
          {
            method: "POST",
          }
        );
        if (!response.ok) {
          document.getElementById("usernameStatus").innerHTML = "Server error";
          document.getElementById("usernameStatus").style.color = "red";
          document.getElementById("usernameStatus").hidden = false;
          props.setChangeUsernameOK(false);
          return;
        }
        const result = await response.json();
        if (result.error) {
          document.getElementById("usernameStatus").innerHTML =
            "❌ " + result.error;
          document.getElementById("usernameStatus").style.color = "red";
          document.getElementById("usernameStatus").hidden = false;
          props.setChangeUsernameOK(false);
          return;
        }
        if (result.message) {
          document.getElementById("usernameStatus").innerHTML =
            "✅ " + "Username Available.";
          document.getElementById("usernameStatus").style.color = "green";
          document.getElementById("usernameStatus").hidden = false;
          props.setChangeUsernameOK(true);
        }
      } catch (e) {
        console.log("Error: " + e);
        return;
      }
    }
    checkUsernameTaken(props.username);
  }, [props.username]);

  return (
    <div>
      <p id="usernameStatus"></p>
    </div>
  );
}

export default UsernameInputCheck;
