import { IncomingMessage } from "http";
import { SocketRouter } from "../../lib/ws/socket_server";

export const ChatSocketRouter:SocketRouter = async(socket, req, params): Promise<void> => {
    socket.send(`On wiki: ${params[":id"]}`);
    socket.close();
}