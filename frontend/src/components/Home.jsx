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
	const [data, setData] = useState(true);

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
				setData(result);
				setLoading(false);
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
			<h1>Loading...</h1>
		);
	} else if (!data) {
		return (
			<h1>Error</h1>
		);
	} else {
		return (
			<div className="container-fluid">
				<button onClick={handleOpenCreateWikiModal}>Create Wiki</button>
				{data.wikis && data.wikis.map((wiki) => {
					return (
					<div className="col">
						<div className="card">
						<p className="card-title">
							{wiki.name}
						</p>
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
                    />
                )}
			</div>
		)
	}

  /* return (
    <>
      <p>Welcome to Mini Wiki, {currentUser.displayName}!</p>
      <p>
        ik theres a bug with the display name not loading when you first sign up
        with email... working on it - Owen
      </p>
    </>
  ); */
}

export default Home;
