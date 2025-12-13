import { MessageEvent } from "ws";
import user_data_functions from "../../data/users";
import { Broadcaster } from "../../lib/ws/broadcast";
import { SocketRouter } from "../../lib/ws/socket_server";

const chats:{[key:string]: Broadcaster} = {};

export const ChatSocket:SocketRouter = async(socket, req, params): Promise<void> => {
    let id = params[":id"];

    /**
     * Check user is logged in / exists
     */
    let fb_user_id = (req as any).user?.uid;
    if(!fb_user_id) {
        return socket.close(1008, `You must be logged in to connect to chat.`);
    }
    
    let user = await user_data_functions.getUserByFirebaseUID(fb_user_id);
    if(!user) {
        return socket.close(1008, `User not found.`);
    }

    let user_id = user._id;
    let username = user.username;

    /**
     * Create socket handlers
     */
    const _onclose = async() => {
        try {
            await chats[id].remove(user_id);
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
        await chats[id].broadcast(`<${username}>: ${String(message.data)}`);
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

    // add user to broadcaster
    await chats[id].add(user_id, socket, true);

    // send user join
    await chats[id].broadcast(`<${username}> has joined the chat!`);
}