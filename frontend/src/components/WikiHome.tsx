import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import CreateCategoryModal from "./modals/CreateCategoryModal.jsx";
import CreatePageModal from "./modals/CreatePageModal.jsx";
import EditCategoryModal from "./modals/EditCategoryModal.jsx";
import DeleteCategoryModal from "./modals/DeleteCategoryModal.jsx";
import AddCollaboratorModal from "./modals/AddCollaboratorModal.jsx";
import DeleteCollaboratorModal from "./modals/DeleteCollaboratorModal.jsx"
import DeletePrivateViewerModal from "./modals/DeletePrivateViewerModal.jsx";
import AddPrivateViewerModal from "./modals/AddPrivateViewerModal.jsx"

let key_val = 0;
function WikiHome() {

	const { wikiUrlName } = useParams();
	const { currentUser } = useContext(AuthContext);

	// API call
	const [wiki, setWiki] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Modal
	const [category, setCategory] = useState(undefined);
	const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
	const [showNewPageModal, setShowNewPageModal] = useState(false);
	const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
	const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
	const [showAddCollabModal, setShowAddCollabModal] = useState(false);
	const [collaborators, setCollaborators] = useState(undefined);
	const [showCollaborators, setShowCollaborators] = useState(false)
	const [deleteCollaborator, setDeleteCollaborator] = useState(undefined);
	const [showDeleteCollaboratorModal, setShowDeleteCollaboratorModal] = useState(false)
	const [showAddPrivateViewerModal, setShowAddPrivateViewerModal] = useState(false);
	const [showDeletePrivateViewerModal, setShowDeletePrivateViewerModal] = useState(false);
	const [deletePrivateViewer, setDeletePrivateViewer] = useState(false);
	const [private_viewers, setPrivateViewers] = useState(undefined);
	const [showPVs, setShowPVs] = useState(false);

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
					throw (await response.json()).error;
				}
				const data = await response.json();
				setWiki(data);
			} catch (e) {
				setError(`${e}`);
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
					throw (await response.json()).error;
				}

				//throw new Error("Failed to fetch wiki");
				setCollaborators(data);

			} catch (e) {
				setError(e);
			} finally {
				setLoading(false);
			}
		}

		if (wiki && currentUser) {
			fetchCollaborators();
		}
		
	}, [wiki, currentUser])


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
			} finally {
				setLoading(false);
			}
		}

		if (wiki && currentUser) {
			fetchPVs();
		}
		
	}, [wiki, currentUser])

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
	};

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;
	//console.log(collaborators);
	return (
		<div className="container-fluid">
			<h1>{wiki?.name}</h1>
			<p>{wiki?.description}</p>
			<div className="mt-3 mb-3">
				{(wiki?.access === "private" || wiki?.access === "public-view") && 
					<>
						<button className="btn btn-success me-3" onClick={() => setShowAddCollabModal(true)} >Add a collaborator</button>
						{!showCollaborators && 
							<button className="btn btn-success me-3" onClick={() => setShowCollaborators(true)}>View Collaborators</button>
						}
						{showCollaborators && (
							<>
							<button className="btn btn-success ms-3" onClick={() => setShowCollaborators(false)}>Hide Collaborators</button>
							<ul className="list-group mt-2">
							{collaborators && collaborators.length === 0 && (
								<li className="list-group-item text-muted">
									This wiki currently has no collaborators!s
								</li>
							)}
								
								{collaborators?.map((username) => (
									<>
										<li key={username} className="list-group-item d-flex justify-content-between align-items-center">
											<p>{username}</p>
											<button
												className="btn btn-danger btn-sm"
												onClick={() => {
													setDeleteCollaborator(username);
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
				}
				{wiki.access === "private" && 
				<>
					<button className="btn btn-success me-3" onClick={() => setShowAddPrivateViewerModal(true)}> 
						Add Private Viewer
					</button>
					{!showPVs && 
							<button className="btn btn-success me-3" onClick={() => setShowPVs(true)}>View Private Viewers</button>
						}
						{showPVs && (
							<>
							<button className="btn btn-success ms-3" onClick={() => setShowPVs(false)}>Hide Private Viewers</button>
							<ul className="list-group mt-2">
							{private_viewers && private_viewers.length === 0 && (
								<li className="list-group-item text-muted">
									This wiki currently has no Private Viewers!
								</li>
							)}
								
								{private_viewers?.map((username) => (
									<>
										<li key={username} className="list-group-item d-flex justify-content-between align-items-center">
											<p>{username}</p>
											<button
												className="btn btn-danger btn-sm"
												onClick={() => {
													setDeletePrivateViewer(username);
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
				}
				<button className="btn btn-warning me-3">Edit Wiki</button>
				<button className="btn btn-secondary me-3" onClick={() => setShowNewCategoryModal(true)}>
					+ New Category
				</button>
				<button
					className="btn btn-secondary me-3"
					onClick={() => setShowNewPageModal(true)}
				>
					+ New Page
				</button>
			</div>

			<div className="mb-3">
				{wiki?.categories?.map((category, index) => (
					<div className="card mb-3" key={key_val++}>
						<div className="card-body" key={key_val++}>
							<Link
								to={`/${wikiUrlName}/category/${wiki.categories_slugified[index]}`}
								style={{textDecoration: "none"}}
							>
								<h3 className="card-title">{category}</h3>
							</Link>
							<p>
								<span style={{fontWeight: "bold"}}>Number of Pages:</span> {wiki.pages.filter((p) => p.category === category).length}
							</p>
							{category !== "UNCATEGORIZED" && (
								<>
									<button
										className="btn btn-warning me-3"
										onClick={() => {
											setCategory(category);
											setShowEditCategoryModal(true);
										}}
									>Edit</button>
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

		</div>
	);
}

export default WikiHome;
