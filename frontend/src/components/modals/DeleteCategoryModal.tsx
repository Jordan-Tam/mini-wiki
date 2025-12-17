import { useContext, useState } from "react";
import { AuthContext, type FbUserContext, type FbUserContextMaybe } from "../../context/AuthContext.jsx";
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

function DeleteCategoryModal(props) {

    // Auth
    const { currentUser } = useContext(AuthContext) as FbUserContext;

    // Form stuff
    const [categoryName, setCategoryName] = useState(props.categoryName);
    const [error, setError] = useState("");
    const [disableSubmit, setDisableSubmit] = useState(false);

    // Submit form function
    const submitForm = async (e) => {

        e.preventDefault();

        try {
            setDisableSubmit(true);
            let response = await fetch(`/api/wiki/${props.wikiId}/categories`, {
                method: "DELETE",
                headers: {
                    Authorization: "Bearer " + currentUser.accessToken,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    categoryName: props.categoryName
                })
            });

            if (!response.ok) {
                setDisableSubmit(false);
                throw (await response.json()).error;
            }

            // Success - update parent wiki state
            const result = await response.json();
            props.setWiki(result);
            setCategoryName("");
            setError("");
            alert("Category successfully deleted!");
            props.handleClose();

        } catch (e) {
            setDisableSubmit(false);
            console.log(e);
            setError(`${e}`);
        }
    };

    return (
        <div>
            <Modal
                isOpen={props.isOpen}
                onRequestClose={props.handleClose}
                style={customStyles}
                contentLabel="Delete Category Modal"
            >
                <div>
                    <p>Are you sure you want to delete <span style={{fontWeight: "bold"}}>{props.categoryName}</span></p>
                    <form
                        className="form"
                        id="delete-category"
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

export default DeleteCategoryModal;
