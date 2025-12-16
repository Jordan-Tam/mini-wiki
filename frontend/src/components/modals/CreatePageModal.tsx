import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, type FbUserContextWrapper } from "../../context/AuthContext.jsx";
import Modal from "react-modal";

Modal.setAppElement("#root");

const customStyles = {
	content: {
		top: "50%",
		left: "50%",
		right: "auto",
		bottom: "auto",
		marginRight: "-50%",
		transform: "translate(-50%, -50%)",
		width: "50%",
		border: "1px solid #28547a",
		borderRadius: "4px"
	}
};

function CreatePageModal(props) {
	// Auth
	const { currentUser } = useContext(AuthContext) as FbUserContextWrapper;
	const navigate = useNavigate();

	// Form stuff
	const [pageName, setPageName] = useState("");
	const [selectedCategory, setSelectedCategory] = useState(
		props.categories && props.categories.length > 0
			? props.categories[0]
			: "UNCATEGORIZED"
	);
	const [error, setError] = useState("");
	const [disableSubmit, setDisableSubmit] = useState(false);

	// Submit form function
	const submitForm = async (e) => {
		e.preventDefault();

		// Basic validation
		if (!pageName.trim()) {
			setError("Page name cannot be empty");
			return;
		}

		try {
			setDisableSubmit(true);
			let response = await fetch(`/api/wiki/${props.wikiId}/pages`, {
				method: "POST",
				headers: {
					Authorization: "Bearer " + currentUser.accessToken,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					pageName: pageName.trim(),
					category: selectedCategory
				})
			});

			if (!response.ok) {
				setDisableSubmit(false);
				throw (await response.json()).error;
			}

			// Success - navigate to article editor
			const result = await response.json();
			setPageName("");
			setError("");
			props.handleClose();
			// Navigate to the article editor for this page
			navigate(
        `/${props.wikiUrlName}/${result.pages[result.pages.length - 1]._id}/create`
      );
			// console.log(`Navigating to: /${props.wikiUrlName}/${result.pageId}/create`);
		} catch (e) {
			setDisableSubmit(false);
			setError(`${e}`);
		}
	};

	return (
		<div>
			<Modal
				isOpen={props.isOpen}
				onRequestClose={props.handleClose}
				style={customStyles}
				contentLabel="Create Page Modal"
			>
				<div
					className="row mb-3"
					style={{ display: "flex", justifyContent: "space-between" }}
				>
					<div
						className="col"
						style={{ display: "flex", justifyContent: "space-between" }}
					>
						<h5 style={{ display: "inline" }}>Create a new page</h5>
						<button
							className="btn btn-secondary"
							onClick={props.handleClose}
							style={{ display: "inline", fontWeight: "bold" }}
						>
							X
						</button>
					</div>
				</div>
				{error && <p style={{ color: "red" }}>{error}</p>}
				<form onSubmit={(e) => submitForm(e)}>
					<div className="form-floating mb-3">
						<input
							className="form-control"
							placeholder="page name"
							type="text"
							id="pageName"
							name="pageName"
							value={pageName}
							onChange={(e) => setPageName(e.target.value)}
							disabled={disableSubmit}
							required
						/>
						<label htmlFor="pageName">Page Name</label>
					</div>
					<div className="form-floating mb-3">
						<select
							className="form-control"
							id="category"
							name="category"
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							disabled={disableSubmit}
						>
							{props.categories &&
								props.categories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
						</select>
						<label htmlFor="category">Category</label>
					</div>
					<button
						className="btn btn-primary mt-3"
						type="submit"
						disabled={disableSubmit}
					>
						Create Page
					</button>
				</form>
			</Modal>
		</div>
	);
}

export default CreatePageModal;
