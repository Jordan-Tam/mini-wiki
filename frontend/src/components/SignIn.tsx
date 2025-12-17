import { useContext } from "react";
import SocialSignIn from "./SocialSignIn";
import { Navigate } from "react-router-dom";
import { AuthContext, type FbUserContextMaybe } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  doSignInWithEmailAndPassword,
  doPasswordReset,
} from "../firebase/FirebaseFunctions";

function SignIn() {
  const { currentUser } = useContext && useContext(AuthContext) as FbUserContextMaybe;
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
    <div className="container-fluid">
      <h1 className="mb-3" style={{fontWeight: "bold"}}>Login</h1>
      <form onSubmit={handleLogin}>
        <div className="form-floating mb-3" style={{"width": "500px"}}>
          <input
            className="form-control"
            placeholder="Email goes here"
            id="email"
            name="email"
            type="email"
            required
          />
          <label htmlFor="email">Email</label>
        </div>
        <div className="form-floating mb-3" style={{"width": "500px"}}>
          <input
            className="form-control"
            placeholder="Password goes here"
            id="password"
            name="password"
            type="password"
            required
          />
          <label htmlFor="password">Password</label>
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <br />
      <h5>Or log in with an external account:</h5>
      <SocialSignIn />
      <br />
      <div>
        New to Mini Wiki? <Link to="/signup">Sign up here!</Link>
      </div>
    </div>
  );
}

export default SignIn;
