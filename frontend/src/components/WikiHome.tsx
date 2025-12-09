import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import CreateCategoryModal from "./modals/CreateCategoryModal.jsx";
import CreatePageModal from "./modals/CreatePageModal.jsx";
import EditCategoryModal from "./modals/EditCategoryModal.jsx";
import CategoryCard from "./cards/CategoryCard.jsx";

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
				//throw new Error("Failed to fetch wiki");
				const data = await response.json();
				setWiki(data);
			} catch (e: any) {
				setError(e);
			} finally {
				setLoading(false);
			}
		};

		if (wikiUrlName && currentUser) fetchWiki();
	}, [wikiUrlName, currentUser]);

	const handleCloseModals = () => {
		setCategory(undefined);
		setShowNewCategoryModal(false);
		setShowNewPageModal(false);
		setShowEditCategoryModal(false);
		setShowDeleteCategoryModal(false);
	};

	/* const handleCategoryCreated = (newCategory: any) => {
		// Update wiki state with the new category
		setWiki((prev: any) => ({
			...prev,
			categories: [...prev.categories, newCategory.name || newCategory]
		}));
	}; */

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<div className="container-fluid">
			<h1>{wiki?.name}</h1>
			<p>{wiki?.description}</p>
			<div className="mt-3 mb-3">
				<button className="btn btn-secondary" onClick={() => setShowNewCategoryModal(true)}>
					+ New Category
				</button>
				<button
					className="btn btn-secondary"
					onClick={() => setShowNewPageModal(true)}
					style={{ marginLeft: "1rem" }}
				>
					+ New Page
				</button>
			</div>

			<div className="mb-3">
				{wiki?.categories?.map((category) => (
					<div className="card mb-3">
						<div className="card-body">
							<Link
								to={`/${wikiUrlName}/category/${category}`}
								style={{textDecoration: "none"}}
							>
								<h3 className="card-title">{category}</h3>
							</Link>
							<p>
								<span style={{fontWeight: "bold"}}>Number of Pages:</span> {wiki.pages.filter((p) => p.category === category).length}
							</p>
							<button
								className="btn btn-warning me-3"
								onClick={() => {
									setCategory(category);
									setShowEditCategoryModal(true);
								}}
							>Edit</button>
							<button
								className="btn btn-danger"
								onClick={() => setShowDeleteCategoryModal(true)}
							>Delete</button>
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
					category={category}
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

		</div>
	);
}

export default WikiHome;
