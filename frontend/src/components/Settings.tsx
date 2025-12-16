import SignOutButton from "./SignOut";
import ChangePasswordModal from "./modals/ChangePasswordModal";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import DeleteUserModal from "./modals/DeleteUserModal";
import TakenCheck from "./TakenCheck";

function Settings() {
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [username, setUsername] = useState("");
  const [changeUsernameOK, setChangeUsernameOK] = useState(null);
  const [error, setError] = useState("");

  const { currentUser, setCurrentUser } = useContext(AuthContext) as FbUserContextWrapper;

  let token: any;

  if (currentUser) {
    token = currentUser.accessToken;
  }
  const handleOpenDeleteUserModal = () => {
    setShowDeleteUserModal(true);
  };

  const handleCloseDeleteUserModal = () => {
    setShowDeleteUserModal(false);
  };

  const handleOpenChangePasswordModal = () => {
    setShowChangePasswordModal(true);
  };

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
  };

  const handleUsernameChange = (usernameInput: any) => {
    setUsername(usernameInput);
  };

  const handleChangeUsername = async (usernameInput: any) => {
    const obj = { username: usernameInput };
    const response = await fetch(`/api/users/${currentUser.uid}`, {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });
    if (!response.ok) {
      console.log("Server Error");
      return;
    }
    const result = await response.json();
    if (result.message === "Username changed") {
      alert("Username Changed");
      setCurrentUser({ ...currentUser, username: usernameInput });
      // window.location.reload();
      setUsername("");
    }
  };

  useEffect(() => {
    const fetchWikis = async () => {
      try {
        const response = await fetch(`api/users/${currentUser.uid}/wikis`, {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          setError("Error getting your account info from the server.");
          return;
        }
        let result = await response.json();
        if (result.OWNER.length) {
          setError(
            "Cannot delete your account! Please delete or transfer ownership to all your wikis!"
          );
        } else {
          setError("");
        }
      } catch (e) {
        setError(`${e}`);
      }
    };

    if (currentUser) fetchWikis();
  }, []);

  return (
    <div className="container-fluid">
      <h2>Your Settings</h2>

      <div className="form-floating mb-3" style={{ width: "500px" }}>
        <input
          className="form-control"
          name="usernameInput"
          id="usernameInput"
          placeholder="username"
          value={username}
          onChange={(event) => handleUsernameChange(event.target.value)}
        />
        <label htmlFor="usernameInput">
          Change username: {currentUser.username}
        </label>
      </div>
      {currentUser && (
        <TakenCheck
          variable={username}
          varName={"Username"}
          setOK={setChangeUsernameOK}
          serverURL="/api/users/usernameTaken/"
        />
      )}

      {currentUser && changeUsernameOK && (
        <div>
          <button onClick={() => handleChangeUsername(username)}>
            Change Username
          </button>
          <br />
          <br />
        </div>
      )}

      {currentUser &&
        currentUser.providerData[0].providerId === "password" &&
        showChangePasswordModal && (
          <ChangePasswordModal
            isOpen={showChangePasswordModal}
            handleClose={handleCloseChangePasswordModal}
          />
        )}
      <br />
      <SignOutButton />
      <br />
      <br />
      {currentUser && currentUser.providerData[0].providerId === "password" && (
        <div>
          <button
            className="button"
            onClick={() => {
              handleOpenChangePasswordModal();
            }}
          >
            Change Password
          </button>
          <br />
          <br />
        </div>
      )}
	  {!error && 
      <button
        className="button"
        onClick={() => {
          handleOpenDeleteUserModal();
        }}
      >
        Delete Account
      </button>
	}
      {showDeleteUserModal && (
        <DeleteUserModal
          isOpen={showDeleteUserModal}
          handleClose={handleCloseDeleteUserModal}
        />
      )}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          handleClose={handleCloseChangePasswordModal}
        />
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Settings;
