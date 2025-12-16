import {useContext, useState} from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import TakenCheck from "../TakenCheck";
import { checkUrlName } from "../../../helpers.ts";

Modal.setAppElement("#root");

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginTop: '25px',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        border: '1px solid #28547a',
        borderRadius: '4px'
    }
};

function CreateWikiModal(props) {

    // Auth
    const {currentUser} = useContext(AuthContext);

    // Modal stuff
    const [showCreateWikiModal, setShowCreateWikiModal] = useState(props.isOpen);

    // Form stuff
    const [name, setName] = useState("");
    const [urlName, setUrlName] = useState("");
    const [description, setDescription] = useState("");
    const [access, setAccess] = useState(2);
    const [error, setError] = useState("");
    const [disableSubmit, setDisableSubmit] = useState(false);
    const [URLOK, setURLOK] = useState(null); 

    // To go to the wiki's page after it is made
    let navigate = useNavigate();

    const FORBIDDEN_WIKI_URL_NAMES = [
      "discover",
      "create",
      "home",
      "profile",
      "user",
      "signin",
      "signup",
      "testing",
      "settings"
    ];

    // Submit form function
    const submitForm = async (e) => {

        e.preventDefault();

        // Frontend input validation (to be implemented) (I implemented urlname checking - Owen)
        try {
          setUrlName(checkUrlName(urlName));
          if (FORBIDDEN_WIKI_URL_NAMES.includes(urlName)){
            setDisableSubmit(false);
            setError("Cannot use this Wiki URL.");
            return;
          }

        } catch (e) {
          setDisableSubmit(false);
          setError(e);
          return;
        }

        try {
            setDisableSubmit(true);
            let response = await fetch("/api/wiki", {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + currentUser.accessToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    urlName,
                    description,
                    access: access === 0 ? "public-edit" : (access === 1 ? "public-view" : "private")
                })
            });
            if (!response.ok) {
                setDisableSubmit(false);
                throw (await response.json()).error;
            }
            
            //const result = await response.json();
            //props.setWikisData(prev => [...prev, result])
        } catch (e) {
            setDisableSubmit(false);
            setError(e);
            return;
        }

        // Close the modal.
        setShowCreateWikiModal(false);
        alert(`Wiki Created`);
        navigate(`/${urlName}`);
        props.handleClose();

    }

    const handleCloseCreateWikiModal = () => {
        setShowCreateWikiModal(false);
        props.handleClose();
    }

    return (
      <div>
        <Modal isOpen={showCreateWikiModal} style={customStyles}>
          <div
            className="row mb-3"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div
              className="col"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <h5 style={{ display: "inline" }}>Create a new wiki</h5>
              <button
                className="btn btn-secondary"
                onClick={handleCloseCreateWikiModal}
                style={{ display: "inline", fontWeight: "bold" }}
              >
                X
              </button>
            </div>
          </div>
          <form onSubmit={(e) => submitForm(e)}>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                placeholder="name"
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={disableSubmit}
                required
              />
              <label htmlFor="name">Name</label>
            </div>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                placeholder="urlName"
                type="text"
                id="urlName"
                name="urlName"
                value={urlName}
                onChange={(e) => setUrlName(e.target.value)}
                disabled={disableSubmit}
                required
              />
              <label htmlFor="urlName">URL Name</label>
              <p className="small text-muted">
                The URL Name is used to uniquely identify the wiki in web
                addresses. Please choose wisely because you will not be able to
                change it after the wiki has been created.
              </p>
            </div>
            <TakenCheck
              variable={urlName}
              setOK={setURLOK}
              varName={"Wiki URL"}
              serverURL="/api/wiki/urlTaken/"
            />
            <div className="form-floating mb-3">
              {/* //TODO: Change this to a textarea. */}
              <input
                className="form-control"
                placeholder="description"
                type="text"
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={disableSubmit}
                required
              />
              <label htmlFor="description">Description</label>
            </div>
            <p>Select an access type:</p>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="public-edit"
                name="public-edit"
                checked={access === 0}
                onChange={() => setAccess(0)}
                disabled={disableSubmit}
              />
              <label className="form-check-label" htmlFor="public-edit">
                <span style={{ fontWeight: "bold" }}>Publicly Editable:</span>{" "}
                All users can view and edit this wiki.
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="public-view"
                name="public-view"
                checked={access === 1}
                onChange={() => setAccess(1)}
                disabled={disableSubmit}
              />
              <label className="form-check-label" htmlFor="public-view">
                <span style={{ fontWeight: "bold" }}>Publicly Viewable:</span>{" "}
                All users can view this wiki, but only collaborators can edit.
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="private"
                name="private"
                checked={access === 2}
                onChange={() => setAccess(2)}
                disabled={disableSubmit}
              />
              <label className="form-check-label" htmlFor="private">
                <span style={{ fontWeight: "bold" }}>Private:</span> Only users
                you allow can view or edit this wiki.
              </label>
            </div>
            <div className="d-flex align-items-baseline">
              <button
                className="btn btn-primary mt-3 me-3"
                type="submit"
                disabled={disableSubmit && !URLOK}
              >
                Create Wiki
              </button>
              {error && <span style={{ color: "red" }}>{error}</span>}
            </div>
          </form>
        </Modal>
      </div>
    );

}

export default CreateWikiModal;