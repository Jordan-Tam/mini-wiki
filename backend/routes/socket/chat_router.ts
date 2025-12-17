import { MessageEvent } from "ws";
import user_data_functions from "../../data/users";
import { Broadcaster } from "../../lib/ws/broadcast";
import { SocketRouter } from "../../lib/ws/socket_server";
import { admin } from "../../lib/firebase/firebase"

const chats:{[key:string]: Broadcaster} = {};

interface FirebaseDecodedUser {
    iss: string,
    aud: string,
    auth_time: number,
    user_id: string,
    sub: string,
    iat: number,
    exp: number,
    email: string,
    email_verified: boolean,
    firebase: { identities: { email: Array<string> }, sign_in_provider: string },
    uid: string;
}

export const ChatSocket:SocketRouter = async(socket, req, params): Promise<void> => {
    let id = params[":id"];
    let auth_recieved = false;

    console.log(`got connection to wiki: ${id}`);

    let user_id:string | null = null;
    let username: string | null = null;

    /**
     * Create socket handlers
     */
    const _onclose = async() => {
        try {
            user_id && await chats[id].remove(user_id);
        } catch (e) {
            // user removed elsewhere?
        }

        await _dropEventListeners();
    }

    const _onerror = async(e:unknown) => {
        _onclose();
    }

    // message handler
    // right now it's just direct forwarding
    // will need to add XSS and other protections
    const _onmessage = async(message:MessageEvent) => {
        // if auth not recieved, test against firebase and get user info. else send
        if(auth_recieved) {
            let parsed;
            try {
                parsed = JSON.parse(message.data.toString()) as {msgid?: string; message?:string};
                if(!parsed.message || !parsed.msgid) {
                    socket.send(`Malformed message (missing fields).`);
                    return;
                }
            } catch (e) {
                socket.send(`Malformed message. Expected JSON.`);
                return;
            }

            username && await chats[id].broadcast(JSON.stringify({
                user: username,
                message: String(parsed.message),
                msgid: parsed.msgid
            }));
        } else {
            /**
             * Check user is logged in / exists
             */
            let token = message.data.toString();
            let decoded;
            try {
                decoded = await admin.auth().verifyIdToken(token) as FirebaseDecodedUser;
            } catch (e) {
                // invalid token or auth failed
                socket.send(`Authorization failed: ${e}`);
                socket.close(1008);
                return;
            }

            if(!decoded.uid) {
                console.log(`disconnect:: no user id`)
                socket.send(`You must be logged in to connect to chat.`);
                return socket.close(1008);
            }
            
            let user;
            try {
                user = await user_data_functions.getUserByFirebaseUID(decoded.uid);
                if(!user) {
                    console.log(`disconnect:: user not found`);
                    socket.send(`User not found.`);
                    return socket.close(1008);
                }
            } catch (e) {
                socket.send(JSON.stringify({error: `User not found.`}));
                socket.close(1008);
                return;
            }

            user_id = user._id as string;
            username = user.username as string;

            // add user to broadcaster
            try {
                await chats[id].add(user_id, socket, true);
            } catch (e) {
                socket.send(JSON.stringify({error: `Failed to join chatroom: ${e}`}));
                socket.close(1008);
                return;
            }
                
            // send user join
            await chats[id].broadcast(JSON.stringify({user: "[SERVER]", message: `${username} has joined the chat!`}));

            auth_recieved = true;
        }
    }

    const _dropEventListeners = async() => {
        socket.removeAllListeners();
    }

    // register event handlers
    socket.addEventListener("close", _onclose);
    socket.addEventListener("error", _onerror);
    socket.addEventListener("message", _onmessage);

    // validate id
    if(Number.isNaN(parseInt(id))) {
        socket.send(`Invalid id: ${id}`);
        socket.close(1008, `Invalid id: ${id}`);
        return;
    }

    // create broadcaster
    if(typeof chats[id] === "undefined") {
        chats[id] = new Broadcaster();
    }
}