import { useContext, useEffect, useState, type JSX } from "react";
import type React from "react";
import { useParams } from "react-router-dom";
import { AuthContext, type FbUserContext, type FbUserContextMaybe } from "../context/AuthContext.jsx";
import Chat from "./Chat";
import type { Wiki } from "../types.js";

export const ChatPage:React.FC = (): JSX.Element => {
    // get wiki by id
    const { wikiUrlName } = useParams();
	const { currentUser } = useContext(AuthContext) as FbUserContext;

    const [wiki, setWiki] = useState<Wiki | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
    const [chatReady, setChatReady] = useState<boolean>(false);

    // pull wiki
    useEffect(() => {
		const fetchWiki = async () => {
			try {
				const response = await fetch(`/api/wiki/${wikiUrlName}`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});
				if (!response.ok) {
					const d = await response.json();
					throw d.error;
				}
				const data = await response.json();
				setWiki(data);
			} catch (e) {
				setError(`${e}`);
				setLoading(false);
			}
		};

		if (wikiUrlName && currentUser) fetchWiki();
	}, [wikiUrlName, currentUser]);  
    
    useEffect(() => {
        if (!chatReady && wiki && currentUser) {
            setChatReady(true);
        }
    }, [wiki, currentUser, chatReady]);

    return (
        <>
            {/* Chat */}
		    {chatReady && wiki && currentUser && (<Chat
		    	wikiId={wiki._id}
		    	token={currentUser.accessToken}
		    />)}
        </>
    )
}