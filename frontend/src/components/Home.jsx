import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import CreateWikiModal from "./modals/CreateWikiModal.jsx";

function Home() {

	// Auth
	const {currentUser} = useContext(AuthContext);
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
			} catch (e) {
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
			<>
			<div class="row">
				<div class="ms-3 col-3">
					<div id="list-example" class="list-group">
					<a class="list-group-item list-group-item-action" href="#favorited">Favorited</a>
					<a class="list-group-item list-group-item-action" href="#owned">Owned</a>
					<a class="list-group-item list-group-item-action" href="#collaborator">Collaborator</a>
					<a class="list-group-item list-group-item-action" href="#viewer">Viewer</a>
					<a class="list-group-item list-group-item-action" href="#following">Following</a>
					</div>
				</div>
				<div class="col-8">
					<div data-bs-spy="scroll" data-bs-target="#list-example" data-bs-smooth-scroll="true" class="scrollspy-example" tabIndex="0" sdsd="s">
						<h4 id="favorited">FAVORITED</h4>
						<p>...</p>
						<h4 id="owner">OWNER</h4>
						{wikisData && wikisData.map((wiki) => {
							return (
								<Link to={`/wiki/${wiki._id}`} style={{textDecoration: "none"}}>
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
								</Link>
							);
						})}
						<h4 id="collaborator">COLLABORATOR</h4>
						<p>...</p>
						<h4 id="viewer">PRIVATE VIEWER</h4>
						<p>...</p>
						<h4 id="following">FOLLOWING</h4>
						<p>...</p>
					</div>
				</div>
			</div>
			<div className="container-fluid">
				<button className="btn btn-secondary mb-3" onClick={handleOpenCreateWikiModal}>Create Wiki</button>
				{wikisData && wikisData.map((wiki) => {
					return (
						<Link to={`/wiki/${wiki._id}`} style={{textDecoration: "none"}}>
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
						</Link>
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
			</>
		)
	}
}

export default Home;