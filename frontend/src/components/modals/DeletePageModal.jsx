import ReactModal from "react-modal";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import DeletePageModal from "./modals/DeletePageModal.jsx";

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

function DeletePageModal(props) {
  const [showDeletePageModal, setShowDeletePageModal] = useState(props.isOpen);
  const [error, setError] = useState("");
  const { currentUser } = useContext(AuthContext);

  let navigate = useNavigate();

  return (
    <div>
      <ReactModal
        name="deletePageModal"
        isOpen={showDeletePageModal}
        contentLabel="Delete Page"
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
            <h5 style={{ display: "inline" }}>Delete Page</h5>
            <button
              className="btn btn-secondary"
              onClick={props.handleClose}
              style={{ display: "inline", fontWeight: "bold" }}
            >
              X
            </button>
          </div>
        </div>
        <p>Are you sure you want to delete this page?</p>
        <form
          className="form"
          id="deletePageForm"
          onSubmit={async (e) => {
            e.preventDefault();
            wikiUrlName = props.wikiUrlName;
            pageUrlName = props.pageUrlName;
            try {
              console.log("delete page");
              if (!wikiUrlName || !pageUrlName) {
                alert("Error deleting page");
                return;
              }
              try {
                const response = await fetch(
                  `/api/wiki/${wikiUrlName}/pages/${pageUrlName}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: "Bearer " + currentUser?.accessToken,
                    },
                  }
                );
                if (!response.ok) {
                  setError((await response.json()).error);
                  return;
                }
              } catch (e) {
                alert(e);
                setShowDeletePageModal(false);
                props.handleClose();
              }
              setError("");
              alert("Page Deleted");
              setShowDeletePageModal(false);
              props.handleClose();
              navigate(`/${wikiUrlName}`);
            } catch (e) {
              alert(e);
              setShowDeletePageModal(false);
              props.handleClose();
            }
          }}
        >
          {error && <span style={{ color: "red" }}>{error}</span>}
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

export default DeletePageModal;
