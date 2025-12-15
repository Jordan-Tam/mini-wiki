import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import CreateCategoryModal from "./modals/CreateCategoryModal.jsx";
import CreatePageModal from "./modals/CreatePageModal.jsx";
import CategoryCard from "./cards/CategoryCard.jsx";
import { default as Chat } from "./Chat.tsx";

function WikiHome() {
	const { wikiUrlName } = useParams();
	const { currentUser } = useContext(AuthContext);
	const [wiki, setWiki] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
	const [showNewPageModal, setShowNewPageModal] = useState(false);
	const [chatReady, setChatReady] = useState<boolean>(false);

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

	/**
	 * Chat ready effect
	 */
	useEffect(() => {
		if (!chatReady && wiki && currentUser) {
			console.log(wiki, currentUser);
			setChatReady(true);
		}
	}, [wiki, currentUser, chatReady]);

	const handleCloseModals = () => {
		setShowNewCategoryModal(false);
		setShowNewPageModal(false);
	};

	const handleCategoryCreated = (newCategory: any) => {
		// Update wiki state with the new category
		setWiki((prev: any) => ({
			...prev,
			categories: [...prev.categories, newCategory.name || newCategory]
		}));
	};

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<div className="container-fluid">
			<h1>{wiki?.name}</h1>
			<p>{wiki?.description}</p>

			<div className="mb-3" style={{ marginTop: "2rem" }}>
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

			<div className="mb-3">
				{wiki?.categories?.map((category) => (
					<CategoryCard
						wikiUrlName={wikiUrlName}
						category={category}
						numOfPages={wiki.pages.filter((p) => p.category === category).length}
					/>
				))}
			</div>

			{/* <div style={{ marginTop: "2rem" }}>
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
								<Link to={`/${wikiUrlName}/${page._id}`}>{page.name}</Link>
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
			</div> */}

			{/* Chat */}
			{chatReady && (<Chat
				wikiId={wiki?._id}
				token={currentUser?.accessToken}
			/>)}

			{showNewCategoryModal && (
				<CreateCategoryModal
					isOpen={showNewCategoryModal}
					wikiId={wiki._id}
					handleClose={handleCloseModals}
					onCategoryCreated={handleCategoryCreated}
				/>
			)}

			{showNewPageModal && (
				<CreatePageModal
					isOpen={showNewPageModal}
					wikiId={wiki._id}
					categories={wiki?.categories}
					handleClose={handleCloseModals}
				/>
			)}
		</div>
	);
}

export default WikiHome;
