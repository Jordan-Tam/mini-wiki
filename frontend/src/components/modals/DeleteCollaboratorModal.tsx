import { useContext, useState } from "react";
import { AuthContext, type FbUserContextWrapper } from "../../context/AuthContext.jsx";
import Modal from "react-modal";

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
    }
};

function DeleteCollaboratorModal(props) {

    
    const { currentUser } = useContext(AuthContext) as FbUserContextWrapper;

    const [username, setUsername] = useState(props.username);
    const [error, setError] = useState("");
    const [disableSubmit, setDisableSubmit] = useState(false);
    
    const submitForm = async (e) => {

        e.preventDefault();

        try {
            setDisableSubmit(true);
            let response = await fetch(
                `/api/wiki/${props.wikiId}/collaborators`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: "Bearer " + currentUser.accessToken,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username: props.username })
                }
            );
            
            if (!response.ok) {
                setDisableSubmit(false);
                throw (await response.json()).error;
            }

            const result = await response.json();
            props.setWiki(result);
            setUsername("");
            setError("");
            alert("Collaborator successfully removed!");
            props.handleClose();

        } catch (e) {
            setDisableSubmit(false);
            setError(`${e}`);
        }
    };

    return (
        <div>
            <Modal
                isOpen={props.isOpen}
                onRequestClose={props.handleClose}
                style={customStyles}

                contentLabel="Delete Collaborator Modal"
            >
                <div>
                    <p>Are you sure you want to remove <span style={{fontWeight: "bold"}}>{props.username}?</span></p>
                    <form
                        className="form"
                        id="delete-collaborator"
                        onSubmit={(e) => submitForm(e)}
                    >
                        <button
                            className="btn btn-danger"
                        >
                            Yes
                        </button>
                    </form>
                    <br/>
                    <button
                        className="btn btn-secondary"
                        onClick={props.handleClose}
                    >
                        No
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default DeleteCollaboratorModal;
