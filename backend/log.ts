
import chalk from "chalk";
import { ServerConfig } from "./config/config.ts";
type LogClass = "I" | "W" | "E";

export function Log(type:LogClass, message:any, debug?:boolean): void {
    // setup date string
    let date = new Date().toISOString();

    // set up type
    let type_string = type === 'I'
        ? chalk.green(`I`)
        : type === "E"
            ? chalk.red(`E`)
            : chalk.yellow(`W`);

    if(debug && !ServerConfig.debugLogs) {
        return;
    }

    console.log(`${chalk.gray(`[${date}]`)} [${type_string}]${debug ? `(${chalk.yellow("DEBUG")})` : ``}:`, message);
}