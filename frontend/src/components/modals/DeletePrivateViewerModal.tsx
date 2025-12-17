import { useContext, useState } from "react";
import { AuthContext, type FbUserContext } from "../../context/AuthContext.jsx";
import Modal from "react-modal";
import type { WikiSetterBaseParams } from "../../types.js";

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

interface p extends WikiSetterBaseParams {
    username: string;
}

function DeletePrivateViewerModal(props:p) {

    
    const { currentUser } = useContext(AuthContext) as FbUserContext;

    const [disableSubmit, setDisableSubmit] = useState(false);
    
    const submitForm = async (e:any) => {

        e.preventDefault();

        try {
            setDisableSubmit(true);
            let response = await fetch(
                `/api/wiki/${props.wikiId}/private_viewer`,
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
            alert("Private Viewer successfully removed!");
            props.handleClose();

        } catch (e) {
            setDisableSubmit(false);
            alert(e);
        }
    };

    return (
        <div>
            <Modal
                isOpen={props.isOpen}
                onRequestClose={props.handleClose}
                style={customStyles}

                contentLabel="Delete Private Viewer Modal"
            >
                <div>
                    <p>Are you sure you want to remove <span style={{fontWeight: "bold"}}>{props.username}</span></p>
                    <form
                        className="form"
                        id="delete-private_viewer"
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

export default DeletePrivateViewerModal;
