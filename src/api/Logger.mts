import chalk, { Chalk } from "chalk";

const SixteenColorChalk = new Chalk({level: 1});
const customColorChalk = new Chalk({level: 3});

export type LogType = "BALANCE" | "TRANSACTION" | "ERROR" | "INFO" | "WARNING" | "SLACK" | "DEBUG";

/*
TODO: Allow RGB **AND** HEX color support, currently only HEX.
*/
export function getLoggingPrefix({ type = "INFO", module = "system", customColor = undefined, highlight = false, }: LoggingParams) : string {
    const logTypeColors = {
        "BALANCE": SixteenColorChalk.green,
        "TRANSACTION": SixteenColorChalk.yellow,
        "ERROR": SixteenColorChalk.red,
        "INFO": SixteenColorChalk.blue,
        "WARNING": SixteenColorChalk.yellow,
        "SLACK": SixteenColorChalk.magenta.dim,
        "DEBUG": SixteenColorChalk.gray.dim.dim,
    } as Record<LogType, (text: string) => string>;
    if (!customColor) {
        if (highlight)
            return chalk.bold(`[${logTypeColors[type](type)}] [${SixteenColorChalk.blue.dim(new Date().toLocaleString())}] [${SixteenColorChalk.magenta.dim(module.toUpperCase())}]`);
        else
            return `[${logTypeColors[type](type)}] [${SixteenColorChalk.blue.dim(new Date().toLocaleString())}] [${SixteenColorChalk.magenta.dim(module.toUpperCase())}]`;
    } else {
        if (highlight)
            return chalk.bold(`[${customColorChalk.bgHex(customColor)}] [${customColorChalk.blue.dim(new Date().toLocaleString())}] [${customColorChalk.magenta.dim(module.toUpperCase())}]`);
        else
            return `[${customColorChalk.bgHex(customColor)}] [${customColorChalk.blue.dim(new Date().toLocaleString())}] [${customColorChalk.magenta.dim(module.toUpperCase())}]`;
    }

}

// TODO: Add custom logging commands too, instead of using console.log in the modules.

type LoggingParams = {
    module: string;
    type: LogType;
    customColor?: string; //  | RGBColorCode; // TODO: Look at previous TODO.
    highlight?: boolean;
}

type RGBColorCode = {
    red: number;
    green: number;
    blue: number;
    alpha?: number;
}

export enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}