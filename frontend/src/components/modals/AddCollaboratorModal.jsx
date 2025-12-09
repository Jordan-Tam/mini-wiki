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

function AddCollaboratorModal({ isOpen, handleClose, wikiId }) {
    const { currentUser } = useContext(AuthContext);

    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [disableSubmit, setDisableSubmit] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setDisableSubmit(true);
        setError("");
        setSuccess(false);

        try {
            const response = await fetch(`/api/wiki/${wikiId}/collaborator`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + currentUser.accessToken
                },
                body: JSON.stringify({ username: username })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to add collaborator.");
                setDisableSubmit(false);
                return;
            }

            setSuccess(true);

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
            contentLabel="Add Collaborator Modal"
        >
            <h2>Add Collaborator</h2>

            <form onSubmit={handleSubmit}>
                <label>User you want to grant collaboration access</label>
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
                    <p style={{ color: "green" }}>Collaborator added!</p>
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

export default AddCollaboratorModal;
