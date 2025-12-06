import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import CreateWikiModal from "./modals/CreateWikiModal.jsx";

function CreateWiki() {

	// Auth
	const {currentUser} = useContext(AuthContext);
	const [token, setToken] = useState(
		currentUser ? currentUser.accessToken : ""
	);

	// Modal
	const [showCreateWikiModal, setShowCreateWikiModal] = useState(false);

	const handleOpenCreateWikiModal = () => {
		setShowCreateWikiModal(true);
	};

	const handleCloseModals = () => {
		setShowCreateWikiModal(false);
	}

	if (!currentUser) {
		return <Navigate to="/signin" />;
	}

    return (
        <div className="container-fluid">
            <button className="btn btn-secondary mb-3" onClick={handleOpenCreateWikiModal}>Create Wiki</button>
        {showCreateWikiModal && (
            <CreateWikiModal
                isOpen={showCreateWikiModal}
                handleClose={handleCloseModals}
            />
        )}
        </div>
    )

}

export default CreateWiki;