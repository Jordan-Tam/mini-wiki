import { useState, useEffect } from "react";
import rehypeSanitize from "rehype-sanitize";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface ImageEditorProps {
	onChange?: (value: string) => void;
	defaultValue?: string;
	showPreview?: boolean;
	inputId?: string;
}

function ImageEditor({
	onChange,
	defaultValue = "",
	showPreview = true,
	inputId
}: ImageEditorProps) {
	// Parse default value if it exists (format: ![alt text](url))
	const parseMarkdown = (markdown: string): { url: string; alt: string } => {
		const match = markdown.match(/!\[(.*?)\]\((.*?)\)/);
		if (match) {
			return { alt: match[1], url: match[2] };
		}
		return { url: "", alt: "" };
	};

	const initialData = parseMarkdown(defaultValue);
	const [imageUrl, setImageUrl] = useState(initialData.url);
	const [altText, setAltText] = useState(initialData.alt);
	const [markdown, setMarkdown] = useState(defaultValue);
	const [urlError, setUrlError] = useState("");
	const [altError, setAltError] = useState("");
	const rehypePlugins = [rehypeSanitize];

	// Validation functions
	const isValidUrl = (url: string): boolean => {
		if (!url.trim()) return false;
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	};

	const isValidAltText = (alt: string): boolean => {
		return alt.trim().length > 0;
	};

	// Update markdown when url or alt changes
	useEffect(() => {
		// Validate URL
		if (imageUrl && !isValidUrl(imageUrl)) {
			setUrlError("Please enter a valid URL");
		} else {
			setUrlError("");
		}

		// Validate alt text
		if (altText && !isValidAltText(altText)) {
			setAltError("Alt text cannot be empty or only spaces");
		} else {
			setAltError("");
		}

		// Generate markdown only if both are valid
		if (isValidUrl(imageUrl) && isValidAltText(altText)) {
			const newMarkdown = `![${altText}](${imageUrl})`;
			setMarkdown(newMarkdown);
			if (onChange) onChange(newMarkdown);
		} else {
			setMarkdown("");
			if (onChange) onChange("");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [imageUrl, altText]);

	return (
		<div className="imageEditor">
			<div className="row">
			<div className="userSide col-6">
				<div className="image-form">
					<div className="form-group">
						<label className="mb-2 me-2" style={{fontWeight: "bold"}} htmlFor={`${inputId}-url`}>
							Image URL
						</label>
						<input
							type="url"
							id={`${inputId}-url`}
							value={imageUrl}
							onChange={(e) => setImageUrl(e.target.value)}
							placeholder="https://example.com/image.jpg"
							required
							className={urlError ? "error" : ""}
						/>
						{urlError && <span style={{color: "red"}} className="error-message"> {urlError}</span>}
					</div>
					<div className="form-group">
						<label className="me-2" style={{fontWeight: "bold"}} htmlFor={`${inputId}-alt`}>
							Alt Text
						</label>
						<input
							type="text"
							id={`${inputId}-alt`}
							value={altText}
							onChange={(e) => setAltText(e.target.value)}
							placeholder="Description of the image"
							required
							className={altError ? "error" : ""}
						/>
						{altError && <span className="error-message">{altError}</span>}
					</div>
				</div>
			</div>
			<div className="markdown-output col-6">
				<p>Preview:</p>
				<code>
					{markdown || "Fill in both fields to see preview"}
				</code>
				{showPreview && markdown && (
					<div className="previewArea col-6">
						<MarkdownPreview source={markdown} rehypePlugins={rehypePlugins} />
					</div>
				)}
			</div>
		</div>
		</div>
	);
}

export default ImageEditor;
