import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ChatParams {
    wikiId: string;
    userId: string;
}

export interface ChatMessage {
    user: string;
    message: string;
}

const useWs = (url:URL) => {
    // states
    const [message, setMessage] = useState<any>(null);
    const [opening, setOpening] = useState<boolean>(true);
    const [disconnected, setDisconnected] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const socket = useRef<WebSocket>(null);

    useEffect(() => {
        try {
            socket.current = new WebSocket(url);
        } catch (e) {
            setOpening(false);
            return setError(String(e));
        }

        socket.current.onopen = (ev) => {
            setOpening(false);
        }

        socket.current.onclose = (ev) => {
            setOpening(false);
            setDisconnected(true);
        }

        socket.current.onerror = (ev) => {
            setDisconnected(true);
            setOpening(false);
            setError("error");
        }

        socket.current.onmessage = (msg) => {
            setMessage(msg.data);
        }
    }, [url]);

    return { message, opening, disconnected, error };
}

export const Chat:React.FC<ChatParams> = ({
    wikiId,
    userId
}: ChatParams) => {
    let url;
    let url_str = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/wiki/${wikiId}/chat`;
    try {
        url = new URL(url_str);
    } catch (e) {
        console.error(`Chat:: Invalid URL: ${url_str}`);
        return (<p className="error">Invalid URL</p>);
    }

    // connect ws
    const { message, opening, disconnected, error } = useWs(url);

    // store messages
    let messages = new Array<ChatMessage>();
    useEffect(() => {
        let parse = {} as ChatMessage;
        try {
            parse = JSON.parse(String(message)) as ChatMessage;
        } catch (e) {
            return console.error(`Chat:: Malformed message:`, message);
        }

        if(typeof parse.user !== "string" || typeof parse.message !== "string") {
            return console.error(`Chat:: Malformed chat message object:`, message);
        }

        messages.push(message);
    }, [message]);

    return (
        <div className="chat-container">
            { error
                ? <p className="error">Error connecting chat {error}</p>
                : (
                    disconnected
                    ? <p>Chat disconnected</p>
                    : (
                        opening
                        ? <p>Connecting...</p>
                        : (
                            <>
                                <div className="chat-messages-box">
                                    {messages.map((m) => {
                                        // message card
                                        return (
                                            <div className="chat-message">
                                                <p className="chat-username">{m.user}</p>
                                                <p className="chat-content">{m.message}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="chat-text-box"></div>
                            </>
                        )
                    )
                )
            }
        </div>
    );
}