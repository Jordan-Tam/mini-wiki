import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import CreateCategoryModal from "./modals/CreateCategoryModal.jsx";
import CreatePageModal from "./modals/CreatePageModal.jsx";
import EditCategoryModal from "./modals/EditCategoryModal.jsx";
import DeleteCategoryModal from "./modals/DeleteCategoryModal.jsx";
import AddCollaboratorModal from "./modals/AddCollaboratorModal.jsx";
import DeleteCollaboratorModal from "./modals/DeleteCollaboratorModal.jsx";
import DeletePrivateViewerModal from "./modals/DeletePrivateViewerModal.jsx";
import DeleteWikiModal from "./modals/DeleteWikiModal.jsx";
import { default as AddPrivateViewerModal } from "../components/modals/addPrivateViewerModal.jsx"
import type { User, UserContext, Wiki } from "../types.js";
import { TransferOwnershipModal } from "./modals/TransferOwnershipModal.js";
import { EditWikiModal } from "./modals/EditWikiModal.js";

let key_val = 0;
function WikiHome() {
	const { wikiUrlName } = useParams();
	let currentUser = (useContext(AuthContext) as any).currentUser as UserContext;

	// Helper function to strip markdown formatting for displaying highlights
	const stripMarkdown = (text:string) => {
		if (!text) return text;

		return (
			text
				// Code blocks (must be before inline code)
				.replace(/```[\s\S]*?```/g, "")
				// Tables - remove entire table rows
				// .replace(/\|[^\n]+\|/g, '')
				// Table separators
				// .replace(/\|[\s\-:]+\|/g, '')
				// Headers
				.replace(/^#{1,6}\s+/gm, "")
				// Bold
				.replace(/\*\*([^*]+)\*\*/g, "$1")
				.replace(/__([^_]+)__/g, "$1")
				// Italic
				.replace(/\*([^*]+)\*/g, "$1")
				.replace(/_([^_]+)_/g, "$1")
				// Strikethrough
				.replace(/~~([^~]+)~~/g, "$1")
				// Links [text](url)
				.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
				// Images ![alt](url)
				.replace(/!\[([^\]]*)\]\([^\)]+\)/g, "")
				// Inline code
				.replace(/`([^`]+)`/g, "$1")
				// Blockquotes
				.replace(/^>\s+/gm, "")
				// Lists
				.replace(/^[\*\-\+]\s+/gm, "")
				.replace(/^\d+\.\s+/gm, "")
				// Horizontal rules
				.replace(/^[\-\*_]{3,}$/gm, "")
				// Clean up extra whitespace
				.replace(/\n{3,}/g, "\n\n")
				.trim()
		);
	};

	// Helper function to parse HTML highlights and return React elements
	const parseHighlight = (htmlString) => {
		if (!htmlString) return null;

		// Strip markdown first
		const cleaned = stripMarkdown(htmlString);

		// Split by <em> tags to identify highlighted portions
		const parts = cleaned.split(/(<em>|<\/em>)/);
		const elements = [];
		let isHighlighted = false;
		let key = 0;

		for (let part of parts) {
			if (part === "<em>") {
				isHighlighted = true;
			} else if (part === "</em>") {
				isHighlighted = false;
			} else if (part) {
				if (isHighlighted) {
					elements.push(
						<mark key={key++} style={{ backgroundColor: "#fff3cd" }}>
							{part}
						</mark>
					);
				} else {
					elements.push(<span key={key++}>{part}</span>);
				}
			}
		}

		return elements;
	};

	// API call
	const [wiki, setWiki] = useState<Wiki | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Modal
	const [category, setCategory] = useState(undefined);
	const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
	const [showNewPageModal, setShowNewPageModal] = useState(false);
	const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
	const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
	const [showAddCollabModal, setShowAddCollabModal] = useState(false);
	const [showEditWikiModal, setShowEditWikiModal] = useState<boolean>(false);
	const [collaborators, setCollaborators] = useState<Array<User> | null>(null);
	const [showCollaborators, setShowCollaborators] = useState(false);
	const [deleteCollaborator, setDeleteCollaborator] = useState(undefined);
	const [showDeleteCollaboratorModal, setShowDeleteCollaboratorModal] =
		useState(false);
	const [showAddPrivateViewerModal, setShowAddPrivateViewerModal] =
		useState(false);
	const [showDeletePrivateViewerModal, setShowDeletePrivateViewerModal] =
		useState(false);
	const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
	const [deletePrivateViewer, setDeletePrivateViewer] = useState(false);
	const [private_viewers, setPrivateViewers] = useState(undefined);
	const [showPVs, setShowPVs] = useState(false);
	const [showDeleteWikiModal, setShowDeleteWikiModal] = useState(false);
	const [owner, setOwner] = useState(undefined);
	// Search
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState(null);
	const [searching, setSearching] = useState(false);
	const [searchError, setSearchError] = useState(null);

	useEffect(() => {
		const fetchWiki = async () => {
			try {
				const response = await fetch(`/api/wiki/${wikiUrlName}`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});
				if (!response.ok) {
					const d = await response.json();
					throw d.error;
				}
				const data = await response.json();
				setWiki(data);
			} catch (e) {
				setError(`${e}`);
				setLoading(false);
			}
		};

		if (wikiUrlName && currentUser) fetchWiki();
	}, [wikiUrlName, currentUser]);

	useEffect(() => {
		const fetchCollaborators = async () => {
			try {
				const response = await fetch(`/api/wiki/${wiki?._id}/collaborators`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});

				const data = await response.json();

				if (!response.ok) {
					throw data.error;
				}

				//throw new Error("Failed to fetch wiki");
				console.log(`collaborators:`,data)
				setCollaborators(data);
			} catch (e) {
				setError(e);
			}
		};

		if (wiki && currentUser) {
			fetchCollaborators();
		}
	}, [wiki, currentUser]);

	useEffect(() => {
		const fetchPVs = async () => {
			try {
				const response = await fetch(`/api/wiki/${wiki?._id}/private_viewer`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});

				const data = await response.json();

				if (!response.ok) {
					throw (await response.json()).error;
				}

				setPrivateViewers(data);
			} catch (e) {
				setError(e);
			} 
		};

		if (wiki && currentUser) {
			fetchPVs();
		}
	}, [wiki, currentUser]);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(`/api/users/${wiki.owner}/profile`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});

				const data = await response.json();

				if (!response.ok) {
					throw data.error;
				}

				setOwner(data.user);
			} catch (e) {
				setError(e);
			} finally {
				setLoading(false);
			}
		};

		if (wiki && currentUser) {
			fetchUser();
		}
	}, [wiki]);

	const handleCloseModals = () => {
		setCategory(undefined);
		setShowNewCategoryModal(false);
		setShowNewPageModal(false);
		setShowEditCategoryModal(false);
		setShowDeleteCategoryModal(false);
		setShowAddCollabModal(false);
		setShowDeleteCollaboratorModal(false);
		setShowAddPrivateViewerModal(false);
		setShowDeletePrivateViewerModal(false);
		setShowDeleteWikiModal(false);
		setShowTransferModal(false);
	};

	const handleSearch = async (e) => {
		e.preventDefault();
		if (!searchTerm.trim()) {
			setSearchError("Please enter a search term");
			return;
		}

		setSearching(true);
		setSearchError(null);

		try {
			const response = await fetch(`/api/search/${wiki?._id}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + currentUser?.accessToken
				},
				body: JSON.stringify({ searchTerm: searchTerm.trim() })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to search");
			}

			const data = await response.json();
			setSearchResults(data);
		} catch (e) {
			setSearchError(e.message);
			setSearchResults(null);
		} finally {
			setSearching(false);
		}
	};

	const handleClearSearch = () => {
		setSearchTerm("");
		setSearchResults(null);
		setSearchError(null);
	};

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;
	//console.log(collaborators);
	return (
		<div className="container-fluid">
			<h1>{wiki?.name}</h1>
			<p className="text-muted">
			Created by{" "}
			<Link
				to={`/profile/${owner.firebaseUID}`}
				style={{ textDecoration: "none" }}
			>
				{owner.username}
			</Link>
			</p>

			<hr/>
			<p>{wiki?.description}</p>
			

			{/* Search Bar */}
			<div className="card mb-4">
				<div className="card-body">
					<h5 className="card-title">Search Pages in this Wiki</h5>
					<form onSubmit={handleSearch}>
						<div className="input-group mb-2">
							<input
								type="text"
								className="form-control"
								placeholder="Enter search term..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								disabled={searching}
							/>
							<button
								className="btn btn-primary"
								type="submit"
								disabled={searching}
							>
								{searching ? "Searching..." : "Search"}
							</button>
							<button
								className="btn btn-secondary"
								type="button"
								onClick={handleClearSearch}
								disabled={searching}
							>
								Clear
							</button>
						</div>
					</form>

					{searchError && (
						<div className="alert alert-danger" role="alert">
							{searchError}
						</div>
					)}

					{searchResults && (
						<div className="mt-3">
							<h6>Search Results ({searchResults.totalResults} found)</h6>
							{searchResults.totalResults === 0 ? (
								<p className="text-muted">
									No pages found matching "{searchResults.searchTerm}"
								</p>
							) : (
								<div className="list-group">
									{searchResults.results.map((result) => (
										<Link
											key={result.pageId}
											to={`/${wikiUrlName}/${result.pageUrlName}`}
											className="list-group-item list-group-item-action"
										>
											<div className="d-flex w-100 justify-content-between">
												<h6 className="mb-1">
													{result.highlights?.pageTitle ? (
														<>
															{parseHighlight(result.highlights.pageTitle[0])}
														</>
													) : (
														result.pageTitle
													)}
												</h6>
												<small className="text-muted">
													Score: {result.score.toFixed(2)}
												</small>
											</div>
											<p className="mb-1">
												<strong>Category:</strong> {result.category}
											</p>
											{result.highlights?.content && (
												<small className="text-muted">
													<div>
														{result.highlights.content.map((snippet, idx) => (
															<span key={idx}>
																{parseHighlight(snippet)}
																{idx < result.highlights.content.length - 1 &&
																	" ... "}
															</span>
														))}
													</div>
												</small>
											)}
										</Link>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="mt-3 mb-3">
				{(wiki?.access === "private" || wiki?.access === "public-view") && (
					<>
						<button
							className="btn btn-success me-3"
							onClick={() => setShowAddCollabModal(true)}
						>
							Add a collaborator
						</button>
						{!showCollaborators && (
							<button
								className="btn btn-info me-3"
								onClick={() => setShowCollaborators(true)}
							>
								View Collaborators
							</button>
						)}
						{showCollaborators && (
							<>
								<button
									className="btn btn-success me-3"
									onClick={() => setShowCollaborators(false)}
								>
									Hide Collaborators
								</button>
								<ul className="list-group mt-2 p-3">
									{collaborators && collaborators.length === 0 && (
										<li className="list-group-item text-muted">
											This wiki currently has no collaborators!
										</li>
									)}

									{collaborators?.map((user) => (
										<>
											<li
												key={user.username}
												className="list-group-item d-flex justify-content-between align-items-center"
											>
												<Link to={`/profile/${user.firebaseUID}`} style={{ textDecoration: "none" }}>
													{user.username}
												</Link>
												<button
													className="btn btn-danger btn-sm"
													onClick={() => {
														setDeleteCollaborator(user.username);
														setShowDeleteCollaboratorModal(true);
													}}
												>
													Remove Collaborator
												</button>
											</li>
										</>
									))}
								</ul>
							</>
						)}
					</>
				)}
				{wiki.access === "private" && (
					<>
						<button
							className="btn btn-success me-3"
							onClick={() => setShowAddPrivateViewerModal(true)}
						>
							Add Private Viewer
						</button>
						{!showPVs && (
							<>
							<button
								className="btn btn-info me-3"
								onClick={() => setShowPVs(true)}
							>
								View Private Viewers
							</button>
							<br/>
							<br/>
							</>
						)}

						{showPVs && (
							<>
								<button
									className="btn btn-success me-3"
									onClick={() => setShowPVs(false)}
								>
									Hide Private Viewers
								</button>
								<ul className="list-group mt-2 p-3">
									{private_viewers && private_viewers.length === 0 && (
										<li className="list-group-item text-muted">
											This wiki currently has no Private Viewers!
										</li>
									)}

									{private_viewers?.map((user) => (
										<>
											<li
												key={user.username}
												className="list-group-item d-flex justify-content-between align-items-center"
											>
												<Link to={`/profile/${user.firebaseUID}`} style={{ textDecoration: "none" }}>
													{user.username}
												</Link>
												<button
													className="btn btn-danger btn-sm"
													onClick={() => {
														setDeletePrivateViewer(user.username);
														setShowDeletePrivateViewerModal(true);
													}}
												>
													Remove from Private Viewers
												</button>
											</li>
										</>

									))}
								</ul>
							</>
						)}

					</>
				)}
				<button className="btn btn-warning me-3"
					onClick={() => {setShowEditWikiModal(true)}}
				>Edit Wiki</button>
				<button
					className="btn btn-secondary me-3"
					onClick={() => setShowNewCategoryModal(true)}
				>
					+ New Category
				</button>
				<button
					className="btn btn-secondary me-3"
					onClick={() => setShowNewPageModal(true)}
				>
					+ New Page
				</button>
				<button
					className="btn btn-secondary me-3"
					onClick={() => {window.location.href += "/chat"}}
				>
					💬 Chat
				</button>
			</div>
						
			<div className="mb-3">
				{wiki?.categories?.map((category, index) => (
					<div className="card mb-3" key={key_val++}>
						<div className="card-body" key={key_val++}>
							<Link
								to={`/${wikiUrlName}/category/${wiki.categories_slugified[index]}`}
								style={{ textDecoration: "none" }}
							>
								<h3 className="card-title">{category}</h3>
							</Link>
							<p>
								<span style={{ fontWeight: "bold" }}>Number of Pages:</span>{" "}
								{wiki.pages.filter((p) => p.category === category).length}
							</p>
							{category !== "UNCATEGORIZED" && (
								<>
									<button
										className="btn btn-warning me-3"
										onClick={() => {
											setCategory(category);
											setShowEditCategoryModal(true);
										}}
									>
										Edit
									</button>
									<button
										className="btn btn-danger"
										onClick={() => {
											setCategory(category);
											setShowDeleteCategoryModal(true);
										}}
									>
										Delete
									</button>
								</>
							)}
						</div>
					</div>
				))}
			</div>

			{wiki.owner === currentUser.uid && (
					<button
						className="btn btn-danger me-3"
						onClick={() => setShowTransferModal(true)}
					>
						↔ Transfer Ownership
					</button>
				)}

				{wiki.owner === currentUser.uid &&
				<button 
				className="btn btn-danger me-3"
				onClick={() => setShowDeleteWikiModal(true)}
				>
					Delete Wiki
				</button>}

			{showNewCategoryModal && (
				<CreateCategoryModal
					isOpen={showNewCategoryModal}
					wikiId={wiki._id}
					handleClose={handleCloseModals}
					setWiki={setWiki}
				/>
			)}

			{showNewPageModal && (
				<CreatePageModal
					isOpen={showNewPageModal}
					wikiId={wiki._id}
					wikiUrlName={wiki.urlName}
					categories={wiki?.categories}
					handleClose={handleCloseModals}
				/>
			)}

			{showEditCategoryModal && (
				<EditCategoryModal
					isOpen={showEditCategoryModal}
					wikiId={wiki._id}
					oldCategoryName={category}
					setWiki={setWiki}
					handleClose={handleCloseModals}
				/>
			)}

			{showDeleteCategoryModal && (
				<DeleteCategoryModal
					isOpen={showDeleteCategoryModal}
					wikiId={wiki._id}
					categoryName={category}
					setWiki={setWiki}
					handleClose={handleCloseModals}
				/>
			)}

			{showAddCollabModal && (
				<AddCollaboratorModal
					isOpen={showAddCollabModal}
					wikiId={wiki._id}
					handleClose={handleCloseModals}
					setWiki={setWiki}
				/>
			)}

			{showDeleteCollaboratorModal && (
				<DeleteCollaboratorModal
					isOpen={showDeleteCollaboratorModal}
					handleClose={handleCloseModals}
					username={deleteCollaborator}
					setWiki={setWiki}
					wikiId={wiki._id}
				/>
			)}

			{showAddPrivateViewerModal && (
				<AddPrivateViewerModal
					isOpen={showAddPrivateViewerModal}
					wikiId={wiki._id}
					handleClose={handleCloseModals}
					setWiki={setWiki}
				/>
			)}

			{showDeletePrivateViewerModal && (
				<DeletePrivateViewerModal
					isOpen={showDeletePrivateViewerModal}
					handleClose={handleCloseModals}
					username={deletePrivateViewer}
					setWiki={setWiki}
					wikiId={wiki._id}
				/>
			)}
			{showDeleteWikiModal && (
				<DeleteWikiModal
					isOpen={showDeleteWikiModal}
					handleClose={handleCloseModals}
					wikiId={wiki._id}
				/>
			)}

			{(showTransferModal && wiki && collaborators) && (
				<TransferOwnershipModal 
					isOpen={showTransferModal}
					onClose={handleCloseModals}
					collaborators={collaborators}
					wiki={wiki}
					onSubmit={() => {
						console.log("wywywywywyw");
					}}
				/>
			)};

			{(showEditWikiModal && wiki) && (
				<EditWikiModal
					isOpen={showEditWikiModal}
					onClose={() => {
						handleCloseModals();
						setShowEditWikiModal(false);
					}}
					wiki={wiki}
					onSubmit={async (response) => {
						// form response, already validated
						const res = await fetch(`/api/wiki/${wiki.urlName}`, {
							method: "PATCH",
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${currentUser.accessToken}`
							},
							body: JSON.stringify({
								name: response.name,
								description: response.description
							})
						});

						const res_json = await res.json();

						if(!res.ok || res.status !== 200) {
							alert(`Failed to update wiki: ${res_json.error}`);
							return;
						}

						window.location.reload();
					}}
				/>
			)}
		</div>
	);
}

export default WikiHome;
