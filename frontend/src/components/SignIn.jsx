import { useContext } from "react";
import SocialSignIn from "./SocialSignIn";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  doSignInWithEmailAndPassword,
  doPasswordReset,
} from "../firebase/FirebaseFunctions";

function SignIn() {
  const { currentUser } = useContext(AuthContext);
  const handleLogin = async (event) => {
    event.preventDefault();
    let { email, password } = event.target.elements;

    try {
      await doSignInWithEmailAndPassword(email.value, password.value);
    } catch (error) {
      alert(error);
    }
  };

    if (currentUser) {
      return <Navigate to="/home" />;
    }

  // const passwordReset = (event) => {
  //   event.preventDefault();
  //   let email = document.getElementById("email").value;
  //   if (email) {
  //     doPasswordReset(email);
  //     alert("Password reset email was sent");
  //   } else {
  //     alert(
  //       "Please enter an email address below before you click the forgot password link"
  //     );
  //   }
  // };
  if (currentUser) {
    return <Navigate to="/home" />;
  }
  return (
    <div>
      <div>
        <h1>Sign In</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>
              Email address
              <input
                type="email"
                name="email"
                className="form-control"
                id="email"
                placeholder="Enter email"
                required
                autoFocus={true}
              />
            </label>
          </div>
          <br />
          <div className="form-group">
            <label>
              Password
              <input
                type="password"
                name="password"
                className="form-control"
                id="password"
                placeholder="Password"
                autoComplete="off"
                required
              />
            </label>
          </div>
          <br />
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>

        <br />
        <SocialSignIn />
      </div>
      <br />
      <div>
        <Link to="/signup">New to Mini Wiki? Sign up here!</Link>
      </div>
    </div>
  );
}

export default SignIn;
