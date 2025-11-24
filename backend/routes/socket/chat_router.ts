import { SocketRouter } from "../../lib/ws/socket_server";
import { Broadcaster } from "../../lib/ws/broadcast";
import { MessageEvent } from "ws";

const chats:{[key:string]: Broadcaster} = {};

export const ChatSocket:SocketRouter = async(socket, req, params): Promise<void> => {
    let usr = params[":usr"];
    let id = params[":id"];

    /**
     * Create socket handlers
     */
    const _onclose = async() => {
        try {
            await chats[id].remove(usr);
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
        await chats[id].broadcast(`<${usr}>: ${String(message.data)}`);
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
    await chats[id].add(usr, socket, true);

    // send user join
    await chats[id].broadcast(`<${usr}> has joined the chat!`);
}