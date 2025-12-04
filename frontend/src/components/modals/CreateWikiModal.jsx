import {useContext, useState} from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import Modal from "react-modal";

Modal.setAppElement("#root");

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
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
    const [description, setDescription] = useState("");
    const [access, setAccess] = useState(true);
    const [error, setError] = useState("");
    
    // Submit form function
    const submitForm = async (e) => {

        e.preventDefault();

        // Frontend input validation (to be implemented)
        try {

        } catch (e) {

        }

        // Make the POST request.
        console.log({
                    name,
                    description,
                    access: access ? "public" : "private"
                });
        try {
            let response = await fetch("/api/wiki", {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + currentUser.accessToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    description,
                    access: access ? "public" : "private"
                })
            });
            if (!response.ok) {
                throw response.statusText;
            }
        } catch (e) {
            setError(`${e}`);
            return;
        }

        // Close the modal.
        setShowCreateWikiModal(false);
        alert(`Wiki Created`);
        props.handleClose();

    }

    const handleCloseCreateWikiModal = () => {
        setShowCreateWikiModal(false);
        props.handleClose();
    }

    return (
        <div>
            <Modal
                isOpen={showCreateWikiModal}
                style={customStyles}
            >
                <div className="row mb-3" style={{display: "flex", justifyContent: "space-between"}}>
                    <div className="col" style={{display: "flex", justifyContent: "space-between"}}>
                        <h5 style={{display: "inline"}}>
                            Create a new wiki
                        </h5>
                        <button
                            className="btn btn-secondary"
                            onClick={handleCloseCreateWikiModal}
                            style={{display: "inline", fontWeight: "bold"}}
                        >
                            X
                        </button>
                    </div>
                </div>
                {error && <p style={{color: "red"}}>{error}</p>}
                <form
                onSubmit={(e) => submitForm(e)}
                >
                    <div className="form-floating mb-3">
                        <input
                            className="form-control"
                            placeholder="name"
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                        <label htmlFor="name">Name</label>
                    </div>
                    <div className="form-floating mb-3">
                        {/* //TODO: Change this to a textarea. */}
                        <input
                            className="form-control"
                            placeholder="description"
                            type="text"
                            id="description"
                            name="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                        <label htmlFor="description">Description</label>
                    </div>
                    <p>Select an access type:</p>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            id="public"
                            name="public"
                            checked={access}
                            onChange={() => setAccess(true)}
                        />
                        <label className="form-check-label" htmlFor="public">
                            Public
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            id="public"
                            name="public"
                            checked={!access}
                            onChange={() => setAccess(false)}
                        />
                        <label className="form-check-label" htmlFor="public">
                            Private
                        </label>
                    </div>
                    <button className="btn btn-primary mt-3" type="submit">
                        Create Wiki
                    </button>
                </form>
            </Modal>
        </div>
    );

}

export default CreateWikiModal;

/**
 * 
            name,
            description,
            owner,
            access,
            categories: ["UNCATEGORIZED"],
            collaborators: [],
            pages: []
 * 
 */