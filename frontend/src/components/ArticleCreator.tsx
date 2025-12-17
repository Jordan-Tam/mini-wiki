import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext, type FbUserContext, type FbUserContextMaybe } from "../context/AuthContext.jsx";
import TextEditor from "./editors/TextEditor.tsx";
import TableEditor from "./editors/TableEditor";
import ImageEditor from "./editors/ImageEditor";

// Types for editor components
type EditorType = "text" | "table" | "image";
interface EditorItem {
	id: number;
	type: EditorType;
	content: string;
}

function ArticleCreator() {
	const { wikiUrlName, pageId } = useParams();
	const { currentUser } = useContext(AuthContext) as FbUserContext;
	const navigate = useNavigate();
	const location = useLocation();
	const [editors, setEditors] = useState<EditorItem[]>([]);
	const [nextId, setNextId] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [wiki, setWiki] = useState<any>(undefined);
	const [page, setPage] = useState<any>(undefined);
	const [pageUrlName, setPageUrlName] = useState<string | null>(null);
	const [actualPageId, setActualPageId] = useState<string | null>(null);

	// Determine if we're in edit mode based on the URL
	const isEditMode = location.pathname.includes("/edit");

	// Fetch existing page content in edit mode
	useEffect(() => {
		const fetchPageContent = async () => {
			if (!isEditMode || !wikiUrlName || !pageId || !currentUser) return;

			try {
				// In edit mode, pageId is actually the pageUrlName, so we need to fetch by URL name
				const response = await fetch(`/api/wiki/${wikiUrlName}`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser.accessToken
					}
				});

				if (!response.ok) {
					throw new Error("Failed to fetch page");
				}

				let wikiData = await response.json();

				setWiki(wikiData);

				let pageData;
				for (let page of wikiData.pages) {
					if (page.urlName === pageId) {
						pageData = page;
					}
				}

				setPage(pageData);
				setPageUrlName(pageData.urlName);
				setActualPageId(pageData._id); // Store the actual MongoDB ObjectId

				// Convert the content array into editor items
				if (pageData.content && Array.isArray(pageData.content)) {
					const loadedEditors: EditorItem[] = pageData.content.map(
						(
							item: { editorType: string; contentString: string },
							index: number
						) => {
							return {
								id: index,
								type: item.editorType as EditorType,
								content: item.contentString
							};
						}
					);
					setEditors(loadedEditors);
					setNextId(loadedEditors.length);
				}
			} catch (error) {
				alert(`Error loading page: ${error}`);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPageContent();
	}, [isEditMode, wikiUrlName, pageId, currentUser]);

	const addTextEditor = () => {
		const newEditor: EditorItem = { id: nextId, type: "text", content: "Text" };
		setEditors([...editors, newEditor]);
		setNextId(nextId + 1);
	};

	const addTableEditor = () => {
		const newEditor: EditorItem = {
			id: nextId,
			type: "table",
			content: `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`
		};
		setEditors([...editors, newEditor]);
		setNextId(nextId + 1);
	};

	const addImageEditor = () => {
		const newEditor: EditorItem = {
			id: nextId,
			type: "image",
			content: ""
		};
		setEditors([...editors, newEditor]);
		setNextId(nextId + 1);
	};

	const removeEditor = (id: number) => {
		setEditors(editors.filter((editor) => editor.id !== id));
	};

	const moveEditorUp = (index: number) => {
		if (index === 0) return;
		const newEditors = [...editors];
		[newEditors[index - 1], newEditors[index]] = [
			newEditors[index],
			newEditors[index - 1]
		];
		setEditors(newEditors);
	};

	const moveEditorDown = (index: number) => {
		if (index === editors.length - 1) return;
		const newEditors = [...editors];
		[newEditors[index], newEditors[index + 1]] = [
			newEditors[index + 1],
			newEditors[index]
		];
		setEditors(newEditors);
	};

	const updateEditorContent = (id: number, content: string) => {
		setEditors(
			editors.map((editor) =>
				editor.id === id ? { ...editor, content } : editor
			)
		);
	};

	const createPage = async () => {
		// Validate that all image editors have valid content
		const hasInvalidImageEditor = editors.some(
			(editor) => editor.type === "image" && !editor.content
		);

		if (hasInvalidImageEditor) {
			alert(
				"Please ensure all image editors have a valid URL and alt text before saving."
			);
			return;
		}

		const markdownArray = editors.map((editor) => ({
			editorType: editor.type,
			contentString: editor.content
		}));

		// Validate that we have the required IDs
		if (!wikiUrlName) {
			alert(`Missing required parameter: wikiUrlName`);
			return;
		}

		// In edit mode, use the actual page ID; in create mode, use pageId from params
		const idToUse = isEditMode ? actualPageId : pageId;

		if (!idToUse) {
			alert(`Missing page ID`);
			return;
		}

		try {
			setIsSaving(true);
			const response = await fetch(
				`/api/wiki/${wikiUrlName}/pages/${idToUse}/content`,
				{
					method: "POST",
					headers: {
						Authorization: "Bearer " + currentUser.accessToken,
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						content: markdownArray
					})
				}
			);

			if (!response.ok) {
				throw new Error("Failed to save page");
			}

			// Get the updated page data which includes the URL
			const result = await response.json();
			const updatedPage = result.pages[result.pages.length - 1];

			// In edit mode, use the existing pageUrlName; in create mode, use the returned one
			const urlToNavigate =
				isEditMode && pageUrlName ? pageUrlName : updatedPage.urlName;

			// Success - navigate to the page view using the page URL
			navigate(`/${wikiUrlName}/${urlToNavigate}`);
		} catch (error) {
			alert(`Error saving page: ${error}`);
			setIsSaving(false);
		}
	};

	return (
		<div className="container-fluid article-creator">
			{isLoading && isEditMode ? (
				<div className="loading-state">
					<p>Loading page content...</p>
				</div>
			) : (
				<>
					{isEditMode && (
						<div className="mb-3 article-creator-header">
							<p className="mb-3">
								<span style={{ fontWeight: "bold" }}>Wiki: </span>
								<Link to={`/${wikiUrlName}`}>{wiki.name}</Link>
								<span> / </span>
								<span style={{ fontWeight: "bold" }}>Category: </span>
								<Link
									to={`/${wikiUrlName}/category/${page.category_slugified}`}
								>
									{page.category}
								</Link>
							</p>
							<h2>
								Editing{" "}
								<span style={{ fontWeight: "bold" }}>{`${page.name}`}</span>
							</h2>{" "}
							<div>
								<Link
									to={`/${wikiUrlName}/${pageId}`}
									className="btn btn-warning"
								>
									Cancel
								</Link>
							</div>
						</div>
					)}
					<div className="editors-container">
						{editors.length === 0 ? (
							<div className="empty-state">
								<p>
									No editors yet. Click the buttons above to add a Text or Table
									editor.
								</p>
							</div>
						) : (
							editors.map((editor, index) => (
								<div key={editor.id} className="mb-5 editor-item">
									<div className="editor-controls">
										<h5 className="editor-label" style={{ fontWeight: "bold" }}>
											{editor.type === "text"
												? "Text Editor"
												: editor.type === "table"
												? "Table Editor"
												: "Image Editor"}{" "}
											#{index + 1}
										</h5>
										<div className="control-buttons mb-2">
											<button
												onClick={() => moveEditorUp(index)}
												disabled={index === 0}
												className="btn btn-secondary me-2 btn-move"
												title="Move up"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													fill="currentColor"
													className="bi bi-arrow-up"
													viewBox="0 0 16 16"
												>
													<path
														fillRule="evenodd"
														d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"
													/>
												</svg>
											</button>
											<button
												onClick={() => moveEditorDown(index)}
												disabled={index === editors.length - 1}
												className="btn btn-secondary me-2 btn-move"
												title="Move down"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													fill="currentColor"
													className="bi bi-arrow-down"
													viewBox="0 0 16 16"
												>
													<path
														fillRule="evenodd"
														d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"
													/>
												</svg>
											</button>
											<button
												onClick={() => removeEditor(editor.id)}
												className="btn btn-danger btn-remove"
												title="Remove"
											>
												Delete
											</button>
										</div>
									</div>
									<div className="editor-wrapper">
										{editor.type === "text" ? (
											<TextEditor
												defaultValue={editor.content}
												onChange={(content: string) =>
													updateEditorContent(editor.id, content)
												}
												showPreview={true}
												inputId={`article-text-${editor.id}`}
											/>
										) : editor.type === "table" ? (
											<TableEditor
												defaultValue={editor.content}
												onChange={(content: string) =>
													updateEditorContent(editor.id, content)
												}
												showPreview={true}
												inputId={`article-table-${editor.id}`}
											/>
										) : (
											<ImageEditor
												defaultValue={editor.content}
												onChange={(content: string) =>
													updateEditorContent(editor.id, content)
												}
												showPreview={true}
												inputId={`article-image-${editor.id}`}
											/>
										)}
									</div>
								</div>
							))
						)}
					</div>
					<div className="bg-info-subtle p-3 rounded-3 mb-5 add-editor-buttons">
						<p>Insert a New Editor:</p>
						<button
							onClick={addTextEditor}
							className="btn btn-success me-2 btn-add-text"
						>
							+ Add Text Editor
						</button>
						<button
							onClick={addTableEditor}
							className="btn btn-success me-2 btn-add-table"
						>
							+ Add Table Editor
						</button>
						<button
							onClick={addImageEditor}
							className="btn btn-success btn-add-image"
						>
							+ Add Image Editor
						</button>
					</div>
					{editors.length > 0 && (
						<div className="row p-3 create-page-section">
							<button
								onClick={createPage}
								className="btn btn-primary btn-create-page"
								disabled={isSaving}
								style={{
									fontSize: "30px",
									fontWeight: "bold",
									height: "100px",
									border: "7px solid black"
								}}
							>
								{isSaving
									? "Saving..."
									: isEditMode
									? "SAVE CHANGES"
									: "CREATE PAGE"}
							</button>
						</div>
					)}
					<br />
					<br />
				</>
			)}
		</div>
	);
}

export default ArticleCreator;
