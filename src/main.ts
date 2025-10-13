import { config } from "dotenv";
import { existsSync, writeFileSync } from "fs";
import { Init_Server } from "./server";
import { failwith } from "./util.ts/common";
import { ENVTEMPLATE } from "./util.ts/strings/env_template";
import { HELP } from "./util.ts/strings/help";

export let Args:{
    port: number;
    help: boolean;
    env: string;
} = {
    port: 3000,
    help: false,
    env: "./.env"
}

// parse process args
for(let i=0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    const next = process.argv[i+1];

    switch (arg) {
        case "-P":
        case "--port": {
            if(!next || Number.isNaN(next)) {
                failwith(`Port must be an integer. Recieved: ${next}`);
            };

            let p = parseInt(next);

            if(p < 1) {
                failwith(`Port must be a positive non-zero number.`);
            }

            Args.port = p;
        } break;

        case "-h":
        case "--help": {
            Args.help = true;
        } break;

        case "--env": {
            if(typeof next !== "string") {
                failwith(`${arg} requires a valid file path.`);
            }

            Args.env = next;
        }
    }
}

/**
 * Main declaration
 * @param argc 
 * @param argv 
 */
async function Main(argc:number, argv: Array<string>) {
    /**
     * Print help
     */
    if(Args.help) {
        console.log(HELP);
        process.exit(0);
    }

    /**
     * Import environment
     */
    if(!existsSync(Args.env)) {
        writeFileSync(Args.env, ENVTEMPLATE);
    }

    // load env
    config({
        path: Args.env,
        quiet: true,
    });

    /**
     * Start server
     */
    await Init_Server();
}

/**
 * Run main
 */
Main(process.argv.length, process.argv);