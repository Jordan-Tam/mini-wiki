import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { checkUrlName, checkUsername } from "../../helpers.ts";

const FORBIDDEN_WIKI_URL_NAMES = [
  "discover",
  "create",
  "home",
  "profile",
  "user",
  "signin",
  "signup",
  "testing",
];
const FORBIDDEN_PAGE_URL_NAMES = ["category", "chat", "search"];

function TakenCheck(props) {
  const { currentUser } = useContext(AuthContext) as FbUserContextWrapper;

  useEffect(() => {
    async function taken(variable) {
      const status = document.getElementById("status");
      if (!variable || !variable.trim()) {
        status.hidden = true;
        props.setOK(false);
        return;
      }
      if (props.varName === "Username") {
        try {
          variable = checkUsername(variable);
        } catch (e) {
          status.innerHTML = "❌ " + e;
          status.style.color = "red";
          status.hidden = false;
          props.setOK(false);
          return;
        }
      }
      if (props.varName === "Wiki URL") {
        try {
          variable = checkUrlName(variable);
        } catch (e) {
          status.innerHTML = "❌ " + e;
          status.style.color = "red";
          status.hidden = false;
          props.setOK(false);
          return;
        }

        if (FORBIDDEN_WIKI_URL_NAMES.includes(variable)) {
          status.innerHTML = "❌ Cannot use this Wiki URL.";
          status.style.color = "red";
          status.hidden = false;
          props.setOK(false);
          return;
        }
      }
      try {
        console.log(`checking if ${variable} is taken.`);
        let response = await fetch(`${props.serverURL}${variable}`, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + currentUser.accessToken,
          },
        });
        if (!response.ok) {
          status.innerHTML = "Server error";
          status.style.color = "red";
          status.hidden = false;
          props.setOK(false);
          return;
        }
        const result = await response.json();
        if (result.error) {
          status.innerHTML = "❌ " + result.error;
          status.style.color = "red";
          status.hidden = false;
          props.setOK(false);
          return;
        }
        if (result.message) {
          status.innerHTML = "✅ " + `${props.varName} Available.`;
          status.style.color = "green";
          status.hidden = false;
          props.setOK(true);
        }
      } catch (e) {
        console.log("Error: " + e);
        return;
      }
    }
    taken(props.variable);
  }, [props.variable]);

  return (
    <div>
      <p id="status"></p>
    </div>
  );
}

export default TakenCheck;
