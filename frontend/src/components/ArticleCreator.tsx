import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import TextEditor from "./editors/TextEditor";
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
	const { currentUser } = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();
	const [editors, setEditors] = useState<EditorItem[]>([]);
	const [nextId, setNextId] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [pageUrlName, setPageUrlName] = useState<string | null>(null);
	const [actualPageId, setActualPageId] = useState<string | null>(null);

	// Determine if we're in edit mode based on the URL
	const isEditMode = location.pathname.includes("/edit");

	// Fetch existing page content in edit mode
	useEffect(() => {
		const fetchPageContent = async () => {
			if (!isEditMode || !wikiUrlName || !pageId || !currentUser) return;

			setIsLoading(true);
			try {
				// In edit mode, pageId is actually the pageUrlName, so we need to fetch by URL name
				const response = await fetch(
					`/api/wiki/${wikiUrlName}/pages/${pageId}`,
					{
						method: "GET",
						headers: {
							Authorization: "Bearer " + currentUser.accessToken
						}
					}
				);

				if (!response.ok) {
					throw new Error("Failed to fetch page");
				}

				const pageData = await response.json();
				setPageUrlName(pageData.urlName);
				setActualPageId(pageData._id); // Store the actual MongoDB ObjectId

				// Convert the content array into editor items
				if (pageData.content && Array.isArray(pageData.content)) {
					const loadedEditors: EditorItem[] = pageData.content.map(
						(content: string, index: number) => {
							// Detect if content is a table (starts with | or has table markdown syntax)
							const isTable =
								content.trim().startsWith("|") || content.includes("|---|");
							// Detect if content is ONLY an image (markdown image syntax with nothing else)
							// This should be just a single line with only image markdown
							const isImage =
								content.trim().match(/^!\[.*?\]\(.*?\)$/) &&
								!content.includes("\n");
							return {
								id: index,
								type: isTable ? "table" : isImage ? "image" : "text",
								content: content
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

		const markdownArray: string[] = editors.map((editor) => editor.content);

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
			{isLoading ? (
				<div className="loading-state">
					<p>Loading page content...</p>
				</div>
			) : (
				<>
					<div className="article-creator-header">
						<h2>{isEditMode ? "Edit Article" : "Create New Article"}</h2>
						<div className="add-editor-buttons">
							<button onClick={addTextEditor} className="btn-add-text">
								+ Add Text Editor
							</button>
							<button onClick={addTableEditor} className="btn-add-table">
								+ Add Table Editor
							</button>
							<button onClick={addImageEditor} className="btn-add-image">
								+ Add Image Editor
							</button>
						</div>
					</div>
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
								<div key={editor.id} className="editor-item">
									<div className="editor-controls">
										<span className="editor-label">
											{editor.type === "text"
												? "Text Editor"
												: editor.type === "table"
												? "Table Editor"
												: "Image Editor"}{" "}
											#{index + 1}
										</span>
										<div className="control-buttons">
											<button
												onClick={() => moveEditorUp(index)}
												disabled={index === 0}
												className="btn-move"
												title="Move up"
											>
												^
											</button>
											<button
												onClick={() => moveEditorDown(index)}
												disabled={index === editors.length - 1}
												className="btn-move"
												title="Move down"
											>
												⌄
											</button>
											<button
												onClick={() => removeEditor(editor.id)}
												className="btn-remove"
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
					{editors.length > 0 && (
						<div className="create-page-section">
							<button
								onClick={createPage}
								className="btn-create-page"
								disabled={isSaving}
							>
								{isSaving
									? "Saving..."
									: isEditMode
									? "Save Changes"
									: "Create Page"}
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default ArticleCreator;
