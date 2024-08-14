import chalk, { Chalk } from "chalk";

export const sixteenColorChalk = new Chalk({level: 1});
export const customColorChalk = new Chalk({level: 3});

/*
TODO: Allow RGB **AND** HEX color support, currently only HEX.
*/
function getLoggingPrefix({ level = LogLevel.INFO, module = "system", customColor = undefined, highlight = false}: LoggingParams) : string {
    const logTypeColors = {
        "ERROR": sixteenColorChalk.red,
        "INFO": sixteenColorChalk.blue,
        "WARN": sixteenColorChalk.yellow,
        "DEBUG": sixteenColorChalk.gray.dim.dim,
    } as Record<LogLevel, (text: string) => string>;
    // "BALANCE": SixteenColorChalk.green,
    // "TRANSACTION": SixteenColorChalk.yellow,
    // "SLACK": SixteenColorChalk.magenta.dim,
    if (!customColor) {
        if (highlight)
            return chalk.bold(`[${logTypeColors[level](level)}] [${sixteenColorChalk.blue.dim(new Date().toLocaleString())}] [${sixteenColorChalk.magenta.dim(module.toUpperCase())}]`);
        else
            return `[${logTypeColors[level](level)}] [${sixteenColorChalk.blue.dim(new Date().toLocaleString())}] [${sixteenColorChalk.magenta.dim(module.toUpperCase())}]`;
    } else {
        if (highlight)
            return chalk.bold(`[${customColorChalk.bgHex(customColor)}] [${customColorChalk.blue.dim(new Date().toLocaleString())}] [${customColorChalk.magenta.dim(module.toUpperCase())}]`);
        else
            return `[${customColorChalk.bgHex(customColor)}] [${customColorChalk.blue.dim(new Date().toLocaleString())}] [${customColorChalk.magenta.dim(module.toUpperCase())}]`;
    }

}

export class Logger {

    logLevel: LogLevel;

    constructor(logLevel: LogLevel) {
        this.logLevel = logLevel;
    }

    info({ module = "system", message = "" }: { module: string, message: string }) {
        if (![LogLevel.INFO, LogLevel.DEBUG, LogLevel.WARN, LogLevel.ERROR].includes(this.logLevel)) return;
        this.log({ level: LogLevel.INFO, message, module, highlight: false });
    }
    error({ module = "system", message = "" }: { module: string, message: string }) {
        if (![LogLevel.DEBUG, LogLevel.ERROR].includes(this.logLevel)) return;
        this.log({ level: LogLevel.ERROR, message, module, highlight: false });
    }
    warn({ module = "system", message = "" }: { module: string, message: string }) {
        if (![LogLevel.DEBUG, LogLevel.WARN, LogLevel.ERROR].includes(this.logLevel)) return;
        this.log({ level: LogLevel.WARN, message, module, highlight: false });
    }
    debug({ module = "system", message = "" }: { module: string, message: string }) {
        if (this.logLevel != LogLevel.DEBUG) return;
        this.log({ level: LogLevel.DEBUG, message, module, highlight: false });    }

    log({ module = "system", level = LogLevel.INFO, message = "", highlight = false }: { module: string, level: LogLevel, message: any, highlight?: boolean }) {
        try {
            if (JSON.parse(message)) {
                const parsedJSON = JSON.parse(message);
                if (!Array.isArray(parsedJSON)) return;
                message = (parsedJSON as Array<unknown>).join(" - ");
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch(ignored) { /* empty */ }
        console.log(getLoggingPrefix({ module, level, highlight }), message);
    }
    
}

type LoggingParams = {
    module: string;
    level: LogLevel;
    customColor?: HEX; //  | RGBColorCode; // TODO: Look at previous TODO.
    highlight?: boolean;
}

type HEX = `#${string}`;

// TODO: Look at top level TODO.
// type RGBColorCode = {
//     red: number;
//     green: number;
//     blue: number;
//     alpha?: number;
// }


export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
}