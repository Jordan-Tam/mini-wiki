import SignOutButton from "./SignOut";
import ChangePasswordModal from "./modals/ChangePasswordModal";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import DeleteUserModal from "./modals/DeleteUserModal";
import TakenCheck from "./TakenCheck";

function Profile() {
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [username, setUsername] = useState(null);
  const [changeUsernameOK, setChangeUsernameOK] = useState(null);

  const { currentUser, setCurrentUser } = useContext(AuthContext);

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
    const response = await fetch(
      `http://localhost:3000/users/${currentUser.uid}`,
      {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      }
    );
    if (!response.ok) {
      console.log("Server Error");
      return;
    }
    const result = await response.json();
    if (result.message === "Username changed") {
      alert("Username Changed");
      setCurrentUser({ ...currentUser, username: usernameInput });
      window.location.reload();
    }
  };

  return (
    <div className="container-fluid">
      <h2>{currentUser.username}'s Account Page</h2>
      <div className="form-floating mb-3" style={{ width: "500px" }}>
        <input
          className="form-control"
          name="usernameInput"
          id="usernameInput"
          placeholder="username"
          onChange={(event) => handleUsernameChange(event.target.value)}
        />
        <label htmlFor="usernameInput">Change Username</label>
      </div>
      {currentUser && (
        <TakenCheck
          variable={username}
          varName={"Username"}
          setOK={setChangeUsernameOK}
          serverURL="http://localhost:3000/users/usernameTaken/"
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

      <button
        className="button"
        onClick={() => {
          handleOpenDeleteUserModal();
        }}
      >
        Delete Account
      </button>
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
    </div>
  );
}

export default Profile;
