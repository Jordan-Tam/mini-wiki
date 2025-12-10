import express from "express";
import { Log } from "./log.ts";
import cookieParser from "cookie-parser";
import { ServerConfig } from "./config/config.ts";
import { router as WikiRouter } from "./routes/wikis.ts";
import { router as UserRouter } from "./routes/users.ts";
import SearchRouter from "./routes/search.ts";
import { Routes, SocketServer } from "./lib/ws/socket_server.ts";
import { ChatSocket } from "./routes/socket/chat_router.ts";
import cors from "cors";
import { admin } from "./lib/firebase/firebase.ts";

async function Main(): Promise<any> {
	const APP = express();

	/**
	 * Middleware
	 */
	APP.use(express.json());
	APP.use(express.urlencoded({ extended: true }));
	APP.use(cookieParser());
	APP.use(cors());

	/**
	 * Authentication Middleware
	 * Every request needs a token, which is parsed and decoded to create the user object
	 */

	APP.use(async (req, res, next) => {
		const token = req.headers.authorization?.split(" ")[1];
		if (token === "undefined" || !token) {
			console.log("no token");
			return res.status(401).json({
              error: "You must be logged in to perform this action.",
            });
		}
		try {
			const decodeValue = await admin.auth().verifyIdToken(token);
			if (decodeValue) {
				(req as any).user = decodeValue; //This is essentially req.session.user from 546
			}
			else{
				return res.status(401).json({
                	error: "Error verifying your account",
              });
			}
			return next();
		} catch (e) {
			return res.status(500).json({ message: "Internal Error" });
		}
	});

	/**
	 * Routes
	 */
	APP.use("/wiki", WikiRouter);
	APP.use("/users", UserRouter);
	APP.use("/search", SearchRouter);

	APP.get("/api/ping", (req, res) => {
		let response;
		let user = (req as any).user; //Checking if req.user exists
		if (!user) {
			response = { message: "You are not logged in" };
		} else {
			response = {
				message:
					"You are logged in. Here is your decoded userid: " + user.user_id
			};
		}
		return res.json(response);
	});

	/**
	 * Routes
	 */
	APP.use("/wiki", WikiRouter);

	// Log if server boot worked
	const server = APP.listen(ServerConfig.port, (e) => {
		if (typeof e === "undefined") {
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
	const socket_routes: Routes = {
		"/wiki/:id/chat/:usr": ChatSocket
	};
	await SocketServer(server, socket_routes);
}

Main();
