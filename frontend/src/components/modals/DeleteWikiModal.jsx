import ReactModal from "react-modal";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

function DeleteWikiModal(props) {
  const [showDeleteWikiModal, setShowDeleteWikiModal] = useState(props.isOpen);
  const { currentUser } = useContext(AuthContext);

  let navigate = useNavigate();

  const handleCloseDeleteWikiModal = () => {
    setShowDeleteWikiModal(false);
    props.handleClose();
  };

  return (
    <div>
      <ReactModal
        name="deleteWikiModal"
        isOpen={showDeleteWikiModal}
        contentLabel="Delete Wiki"
        style={customStyles}
      >
        <div
          className="row mb-3"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div
            className="col"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <h5 style={{ display: "inline" }}>Delete Wiki</h5>
            <button
              className="btn btn-secondary"
              onClick={props.handleClose}
              style={{ display: "inline", fontWeight: "bold" }}
            >
              X
            </button>
          </div>
        </div>
        <p>Are you sure you want to delete this wiki?</p>
        <form
          className="form"
          id="deleteWikiForm"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const token = currentUser.accessToken;
              const response = await fetch(`/api/wiki/${props.wikiId}`, {
                method: "DELETE",
                headers: {
                  Authorization: "Bearer " + token,
                },
              });
              if (!response.ok) {
                alert((await response.json()).error);
                return;
              }
              alert("Wiki Deleted");
              setShowDeleteWikiModal(false);
              props.handleClose();
              navigate("/home");
            } catch (e) {
              alert(e);
              setShowDeleteWikiModal(false);
              props.handleClose();
            }
          }}
        >
          <div>
            <button className="btn btn-danger me-3" type="submit">
              Delete
            </button>
            <br />
            <br />
          </div>
        </form>
      </ReactModal>
    </div>
  );
}

export default DeleteWikiModal;
