import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import CreateWikiModal from "./modals/CreateWikiModal.jsx";

function Home() {

	const {currentUser} = useContext(AuthContext);

	// Auth
	const [token, setToken] = useState(
		currentUser ? currentUser.accessToken : ""
	);

	// Fetch
	const [loading, setLoading] = useState(true);
	const [wikisData, setWikisData] = useState(undefined);

	// Modal
	const [showCreateWikiModal, setShowCreateWikiModal] = useState(false);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetch("/api/wiki", {
					method: "GET",
					headers: {
						Authorization: "Bearer " + token
					}
				});
				const result = await response.json();
				setWikisData(result.wikis);
				setLoading(false);
				console.log(result);
			} catch (e) {
				console.log(e);
				setLoading(false);
				return;
			}
		}
		fetchData();
	}, []);

	const handleOpenCreateWikiModal = () => {
		setShowCreateWikiModal(true);
	};

	const handleCloseModals = () => {
		setShowCreateWikiModal(false);
	}

	if (!currentUser) {
		return <Navigate to="/signin" />;
	}

	if (loading) {
		return (
			<div className="container-fluid">
				<h1>Loading...</h1>
			</div>
		);
	} else if (!wikisData) {
		return (
			<div className="container-fluid">
				<h1>Error</h1>
			</div>
		);
	} else {
		return (
			<div className="container-fluid">
				<button className="btn btn-secondary mb-3" onClick={handleOpenCreateWikiModal}>Create Wiki</button>
				{wikisData && wikisData.map((wiki) => {
					return (
					<div className="card mb-3">
						<div className="card-body">
							<h3 className="card-title">
								{wiki.name}
							</h3>
							<p className="card-text">
								{wiki.description}
							</p>
						</div>
					</div>
					);
				})}
                {showCreateWikiModal && (
                    <CreateWikiModal
                        isOpen={showCreateWikiModal}
                        handleClose={handleCloseModals}
						setWikisData={setWikisData}
                    />
                )}
			</div>
		)
	}
}

export default Home;
