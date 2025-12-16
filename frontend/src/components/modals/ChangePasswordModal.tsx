import { useContext, useState } from "react";
import { AuthContext, type FbUserContextWrapper } from "../../context/AuthContext";
import { doChangePassword } from "../../firebase/FirebaseFunctions";
import ReactModal from "react-modal";

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

function ChangePasswordModal(props) {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(
    props.isOpen
  );

  const { currentUser } = useContext(AuthContext) as FbUserContextWrapper;
  const [pwMatch, setPwMatch] = useState("");

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    props.handleClose();
  };

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
      <ReactModal
        name="changePasswordModal"
        isOpen={showChangePasswordModal}
        contentLabel="Change Password User"
        style={customStyles}
      >
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
        <button
          className="button cancel-button"
          onClick={handleCloseChangePasswordModal}
        >
          Cancel
        </button>
      </ReactModal>
    </div>
  );
}

export default ChangePasswordModal;
