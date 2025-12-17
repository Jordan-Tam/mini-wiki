import { useContext, useState, useEffect } from "react";
import { AuthContext, type FbUserContext } from "../../context/AuthContext.jsx";
import Modal from "react-modal";
import type { UserModalParams } from "../../types.js";

Modal.setAppElement("#root");

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
		borderRadius: "4px"
  },
};

function ChangeBioModal({ isOpen, handleClose, user, setUser }: UserModalParams) {
  const { currentUser } = useContext(AuthContext) as FbUserContext;

  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [disableSubmit, setDisableSubmit] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio ?? "");
    }
  }, [user, isOpen]);

  const submitForm = async (e:any) => {
    e.preventDefault();
  
    try {
      setDisableSubmit(true);

      if(bio.trim().length <= 1 || bio.trim().length >= 255){
        throw `Bio must be between 1 and 255 characters and cannot be all spaces.`
      }
  
      const response = await fetch(
        `/api/users/${currentUser.uid}/bio`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + currentUser.accessToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bio }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw data.error;
      }
  
      if (setUser) {
        setUser(data);
      }
  
      setError("");
      handleClose();
      alert("Bio successfully changed!");
    } catch (e) {
      setError(String(e));
      setDisableSubmit(false);
    }
  };
  

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customStyles}
      contentLabel="Change Bio Modal"
    >
      <div
        className="d-flex justify-content-between align-items-center mb-3"
      >
        <h5 className="mb-0">Edit Bio</h5>
        <button
          className="btn btn-secondary"
          onClick={handleClose}
        >
          X
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={submitForm}>
        <div className="form-floating mb-3">
          <textarea
            className="form-control"
            id="bio"
            placeholder="Enter bio here..."
            style={{ height: "120px" }}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={disableSubmit}
            required
          />
          <label>Bio</label>
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={disableSubmit}
        >
          Save Bio
        </button>
      </form>
    </Modal>

  );
}


export default ChangeBioModal;
