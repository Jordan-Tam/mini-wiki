import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { doCreateUserWithEmailAndPassword } from "../firebase/FirebaseFunctions";
import { AuthContext } from "../context/AuthContext";
import SocialSignIn from "./SocialSignIn";
import { Link } from "react-router-dom";

function SignUp() {
  const { currentUser } = useContext(AuthContext);
  const [pwMatch, setPwMatch] = useState("");
  const handleSignUp = async (e) => {
    e.preventDefault();
    const { displayName, email, passwordOne, passwordTwo } = e.target.elements;
    if (passwordOne.value !== passwordTwo.value) {
      setPwMatch("Passwords do not match");
      return false;
    }

    try {
      await doCreateUserWithEmailAndPassword(
        email.value,
        passwordOne.value,
        displayName.value
      );
    } catch (error) {
      alert(error);
    }
  };

  if (currentUser) {
    return <Navigate to="/home" />;
  }

  return (
    <div>
      <h1>Sign Up</h1>
      {pwMatch && <h4 className="error">{pwMatch}</h4>}
      <form onSubmit={handleSignUp}>
        <div className="form-group">
          <label>
            Name:
            <br />
            <input
              className="form-control"
              required
              name="displayName"
              type="text"
              placeholder="Name"
              autoFocus={true}
            />
          </label>
        </div>
        <br />
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
            Password:
            <br />
            <input
              className="form-control"
              id="passwordOne"
              name="passwordOne"
              type="password"
              placeholder="Password"
              autoComplete="off"
              required
            />
          </label>
        </div>
        <br />
        <div className="form-group">
          <label>
            Confirm Password:
            <br />
            <input
              className="form-control"
              name="passwordTwo"
              type="password"
              placeholder="Confirm Password"
              autoComplete="off"
              required
            />
          </label>
        </div>
        <br />
        <button
          className="button"
          id="submitButton"
          name="submitButton"
          type="submit"
        >
          Sign Up
        </button>
      </form>
      <br />
      <SocialSignIn />
      <br />
      <div>
        <Link to="/signin">Already have an account? Sign in here!</Link>
      </div>
    </div>
  );
}

export default SignUp;
