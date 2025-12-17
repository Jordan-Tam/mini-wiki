import { useContext, useState } from "react";
import { AuthContext, type FbUserContext } from "../../context/AuthContext.jsx";
import Modal from "react-modal";
import type { WikiModalParams } from "../../types.js";

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

function AddPrivateViewerModal({ isOpen, handleClose, setWiki, wikiId }: WikiModalParams) {
    const { currentUser } = useContext(AuthContext) as FbUserContext;

    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [disableSubmit, setDisableSubmit] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        setDisableSubmit(true);
        setError("");
        setSuccess(false);

        try {
            const response = await fetch(`/api/wiki/${wikiId}/private_viewer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + currentUser.accessToken
                },
                body: JSON.stringify({ username: username })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to add private viewer.");
                setDisableSubmit(false);
                return;
            }

            setSuccess(true);
            setWiki(data);
            handleClose();
            alert("Private Viewer successfully added!")
        } catch (err) {
            setError("Server error.");
        } finally {
            setDisableSubmit(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            style={customStyles}
            contentLabel="Add Private Viewer Modal"
        >
            <h2>Add Private Viewer</h2>

            <form onSubmit={handleSubmit}>
                <label>User to grant private viewer status</label>
                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                {error && (
                    <p style={{ color: "red" }}>{error}</p>
                )}

                {success && (
                    <p style={{ color: "green" }}>Private Viewer added!</p>
                )}

                <button
                    type="submit"
                    className="btn btn-success me-3"
                    disabled={disableSubmit}
                >
                    Add
                </button>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                >
                    Cancel
                </button>
            </form>
        </Modal>
    );
}

export default AddPrivateViewerModal;
