import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import CreateCategoryModal from "./modals/CreateCategoryModal.jsx";
import CreatePageModal from "./modals/CreatePageModal.jsx";

function WikiHome() {
	const { wikiId } = useParams();
	const { currentUser } = useContext(AuthContext);
	const [wiki, setWiki] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
	const [showNewPageModal, setShowNewPageModal] = useState(false);

	useEffect(() => {
		const fetchWiki = async () => {
			try {
				const response = await fetch(`/api/wiki/${wikiId}`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});
				if (!response.ok) throw new Error("Failed to fetch wiki");
				const data = await response.json();
				setWiki(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		if (wikiId && currentUser) fetchWiki();
	}, [wikiId, currentUser]);

	const handleCloseModals = () => {
		setShowNewCategoryModal(false);
		setShowNewPageModal(false);
	};

	const handleCategoryCreated = (newCategory) => {
		// Update wiki state with the new category
		setWiki((prev) => ({
			...prev,
			categories: [...prev.categories, newCategory.name || newCategory]
		}));
	};

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<div>
			<h1>{wiki?.name}</h1>
			<p>{wiki?.description}</p>

			<div style={{ marginTop: "2rem" }}>
				<button onClick={() => setShowNewCategoryModal(true)}>
					+ New Category
				</button>
				<button
					onClick={() => setShowNewPageModal(true)}
					style={{ marginLeft: "1rem" }}
				>
					+ New Page
				</button>
			</div>

			<div style={{ marginTop: "2rem" }}>
				<h2>Categories</h2>
				<ul>
					{wiki?.categories?.map((category) => (
						<li key={category}>{category}</li>
					))}
				</ul>
			</div>

			<div style={{ marginTop: "2rem" }}>
				<h2>Pages</h2>
				{wiki?.pages && wiki.pages.length > 0 ? (
					<ul>
						{wiki.pages.map((page) => (
							<li key={page._id}>
								<Link to={`/wiki/${wikiId}/${page._id}`}>{page.name}</Link>
								<span
									style={{
										marginLeft: "1rem",
										fontSize: "0.9em",
										color: "#666"
									}}
								>
									({page.category})
								</span>
							</li>
						))}
					</ul>
				) : (
					<p>No pages yet. Create one to get started!</p>
				)}
			</div>

			{showNewCategoryModal && (
				<CreateCategoryModal
					isOpen={showNewCategoryModal}
					wikiId={wikiId}
					handleClose={handleCloseModals}
					onCategoryCreated={handleCategoryCreated}
				/>
			)}

			{showNewPageModal && (
				<CreatePageModal
					isOpen={showNewPageModal}
					wikiId={wikiId}
					categories={wiki?.categories}
					handleClose={handleCloseModals}
				/>
			)}
		</div>
	);
}

export default WikiHome;
