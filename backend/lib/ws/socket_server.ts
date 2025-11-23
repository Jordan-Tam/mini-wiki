import { IncomingMessage, Server } from "http";
import { WebSocket, WebSocketServer } from "ws";

export interface Routes {
    [key:string]: SocketRouter
}

export interface SocketRouter {
    (socket:WebSocket, req:IncomingMessage, params:Params): any;
}

export interface Params {
    [key:string]:any;
}

const URL_DELIM = '/';

export async function SocketServer(server:Server, routes:{[key:string]: SocketRouter}): Promise<void> {
    // create socket server
    const wss = new WebSocket.Server({noServer: true});

    /**
     * Capture upgrade requests from http server
     */
    server.on('upgrade', (request, socket, head) => {
        // Authenticate or authorize the request if needed
        // For example, check request.headers.cookie or request.session

        wss.handleUpgrade(request, socket, head, ws => {
            wss.emit('connection', ws, request);
        });
    });

    /**
     * Handle new connections
     */
    wss.on("connection", async (socket, req) => {
        // do socket routing
        if(!req.url) {
            socket.close(1008, `No url provided.`);
            return;
        }

        // route the socket connection
        for(const schema of Object.keys(routes)) {
            let params = path_match_params(schema, req.url);

            // params will be null if the url does not match the schema
            if(params === null) {
                continue;
            } else {
                await routes[schema](socket, req, params);
            }
        }

        // if no matches, respond 404
        socket.send(`No matches for: ${req.url}`);
        socket.close(1008, `No matches for: ${req.url}`);
        return;
    })
}

/**
 * Express-style url params parser.
 * Accepts (/wiki/:id, /wiki/1) ==> {id: "1"}
 * @param schema 
 * @param url 
 * @returns 
 */
export function path_match_params(schema:string, url:string): Params | null {
    let url_sections = split_delim(url, URL_DELIM);
    let schema_sections = split_delim(schema, URL_DELIM);

    // test if url patterns match
    for(const index in schema_sections) {
        // dont test parameter sections
        if(!schema_sections[index].startsWith(':')) {
            if(!url_sections[index] || schema_sections[index] !== url_sections[index]) {
                return null;
            }
        }
    }

    // extract parameters based on url schema
    let params:Params = {};
    for(const index in schema_sections) {
        if(url_sections[index] && schema_sections[index].startsWith(':')) {
            params[schema_sections[index]] = url_sections[index];
        }
    }

    return params;
}

function split_delim(url:string, delim:string): Array<string> {
    return url.split(delim).filter((item) => {return item && item !== ''})
}