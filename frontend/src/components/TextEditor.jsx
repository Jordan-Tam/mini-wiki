import { useState, useRef } from "react";
import rehypeSanitize from "rehype-sanitize";
import MarkdownPreview from "@uiw/react-markdown-preview";

function TextEditor() {
	const [text, setText] = useState("Text");
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
		// Reset cursor position
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + before.length, end + before.length);
		}, 0);
	};
	// Actual HTML
	return (
		<div className="textEditor">
			<div className="userSide">
				<div className="toolbar">
					<button onClick={() => insertMarkdown("**")}>Bold</button>
					<button onClick={() => insertMarkdown("*")}>Italic</button>
					<button onClick={() => insertMarkdown("# ", "")}>H1</button>
					<button onClick={() => insertMarkdown("## ", "")}>H2</button>
					<button onClick={() => insertMarkdown("[", "](url)")}>Link</button>
					<button onClick={() => insertMarkdown("- ", "")}>List</button>
				</div>
				{/* 
                Helpful reference about text area attributes
                https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement 
                */}
				<textarea
					ref={textareaRef}
					name="userTextArea"
					id="userInputArea"
					value={text}
					rows="10"
					cols="20"
					onChange={(e) => setText(e.target.value)}
				></textarea>
			</div>
			<div className="previewArea">
				<MarkdownPreview source={text} rehypePlugins={rehypePlugins} />
			</div>
		</div>
	);
}

export default TextEditor;
