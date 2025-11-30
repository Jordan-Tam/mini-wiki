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
    <div className="container-fluid">
      <h1 className="mb-3" style={{fontWeight: "bold"}}>Register</h1>
      {pwMatch && <h4 className="error">{pwMatch}</h4>}
      <form onSubmit={handleSignUp}>
        <div class="form-floating mb-3" style={{"width": "500px"}}>
          <input
            className="form-control"
            placeholder="Name goes here"
            id="displayName"
            name="displayName"
            type="text"
            autoFocus={true}
            required
          />
          <label htmlFor="displayName">Username</label>
        </div>
        <div class="form-floating mb-3" style={{"width": "500px"}}>
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
        <div class="form-floating mb-3" style={{"width": "500px"}}>
          <input
            className="form-control"
            placeholder="Password goes here"
            id="passwordOne"
            name="passwordOne"
            type="password"
            required
          />
          <label htmlFor="passwordOne">Password</label>
        </div>
        <div class="form-floating mb-3" style={{"width": "500px"}}>
          <input
            className="form-control"
            placeholder="Confirm Password goes here"
            id="passwordTwo"
            name="passwordTwo"
            type="password"
            required
          />
          <label htmlFor="passwordTwo">Confirm Password</label>
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <br />
      <h5>Or sign up with an external account:</h5>
      <SocialSignIn />
      <br />
      <div>
        Already have an account? <Link to="/signin">Log in here!</Link>
      </div>
    </div>
  );
}

export default SignUp;
