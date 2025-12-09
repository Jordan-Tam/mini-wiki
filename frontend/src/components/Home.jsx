import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import WikiCard from "./cards/WikiCard.jsx";
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
	const [favorites, setFavorites] = useState([]);
	const [collaborator, setCollaborator] = useState([]);

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

				const favoriteResponse = await fetch(`/api/users/favorites`, {
					method: "GET",
					headers: { Authorization: "Bearer " + token }
				});
	
				const favoriteResult = await favoriteResponse.json();
				
				//console.log(favoriteResult)

				setFavorites(favoriteResult);

				const collaboratorResponse = await fetch(`/api/users/${currentUser._id}/collaborator`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + token
					}
				});
				const cResult = await collaboratorResponse.json();

				setCollaborator(cResult);

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
			<div className="container-fluid">
				<div className="row">
					<div className="ms-3 col-2">
						<div id="list-example" className="list-group sticky-top" style={{top: "77px", zIndex: 99}}>
						<a className="list-group-item list-group-item-action" href="#favorited">Favorited</a>
						<a className="list-group-item list-group-item-action" href="#owner">Owner</a>
						<a className="list-group-item list-group-item-action" href="#collaborator">Collaborator</a>
						<a className="list-group-item list-group-item-action" href="#viewer">Viewer</a>
						</div>
					</div>
					<div className="col-8">
						<div data-bs-spy="scroll" data-bs-target="#list-example" data-bs-smooth-scroll="true" className="scrollspy-example" tabIndex="0">
							<h4 id="favorited">FAVORITES</h4>
							{favorites && favorites.length > 0 ? (
								favorites.map((wiki) => (
									<WikiCard wiki={wiki}/>
								))
							) : (
								<>
									<p>No favorited wikis yet.
										<Link to="/browse" 
											style={{ marginLeft: "5px" }}>
											Find some!
										</Link> 
									</p>
								</>
							)}

							<h4 id="owner">OWNER</h4>
							<p className="small text-muted">Public and private wikis you have ownership of.</p>
							{wikisData && wikisData.map((wiki) => <WikiCard wiki={wiki} />)}
							<h4 id="collaborator">COLLABORATOR </h4>
							<p className="small text-muted">Public and private wikis where you aren't the owner but have been granted exclusive editing permissions.</p>
							<p className="small text-muted">Does not include public wikis where editing is available to all users.</p>
							{collaborator && collaborator.length > 0 ? (
								collaborator.map((wiki) => (
									<WikiCard wiki={wiki}/>
								))
							) : (
								<>
									<p>No wikis with colloboration access yet.
										<Link to="/browse" 
											style={{ marginLeft: "5px" }}>
											Find some!
										</Link> 
									</p>
								</>
							)}
							<h4 id="viewer">PRIVATE VIEWER</h4>
							<p className="small text-muted">Private wikis where you aren't the owner but have been granted view-only permissions.</p>
							<p>...</p>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default Home;