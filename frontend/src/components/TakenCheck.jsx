import { useEffect } from "react";

function TakenCheck(props) {
  useEffect(() => {
    async function taken(variable) {
      if (!variable || !variable.trim()) {
        document.getElementById("status").hidden = true;
        props.setOK(false);
        return;
      }
      try {
        console.log(`checking if ${variable} is taken.`);
        let response = await fetch(
          `${props.serverURL}${variable}`,
          {
            method: "POST",
          }
        );
        if (!response.ok) {
          document.getElementById("status").innerHTML = "Server error";
          document.getElementById("status").style.color = "red";
          document.getElementById("status").hidden = false;
          props.setOK(false);
          return;
        }
        const result = await response.json();
        if (result.error) {
          document.getElementById("status").innerHTML =
            "❌ " + result.error;
          document.getElementById("status").style.color = "red";
          document.getElementById("status").hidden = false;
          props.setOK(false);
          return;
        }
        if (result.message) {
          document.getElementById("status").innerHTML =
            "✅ " + `${props.varName} Available.`;
          document.getElementById("status").style.color = "green";
          document.getElementById("status").hidden = false;
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
