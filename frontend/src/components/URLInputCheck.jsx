import { useEffect } from "react";

function URLInputCheck(props) {
  useEffect(() => {
    async function checkURLTaken(url) {
      if (!url || !url.trim()) {
        document.getElementById("urlStatus").hidden = true;
        props.setURLOK(false);
        return;
      }
      try {
        console.log(`checking if ${url} is taken.`);
        let response = await fetch(
          `http://localhost:3000/wiki/urlTaken/${url}`,
          {
            method: "POST",
          }
        );
        if (!response.ok) {
          document.getElementById("urlStatus").innerHTML = "Server error";
          document.getElementById("urlStatus").style.color = "red";
          document.getElementById("urlStatus").hidden = false;
          props.setURLOK(false);
          return;
        }
        const result = await response.json();
        if (result.error) {
          document.getElementById("urlStatus").innerHTML =
            "❌ " + result.error;
          document.getElementById("urlStatus").style.color = "red";
          document.getElementById("urlStatus").hidden = false;
          props.setURLOK(false);
          return;
        }
        if (result.message) {
          document.getElementById("urlStatus").innerHTML =
            "✅ " + "URL Available.";
          document.getElementById("urlStatus").style.color = "green";
          document.getElementById("urlStatus").hidden = false;
          props.setURLOK(true);
        }
      } catch (e) {
        console.log("Error: " + e);
        return;
      }
    }
    checkURLTaken(props.url);
  }, [props.url]);

  return (
    <div>
      <p id="urlStatus"></p>
    </div>
  );
}

export default URLInputCheck;
