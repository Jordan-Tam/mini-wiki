import ReactModal from "react-modal";
import {
  doDeleteUserEmailAndPassword,
  doDeleteUserSocial,
} from "../../firebase/FirebaseFunctions";
import { useContext, useState } from "react";
import { AuthContext, type FbUserContext } from "../../context/AuthContext";

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
  const { currentUser } = useContext(AuthContext) as FbUserContext;

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
                // do firebase delete
                await doDeleteUserEmailAndPassword(
                  currentUser.email,
                  password.value
                );
              } else {
                // do social delete
                await doDeleteUserSocial();
              }
            } catch (e) {
              alert(e);
              setShowDeleteModal(false);
              props.handleClose();
              return;
            }

            try {
              /**
               * Try deleting from backend, code 409 = user needs to delete wikis, redirect to wikis page
               */
              const token = currentUser.accessToken;
              const response = await fetch(`/api/users/${currentUser.uid}`, {
                method: "DELETE",
                headers: {
                  Authorization: "Bearer " + token,
                },
              });

              // check status
              if (!response.ok || response.status !== 200) {
                // user needs to get rid of their wikis
                if (response.status === 409) {
                  alert((await response.json()).error); //This code should never run at this point, but leaving it in case.
                  // redirect to wikis
                  return (window.location.href = `/profile/${currentUser.uid}`);
                }

                alert((await response.json()).error);
                return;
              } else {
                /**
                 * Response ok -- user was deleted from the local database
                 */
                /**
                 * If user exists in firebase, delete in firebase, else do delete from social
                 */

                alert("Account Deleted");
                setShowDeleteModal(false);
                props.handleClose();
              }
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
