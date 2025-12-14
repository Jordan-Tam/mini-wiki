import { useState, useRef, useEffect } from "react";
import rehypeSanitize from "rehype-sanitize";
import MarkdownPreview from "@uiw/react-markdown-preview";

function TextEditor({
	onChange,
	defaultValue = "Text",
	showPreview = true,
	inputId
}) {
	const textareaId = inputId;
	const [text, setText] = useState(defaultValue);
	// https://react.dev/learn/manipulating-the-dom-with-refs
	const textareaRef = useRef(null);
	// Add for security per the github
	// (https://github.com/uiwjs/react-markdown-preview?tab=readme-ov-file#security)
	const rehypePlugins = [rehypeSanitize];
	// Function to add in the markdown symbols
	const insertMarkdown = (before, after = before) => {
		const textarea = textareaRef.current;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = text.substring(start, end);
		const newText =
			text.substring(0, start) +
			before +
			selectedText +
			after +
			text.substring(end);
		// Set the text of the text area to updated
		setText(newText);
		if (onChange) onChange(newText);
		// Reset cursor position
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + before.length, end + before.length);
		}, 0);
	};
	// Actual HTML
	return (
		<div className="textEditor">
			<div className="row">
				<div className="userSide col-6">
					<div className="mb-2 toolbar">
						<button className="btn btn-info me-2" onClick={() => insertMarkdown("**")}>Bold</button>
						<button className="btn btn-info me-2" onClick={() => insertMarkdown("*")}>Italic</button>
						<button className="btn btn-info me-2" onClick={() => insertMarkdown("<ins>", "</ins>")}>Underline</button>
						<button className="btn btn-info me-2" onClick={() => insertMarkdown("# ", "")}>H1</button>
						<button className="btn btn-info me-2" onClick={() => insertMarkdown("## ", "")}>H2</button>
						<button className="btn btn-info me-2" onClick={() => insertMarkdown("[", "](url)")}>Link</button>
						<button className="btn btn-info me-2" onClick={() => insertMarkdown("- ", "")}>List</button>
					</div>
					{/* 
					Helpful reference about text area attributes
					https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement 
					*/}
					<textarea
						className="w-100"
						ref={textareaRef}
						name="userTextArea"
						style={{resize: "both"}}
						id={textareaId}
						value={text}
						rows="10"
						cols="20"
						onChange={(e) => {
							setText(e.target.value);
							if (onChange) onChange(e.target.value);
						}}
					></textarea>
				</div>
				{showPreview && (
					<div className="previewArea col-6 mt-4">
						<MarkdownPreview source={text} rehypePlugins={rehypePlugins} />
					</div>
				)}
			</div>
		</div>
	);
}

export default TextEditor;
