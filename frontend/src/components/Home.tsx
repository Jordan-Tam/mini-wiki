import { useState, useContext, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthContext, type FbUserContext, type FbUserContextMaybe } from "../context/AuthContext.jsx";
import WikiCard from "./cards/WikiCard.tsx";
import type { WikisResponse } from "../types.ts";

function Home() {

	// Auth
	const {currentUser} = useContext(AuthContext) as FbUserContext;

	const [token, setToken] = useState(
		currentUser ? currentUser.accessToken : ""
	);

	// Fetch
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | undefined>(undefined);
	const [wikisData, setWikisData] = useState<WikisResponse | undefined>(undefined);

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
				setWikisData(result);
				setLoading(false);
			} catch (e) {
				console.log(e);
				setLoading(false);
				setError(`${e}`)
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
				<h1>{error}</h1>
			</div>
		);
	} else {
		return (
			<div className="container-fluid">
				<div className="p-3 mb-3 bg-primary-subtle">
				<h4 id="owner">OWNER</h4>
				<p className="small text-muted">Public and private wikis you have ownership of.</p>
				{
					(wikisData && wikisData.OWNER)
					&&
					(
						wikisData.OWNER.length === 0
						?
						<p>You don't own any wikis. <Link to="/create">Click here to create one.</Link></p>
						:
						wikisData.OWNER.map((wiki) => <WikiCard key={wiki.urlName} wiki={wiki} />)
					)	
				}
				</div>
				<div className="p-3 mb-3 bg-danger-subtle">
				<h4 id="collaborator">COLLABORATOR </h4>
				<p className="small text-muted">Public and private wikis where you aren't the owner but have been granted exclusive editing permissions.</p>
				<p className="small text-muted">Does not include public wikis where editing is available to all users.</p>
				{
					(wikisData && wikisData.COLLABORATOR)
					&&
					(
						wikisData.COLLABORATOR.length === 0
						?
						<p>You are not a collaborator for any wikis.</p>
						:
						wikisData.COLLABORATOR.map((wiki) => <WikiCard key={wiki.urlName} wiki={wiki} />)
					)
				}
				</div>
				<div className="p-3 bg-warning-subtle">
				<h4 id="viewer">PRIVATE VIEWER</h4>
				<p className="small text-muted">Private wikis where you aren't the owner but have been granted view-only permissions.</p>
				{
					(wikisData && wikisData.PRIVATE_VIEWER)
					&&
					(
						wikisData.PRIVATE_VIEWER.length === 0
						?
						<p>You are not a private viewer for any wikis.</p>
						:
						wikisData.PRIVATE_VIEWER.map((wiki) => <WikiCard key={wiki.urlName} wiki={wiki} />)
					)	
				}
				</div>
			</div>
		)
	}
}

export default Home;