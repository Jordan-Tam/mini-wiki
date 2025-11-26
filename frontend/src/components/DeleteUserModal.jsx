import ReactModal from "react-modal";
import {
  doDeleteUserEmailAndPassword,
  doDeleteUserSocial,
} from "../firebase/FirebaseFunctions";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

ReactModal.setAppElement("#root");
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    border: "1px solid #28547a",
    borderRadius: "4px",
  },
};

function DeleteUserModal(props) {
  const [showDeleteModal, setShowDeleteModal] = useState(props.isOpen);
  const { currentUser } = useContext(AuthContext);

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    props.handleClose();
  };

  let password;

  return (
    <div>
      <ReactModal
        name="deleteModal"
        isOpen={showDeleteModal}
        contentLabel="Delete User"
        style={customStyles}
      >
        <p>Are you sure you want to delete your account?</p>
        <form
          className="form"
          id="deleteUserForm"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (currentUser.providerData[0].providerId === "password") {
                await doDeleteUserEmailAndPassword(
                  currentUser.email,
                  password.value
                );
              } else {
                await doDeleteUserSocial();
              }
              alert("Account Deleted");
              setShowDeleteModal(false);
              props.handleClose();
            } catch (e) {
              alert(e);
              setShowDeleteModal(false);
              props.handleClose();
            }
          }}
        >
          <div className="form-group">
            {currentUser.providerData[0].providerId === "password" && (
              <label>
                Reenter Password:
                <br />
                <input
                  ref={(node) => {
                    password = node;
                  }}
                  autoFocus={true}
                  required
                  type="password"
                />
              </label>
            )}
          </div>
          <br />
          <br />

          <button className="button add-button" type="submit">
            Delete Account
          </button>
        </form>
        <br />
        <button
          className="button cancel-button"
          onClick={handleCloseDeleteModal}
        >
          Cancel
        </button>
      </ReactModal>
    </div>
  );
}

export default DeleteUserModal;
