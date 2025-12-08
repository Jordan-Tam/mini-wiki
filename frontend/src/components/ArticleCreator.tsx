import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import TextEditor from "./editors/TextEditor";
import TableEditor from "./editors/TableEditor";

// Types for editor components
type EditorType = "text" | "table";
interface EditorItem {
	id: number;
	type: EditorType;
	content: string;
}

function ArticleCreator() {
	const { wikiUrlName, pageId } = useParams();
	const { currentUser } = useContext(AuthContext);
	const navigate = useNavigate();
	const [editors, setEditors] = useState<EditorItem[]>([]);
	const [nextId, setNextId] = useState(0);
	const [isSaving, setIsSaving] = useState(false);

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
		const markdownArray: string[] = editors.map((editor) => editor.content);

		// Validate that we have the required IDs
		if (!wikiUrlName || !pageId) {
			alert(
				`Missing required parameters: wikiUrlName=${wikiUrlName}, pageId=${pageId}`
			);
			console.error("Missing params:", { wikiUrlName, pageId });
			return;
		}

		// console.log("Creating page with:", { wikiUrlName, pageId, contentLength: markdownArray.length });

		try {
			setIsSaving(true);
			const response = await fetch(
				`/api/wiki/${wikiUrlName}/pages/${pageId}/content`,
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
			const updatedPage = await response.json();
			
			// Success - navigate to the page view using the page URL
			navigate(`/${wikiUrlName}/${updatedPage.urlName}`);
		} catch (error) {
			alert(`Error saving page: ${error}`);
			setIsSaving(false);
		}
	};

	return (
		<div className="article-creator">
			<div className="article-creator-header">
				<h2>Create New Article</h2>
				<div className="add-editor-buttons">
					<button onClick={addTextEditor} className="btn-add-text">
						+ Add Text Editor
					</button>
					<button onClick={addTableEditor} className="btn-add-table">
						+ Add Table Editor
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
									{editor.type === "text" ? "Text Editor" : "Table Editor"} #
									{index + 1}
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
								) : (
									<TableEditor
										defaultValue={editor.content}
										onChange={(content: string) =>
											updateEditorContent(editor.id, content)
										}
										showPreview={true}
										inputId={`article-table-${editor.id}`}
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
						{isSaving ? "Saving..." : "Create Page"}
					</button>
				</div>
			)}
		</div>
	);
}

export default ArticleCreator;
