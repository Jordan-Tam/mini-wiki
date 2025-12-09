import React, { useMemo, useEffect, useState, useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { useLocation, useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

type ArticleProps = {
	markdown?: string[];
	title?: string;
	onEdit?: () => void;
	editHref?: string; // path to append to current URL (e.g., "/edit")
	className?: string;
	fetchFromUrl?: boolean; // if true, fetch page from URL params
};

// Memoize plugin arrays and component config to prevent re-creation on each render
// Got from documentation examples and stuff
const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw, rehypeSanitize];
const MARKDOWN_COMPONENTS = {
	a: (props: React.ComponentPropsWithoutRef<"a">) => {
		const { href, children, ...rest } = props;
		// Use Link for relative URLs, regular <a> for absolute URLs
		if (href?.startsWith("/")) {
			return (
				<Link to={href} {...rest}>
					{children}
				</Link>
			);
		}
		return <a {...props} target="_blank" rel="noopener noreferrer" />;
	},
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
	className,
	fetchFromUrl = false
}) => {

	const location = useLocation();
	const { wikiUrlName, pageUrlName } = useParams();
	//TODO: const { wikiUrlName, pageUrlName } = useParams();
	const { currentUser } = useContext(AuthContext);
	const [fetchedPage, setFetchedPage] = useState(null);
	const [loading, setLoading] = useState(fetchFromUrl);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!fetchFromUrl) return;

		const fetchPage = async () => {
			try {
				const response = await fetch(`/api/wiki/${wikiUrlName}/pages/${pageUrlName}`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});

				if (!response.ok) {
					throw "Failed to fetch page";
				}

				const data = await response.json();
				setFetchedPage(data);
				setLoading(false);
				
			} catch (e: any) {
				setError(`${e}`);
			} finally {
				setLoading(false);
			}
		};

		if (wikiUrlName && pageUrlName && currentUser) fetchPage();
	}, [wikiUrlName, pageUrlName, currentUser, fetchFromUrl]);

	// Memoize the edit button to prevent re-rendering if dependencies don't change
	const editButton = useMemo(() => {
		if (!onEdit && !editHref) return null;

		// Build full edit URL by appending editHref to current pathname
		const fullEditUrl = editHref
			? `${location.pathname}${editHref.startsWith("/") ? "" : "/"}${editHref}`
			: undefined;

		return fullEditUrl ? (
			<Link className="mb-3" to={fullEditUrl} aria-label="Edit this article">
				<p className="btn btn-warning">Edit</p>
			</Link>
		) : (
			<button type="button" onClick={onEdit} aria-label="Edit this article">
				Edit
			</button>
		);
	}, [onEdit, editHref, location.pathname]);

	if (fetchFromUrl && loading) return <p>Loading...</p>;
	if (fetchFromUrl && error) return <p>Error: {error}</p>;

	const displayMarkdown = fetchFromUrl
		? fetchedPage?.content || []
		: markdown || [];
	const displayTitle = fetchFromUrl ? fetchedPage?.name : title;

	return (
		<article className={`${className} container-fluid`}>
			<div>
				<p><span style={{fontWeight: "bold"}}>Category: </span><Link to={`/${wikiUrlName}/category/${fetchedPage.category}`}>{fetchedPage.category}</Link></p>
				{editButton}
				<h1 className="mb-3">{displayTitle ?? "Article"}</h1>
			</div>

			<div>
				{displayMarkdown.length === 0 ? (
					<p>
						<em>No content</em>
					</p>
				) : (
					displayMarkdown.map((content, index) => (
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
