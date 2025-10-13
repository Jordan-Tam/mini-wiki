import express from "express";
import { Args } from "./main";
import { failwith } from "./util.ts/common";
import { Log } from "./util.ts/log";

export async function Init_Server(): Promise<any> {
    const APP = express();
    
    // default route fo now
    APP.route("/")
        .all(async(req,res) => {
            return res.status(200).send(`:3`);
        })

    APP.listen(Args.port, (e) => {
        if(!e) {
            /**
             * Started successfully
             */
            Log(`I`, `Server started on port: ${String(Args.port)}`);
        } else {
            Log(`E`, `Server failed to start.`);
            failwith(e);
        }
    })
}