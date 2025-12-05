import { useState } from "react";
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
	const [editors, setEditors] = useState<EditorItem[]>([]);
	const [nextId, setNextId] = useState(0);

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

	const createPage = () => {
		const markdownArray: string[] = editors.map((editor) => editor.content);
		// This is where we gonna pass it to backend or something
		// Right now just alerting/logging to be able to see the result and return it
		console.log("Markdown content from all editors:", markdownArray);
		const tempString: string =
			"Markdown content from all editors:" + markdownArray;
		alert(tempString);
		return markdownArray;
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
					<button onClick={createPage} className="btn-create-page">
						Create Page
					</button>
				</div>
			)}
		</div>
	);
}

export default ArticleCreator;
