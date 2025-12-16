import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
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

function EditCategoryModal(props) {

    // Auth
    const { currentUser } = useContext(AuthContext);

    // Form stuff
    const [categoryName, setCategoryName] = useState(props.oldCategoryName);
    const [error, setError] = useState("");
    const [disableSubmit, setDisableSubmit] = useState(false);

    // Submit form function
    const submitForm = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!categoryName.trim()) {
            setError("Category name cannot be empty");
            return;
        }

        try {
            setDisableSubmit(true);
            let response = await fetch(`/api/wiki/${props.wikiId}/categories`, {
                method: "PATCH",
                headers: {
                    Authorization: "Bearer " + currentUser.accessToken,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    oldCategoryName: props.oldCategoryName,
                    newCategoryName: categoryName.trim()
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
            alert("Category edited successfully!");
            props.handleClose();

        } catch (e) {
            console.log(e);
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
                contentLabel="Create Category Modal"
            >
                <div
                    className="row mb-3"
                    style={{ display: "flex", justifyContent: "space-between" }}
                >
                    <div
                        className="col"
                        style={{ display: "flex", justifyContent: "space-between" }}
                    >
                        <h5 style={{ display: "inline" }}>Edit Category</h5>
                        <button
                            className="btn btn-secondary"
                            onClick={props.handleClose}
                            style={{ display: "inline", fontWeight: "bold" }}
                        >
                            X
                        </button>
                    </div>
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form onSubmit={(e) => submitForm(e)}>
                    <div className="form-floating mb-3">
                        <input
                            className="form-control"
                            placeholder="category name"
                            type="text"
                            id="categoryName"
                            name="categoryName"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            disabled={disableSubmit}
                            required
                        />
                        <label htmlFor="categoryName">Category Name</label>
                    </div>
                    <button
                        className="btn btn-primary mt-3"
                        type="submit"
                        disabled={disableSubmit}
                    >
                        Create Category
                    </button>
                </form>
            </Modal>
        </div>
    );
}

export default EditCategoryModal;
