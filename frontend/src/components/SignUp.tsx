import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { doCreateUserWithEmailAndPassword } from "../firebase/FirebaseFunctions";
import { AuthContext } from "../context/AuthContext";
import SocialSignIn from "./SocialSignIn";
import { Link } from "react-router-dom";

function SignUp() {

  const { currentUser } = useContext(AuthContext) as FbUserContextWrapper;

  // Stateful form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e) => {

    e.preventDefault();
    
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await doCreateUserWithEmailAndPassword(
        email,
        password,
      );
    
    } catch (e) {
      switch (e.code) {
        case "auth/invalid-email":
          setError("Invalid email.");
          break;
        case "auth/weak-password":
          setError("Weak password.");
          break;
        case "auth/email-already-in-use":
          setError("Email already in use.");
          break;
        default:
          setError(`${e}`);
      }
    }
  };

  if (currentUser) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="container-fluid">
      <h1 className="mb-3" style={{ fontWeight: "bold" }}>
        Register
      </h1>
      {error && <h4 className="error">{error}</h4>}
      <form onSubmit={handleSignUp}>
        <div className="form-floating mb-3" style={{ width: "500px" }}>
          <input
            className="form-control"
            placeholder="Email goes here"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            name="email"
            type="email"
            required
          />
          <label htmlFor="email">Email</label>
        </div>
        <div className="form-floating mb-3" style={{ width: "500px" }}>
          <input
            className="form-control"
            placeholder="Password goes here"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="passwordOne"
            name="passwordOne"
            type="password"
            required
          />
          <label htmlFor="passwordOne">Password</label>
        </div>
        <div className="form-floating mb-3" style={{ width: "500px" }}>
          <input
            className="form-control"
            placeholder="Confirm Password goes here"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            id="passwordTwo"
            name="passwordTwo"
            type="password"
            required
          />
          <label htmlFor="passwordTwo">Confirm Password</label>
        </div>
        <button type="submit" className="btn btn-primary">
          Register
        </button>
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
