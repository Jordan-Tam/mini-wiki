import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { useLocation } from "react-router-dom";

type ArticleProps = {
	markdown: string[];
	title?: string;
	onEdit?: () => void;
	editHref?: string; // path to append to current URL (e.g., "/edit")
	className?: string;
};

// Memoize plugin arrays and component config to prevent re-creation on each render
// Got from documentation examples and stuff
const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw, rehypeSanitize];
const MARKDOWN_COMPONENTS = {
	a: (props: React.ComponentPropsWithoutRef<"a">) => (
		<a {...props} target="_blank" rel="noopener noreferrer" />
	),
	img: (props: React.ComponentPropsWithoutRef<"img">) => (
		<img {...props} alt={props.alt ?? ""} />
	),
	pre: (props: React.ComponentPropsWithoutRef<"pre">) => <pre {...props} />,
	code: (props: React.ComponentPropsWithoutRef<"code">) => <code {...props} />
};
const Article: React.FC<ArticleProps> = ({
	markdown,
	title,
	onEdit,
	editHref,
	className
}) => {
	const location = useLocation();

	// Memoize the edit button to prevent re-rendering if dependencies don't change
	const editButton = useMemo(() => {
		if (!onEdit && !editHref) return null;

		// Build full edit URL by appending editHref to current pathname
		const fullEditUrl = editHref
			? `${location.pathname}${editHref.startsWith("/") ? "" : "/"}${editHref}`
			: undefined;

		return fullEditUrl ? (
			<a href={fullEditUrl} aria-label="Edit this article">
				Edit
			</a>
		) : (
			<button type="button" onClick={onEdit} aria-label="Edit this article">
				Edit
			</button>
		);
	}, [onEdit, editHref, location.pathname]);

	return (
		<article className={className}>
			<div>
				<h1>{title ?? "Article"}</h1>
				{editButton}
			</div>

			<div>
				{markdown.length === 0 ? (
					<p>
						<em>No content</em>
					</p>
				) : (
					markdown.map((content, index) => (
						<ReactMarkdown
							key={index}
							remarkPlugins={REMARK_PLUGINS}
							rehypePlugins={REHYPE_PLUGINS}
							components={MARKDOWN_COMPONENTS}
						>
							{content}
						</ReactMarkdown>
					))
				)}
			</div>
		</article>
	);
};

export default Article;
