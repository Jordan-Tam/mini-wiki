import SignOutButton from "./SignOut";
import ChangePassword from "./ChangePassword";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import DeleteUserModal from "./modals/DeleteUserModal";

function Profile() {
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const handleOpenDeleteUserModal = () => {
    setShowDeleteUserModal(true);
  };

  const handleCloseDeleteUserModal = () => {
    setShowDeleteUserModal(false);
  };

  return (
    <div>
      <h2>{currentUser.displayName}'s Account Page</h2>
      {currentUser && currentUser.providerData[0].providerId === "password" && (
        <ChangePassword />
      )}
      <br />
      <SignOutButton />
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
    </div>
  );
}

export default Profile;
