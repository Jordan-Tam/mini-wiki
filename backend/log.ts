
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

    let log_backend = type === `E` ? console.error : console.log

    log_backend(`${chalk.gray(`[${date}]`)} [${type_string}]${debug ? `(${chalk.yellow("DEBUG")})` : ``}:`, message);
}