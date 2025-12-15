import type React from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

interface ChatParams {
    wikiId: string;
    token:string;
}

export interface ChatMessage {
    user: string;
    message: string;
}

const useWs = (url: string) => {
    const [message, setMessage] = useState<string | null>(null);
    const [opening, setOpening] = useState(true);
    const [open, setOpen] = useState(false);
    const [disconnected, setDisconnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const socket = useRef<WebSocket | null>(null);
  
    const send = (data: string) => {
        const ws = socket.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            throw new Error("Cannot send message to closed socket");
        }
        ws.send(data);
    };
  
    useEffect(() => {
        setOpening(true);
        setOpen(false);
        setDisconnected(false);
        setError(null);
    
        let ws: WebSocket;
        try {
            ws = new WebSocket(url);
        } catch (e) {
            setOpening(false);
            setError(String(e));
            return;
        }
  
        socket.current = ws;
  
        ws.onopen = () => {
            setOpening(false);
            setOpen(true);
        };
    
        ws.onclose = () => {
            setOpening(false);
            setOpen(false);
            setDisconnected(true);
        };
    
        ws.onerror = () => {
            setOpening(false);
            setOpen(false);
            setDisconnected(true);
            setError("error");
        };
  
      ws.onmessage = (msg) => setMessage(String(msg.data));
  
        return () => {
            ws.close();
        };
    }, [url]);
  
    return { message, opening, open, disconnected, error, send };
  };
  

  const Chat: React.FC<ChatParams> = ({ wikiId, token }) => {
    const url = useMemo(() => {
        const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
        return `${scheme}//${window.location.host}/chat/${wikiId}`;
    }, [wikiId]);
  
    const { message, opening, open, disconnected, error, send } = useWs(url);
  
    const [sentAuth, setSentAuth] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const textarea = useRef<HTMLTextAreaElement | null>(null);
  
    useEffect(() => {
        if (open && !error && !sentAuth) {
            send(token);
            setSentAuth(true);
        }
    }, [open, error, sentAuth, token, send]);
  
    // if wikiId changes, you're effectively connecting to a new room
    useEffect(() => {
        setSentAuth(false);
        setMessages([]);
    }, [wikiId]);
  
    useEffect(() => {
        if (message == null) return;
    
        let parsed: ChatMessage;
        try {
            parsed = JSON.parse(message);
        } catch {
            console.error("Chat:: Malformed message:", message);
            return;
        }
    
        if (typeof parsed.user !== "string" || typeof parsed.message !== "string") {
            console.error("Chat:: Malformed chat message object:", parsed);
            return;
        }
    
        setMessages((prev) => [...prev, parsed]);
    }, [message]);
  
    // send message handler
    const _send_message = () => {
        if(open) {
            let message = textarea.current?.value;
            if(!message || message.length < 1) {
                // dont sent empty message
                return;
            }

            console.log(`send:: ${message}`);
            send(message);
            textarea.current && (textarea.current.value = "");
        }
    }

    return (
        <div className="chat-container">
            {error ? (
            <p className="error">Error connecting chat {error}</p>
            ) : disconnected ? (
            <p>Chat disconnected</p>
            ) : opening ? (
            <p>Connecting...</p>
            ) : (
            <>
                <div className="chat-messages-box">
                {messages.map((m, i) => (
                    <div className="chat-message" key={i}>
                    <p className="chat-content">{`<${m.user}>: ${m.message}`}</p>
                    </div>
                ))}
                </div>

                <textarea ref={textarea} className="chat-text-box"/>
                <button className="chat-send-button" onClick={_send_message}>Send</button>
            </>
            )}
        </div>
    );
  };
  
  export default memo(Chat);
  