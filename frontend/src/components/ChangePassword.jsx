import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { doChangePassword } from "../firebase/FirebaseFunctions";

function ChangePassword() {
  const {currentUser} = useContext(AuthContext);
  const [pwMatch, setPwMatch] = useState("");

  const submitForm = async (event) => {
    event.preventDefault();
    const { currentPassword, newPasswordOne, newPasswordTwo } =
      event.target.elements;
    if (newPasswordOne.value !== newPasswordTwo.value) {
      setPwMatch("New passwords do not match!");
      return false;
    }
    try {
      await doChangePassword(
        currentUser.email,
        currentPassword.value,
        newPasswordOne.value
      );
      alert("Password has been changed, you will now be logged out");
    } catch (error) {
      alert(error);
    }
  };
  return (
    <div>
      {pwMatch && <p className="error">{pwMatch}</p>}
      <h3>Change Your Password Below</h3>
      <form onSubmit={submitForm}>
        <div className="form-group">
          <label>
            Current Password:
            <input
              className="form-control"
              name="currentPassword"
              id="currentPassword"
              type="password"
              placeholder="Current Password"
              autoComplete="off"
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            New Password:
            <input
              className="form-control"
              name="newPasswordOne"
              id="newPasswordOne"
              type="password"
              placeholder="Password"
              autoComplete="off"
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Confirm New Password:
            <input
              className="form-control"
              name="newPasswordTwo"
              id="newPasswordTwo"
              type="password"
              placeholder="Confirm Password"
              autoComplete="off"
              required
            />
          </label>
        </div>

        <button className="button" type="submit">
          Change Password
        </button>
      </form>
      <br />
    </div>
  );
}

export default ChangePassword;
