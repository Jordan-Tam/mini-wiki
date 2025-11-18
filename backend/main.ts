import express from "express";
import { Log } from "./log.ts";
import { ServerConfig } from "./config/config.ts";

async function Main(): Promise<any> {
    const APP = express();

    /**
     * Middleware
     */
    

    /**
     * Routes
     */
    

    APP.listen((e) => {
        if(typeof e === "undefined") {
            Log(`I`, `Server started on port ${ServerConfig.port}`);
        } else {
            Log(`E`, `Server startup failed:`);
            Log(`E`, e);
            process.exit(1);
        }
    })
}

Main();