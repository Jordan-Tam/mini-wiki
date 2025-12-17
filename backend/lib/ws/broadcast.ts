import { WebSocket } from "ws";

export class Broadcaster {
    private sockets:{[key:string]: WebSocket} = {};

    constructor() {}

    public add = async(key:string, socket:WebSocket, overwrite?:boolean): Promise<string> => {
        if(!overwrite) {
            if(this.sockets[key]) {
                throw new Error(`Refusing to overwrite key ${key}, already exists.`);
            }
        }

        this.sockets[key] = socket;
        return key;
    }

    public remove = async(key:string): Promise<string> => {
        if(typeof this.sockets[key] === "undefined") {
            throw new Error(`Key ${key} not found.`);
        }

        delete this.sockets[key];
        return key;
    }

    public broadcast = async(message:any): Promise<void> => {
        for(const k of Object.keys(this.sockets)) {
            let s = this.sockets[k];
            if(s.readyState === s.OPEN) {
                s.send(message);
            }
        }
    }
}