import React, { useMemo, useEffect, useState, useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { useLocation, useParams, Link } from "react-router-dom";
import { AuthContext, type FbUserContext, type FbUserContextMaybe } from "../context/AuthContext.jsx";
import DeletePageModal from "./modals/DeletePageModal.jsx";
import ChangeCategoryModal from "./modals/ChangeCategoryModal.tsx"

type ArticleProps = {
	markdown?: Array<{ editorType: string; contentString: string }>;
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
		if (href?.startsWith("/") || href?.startsWith("#")) {
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
	const { currentUser } = useContext(AuthContext) as FbUserContext;

	const [wiki, setWiki] = useState(null);
	const [showDeletePageModal, setShowDeletePageModal] = useState(false);
	const [fetchedPage, setFetchedPage] = useState(null);
	const [loading, setLoading] = useState(fetchFromUrl);
	const [error, setError] = useState(null);

	const [showChangeCategoryModal, setShowChangeCategoryModal] = useState(false);

	useEffect(() => {
		if (!fetchFromUrl) return;

		const fetchPage = async () => {
			try {
				const response = await fetch(`/api/wiki/${wikiUrlName}`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});

				if (!response.ok) {
					throw "Failed to fetch page";
				}

				const data = await response.json();

				setWiki(data);

				for (let page of data.pages) {
					if (page.urlName === pageUrlName) {
						setFetchedPage(page);
					}
				}

				setLoading(false);
				
			} catch (e: any) {
				setError(`${e}`);
			} 
		};

		if (wikiUrlName && pageUrlName && currentUser) fetchPage();
	}, [wikiUrlName, pageUrlName, currentUser, fetchFromUrl]);

	const handleCloseModals = () => {
		setShowDeletePageModal(false);
		setShowChangeCategoryModal(false);
  };

  	useEffect(() => {

		const fetchUser = async () => {
			try {
				const response = await fetch(`/api/users/${currentUser.uid}`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});

				if (!response.ok) {
					throw "Failed to fetch page";
				}

				const data = await response.json();

				setUser(data);
				
			} catch (e: any) {
				setError(`${e}`);
			} finally {
				setLoading(false);
			}
		}
	})


	// Memoize the edit button to prevent re-rendering if dependencies don't change
	const editButton = useMemo(() => {
		if (!onEdit && !editHref) return null;

		// Build full edit URL by appending editHref to current pathname
		const fullEditUrl = editHref
			? `${location.pathname}${editHref.startsWith("/") ? "" : "/"}${editHref}`
			: undefined;

		return fullEditUrl ? (
			<Link className="mb-3 me-3" to={fullEditUrl} aria-label="Edit this article">
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
	else {
	const ownerOrCollaborator =
		currentUser &&
		wiki &&
		(
			wiki.owner === currentUser.uid ||
			wiki.collaborators?.includes(currentUser.uid)
		);

	console.log("WIKI ACCESS: " + wiki.access)
	console.log("owner/collab " + ownerOrCollaborator)
	const displayMarkdown = fetchFromUrl
		? fetchedPage?.content || []
		: markdown || [];
	const displayTitle = fetchFromUrl ? fetchedPage?.name : title;

	return (
		<article className={`${className} container-fluid`}>
			<div>
				<p>
					<span style={{fontWeight: "bold"}}>Wiki: </span>
					<Link to={`/${wikiUrlName}`}>{wiki.name}</Link>
					<span> / </span>				
					<span style={{fontWeight: "bold"}}>Category: </span>
					<Link to={`/${wikiUrlName}/category/${fetchedPage.category}`}>{fetchedPage.category}</Link>
				</p>

				<h1 className="mb-3" style={{fontWeight: "bold"}}>{displayTitle ?? "Article"}</h1>
				
				{ ownerOrCollaborator || wiki.access.trim().toLowerCase() === "public-edit" && (
				<div>
					{editButton}
					<br/>
					<p className="btn btn-danger" onClick={() => setShowDeletePageModal(true)} >
						Delete
					</p>
					<br/>
					<p className="btn btn-dark" onClick={() => setShowChangeCategoryModal(true)} >
						Change Category
					</p>
				</div>
				) 
				}
				

			</div>

			<div>
				{displayMarkdown.length === 0 ? (
					<p>
						<em>No content</em>
					</p>
				) : (
					displayMarkdown.map((item, index) => (
						<ReactMarkdown
							key={index}
							remarkPlugins={REMARK_PLUGINS}
							rehypePlugins={REHYPE_PLUGINS}
							components={MARKDOWN_COMPONENTS}
						>
							{item.contentString}
						</ReactMarkdown>
					))
				)}
			</div>
			{showDeletePageModal && (
				<DeletePageModal
					isOpen={showDeletePageModal}
					handleClose={handleCloseModals}
					wikiUrlName={wikiUrlName}
					pageUrlName={pageUrlName}
				/>
			)}

			{showChangeCategoryModal && (
				<>
				<ChangeCategoryModal
  					isOpen={showChangeCategoryModal} 
					handleClose={handleCloseModals}
					wikiUrlName={wikiUrlName}
					pageUrlName={pageUrlName}
					wiki={wiki || { categories: [] } }
				/>
				</>
			)}
		</article>
	);
	}
};

export default Article;
