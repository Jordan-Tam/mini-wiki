import { useState, useRef } from "react";
import rehypeSanitize from "rehype-sanitize";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface TextEditorProps {
	onChange: (content:string) => any;
	defaultValue: string;
	showPreview: boolean;
	inputId: string;
}

function TextEditor({
	onChange,
	defaultValue = "Text",
	showPreview = true,
	inputId
}: TextEditorProps) {
	const textareaId = inputId;
	const [text, setText] = useState(defaultValue);
	// https://react.dev/learn/manipulating-the-dom-with-refs
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	// Add for security per the github
	// (https://github.com/uiwjs/react-markdown-preview?tab=readme-ov-file#security)
	const rehypePlugins = [rehypeSanitize];
	// Function to add in the markdown symbols
	const insertMarkdown = (before:string, after:string = before) => {
		const textarea = textareaRef.current;

		if(!textarea) {
			return;
		}

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
						<button
							className="btn btn-info me-2"
							onClick={() => insertMarkdown("**")}
						>
							Bold
						</button>
						<button
							className="btn btn-info me-2"
							onClick={() => insertMarkdown("*")}
						>
							Italic
						</button>
						<button
							className="btn btn-info me-2"
							onClick={() => insertMarkdown("<ins>", "</ins>")}
						>
							Underline
						</button>
						<button
							className="btn btn-info me-2"
							onClick={() => insertMarkdown("# ", "")}
						>
							H1
						</button>
						<button
							className="btn btn-info me-2"
							onClick={() => insertMarkdown("## ", "")}
						>
							H2
						</button>
						<button
							className="btn btn-info me-2"
							onClick={() => insertMarkdown("[", "](url)")}
						>
							Link
						</button>
						<button
							className="btn btn-info me-2"
							onClick={() => insertMarkdown("- ", "")}
						>
							List
						</button>
					</div>
					{/* 
					Helpful reference about text area attributes
					https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement 
					*/}
					<textarea
						className="w-100"
						ref={textareaRef}
						name="userTextArea"
						id={textareaId}
						value={text}
						rows={10}
						cols={20}
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
