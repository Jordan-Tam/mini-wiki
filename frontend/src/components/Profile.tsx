import SignOutButton from "./SignOut";
import ChangePasswordModal from "./modals/ChangePasswordModal";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import DeleteUserModal from "./modals/DeleteUserModal";

function Profile() {
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const { currentUser } = useContext(AuthContext);

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

  return (
    <div className="container-fluid">
      <h2>{currentUser.displayName}'s Account Page</h2>
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
      <br/>
      <br/>

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
