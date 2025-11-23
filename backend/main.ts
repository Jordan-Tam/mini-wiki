import express from "express";
import { Log } from "./log.ts";
import cookieParser from "cookie-parser";
import { ServerConfig } from "./config/config.ts";
import { router as WikiRouter } from "./routes/wiki.ts";
import { Routes, SocketServer } from "./lib/ws/socket_server.ts";
import { ChatSocketRouter } from "./routes/socket/chat_router.ts";

async function Main(): Promise<any> {
    const APP = express();

    /**
     * Middleware
     */
    APP.use(express.json());
	APP.use(express.urlencoded({ extended: true }));
	APP.use(cookieParser());

    /**
     * Routes
     */
    APP.use("/wiki", WikiRouter);

    // Log if server boot worked
    const server = APP.listen(ServerConfig.port, (e) => {
        if(typeof e === "undefined") {
            Log(`I`, `Server started on port ${ServerConfig.port}`);
        } else {
            Log(`E`, `Server startup failed:`);
            Log(`E`, e);
            process.exit(1);
        }
    });

    /**
     * Setup socket server
     */
    const socket_routes:Routes = {
        "/wiki/:id/chat": ChatSocketRouter
    }
    await SocketServer(server, socket_routes);
}

Main();