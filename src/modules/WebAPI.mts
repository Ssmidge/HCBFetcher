/* eslint-disable @typescript-eslint/no-unused-vars */
import { Bindings, ChildLoggerOptions } from "fastify/types/logger.js";
import HCBFetcher from "../core/HCBFetcher.mts";
import { Card, Organization, Transaction } from "../types/HCB.ts";
import Module from "../types/Module.ts";
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { LogLevel } from "../api/Logger.mts";

export default class WebAPI extends Module {
    static multiHandler: boolean = true;
    router: Fastify.FastifyInstance;
    constructor({ organization, client, isMultiHandler } : { organization: string, client: HCBFetcher, isMultiHandler?: boolean }) {
        super({ organization, client, isMultiHandler });
        this.id = "webapi";
        this.router = Fastify({ 
            // TODO: Implement custom logger (https://stackoverflow.com/a/55266062)
            logger: false,
        });
    }

    public async sendOutput() {
        await this.addRoutes();
        this.router.register(import("./WebAPI/index.mts"), {
            prefix: "/api/v1",
            webApi: this,
            organizations: this.client.organizations,
        });

        try {
            this.router.listen({ port: 3000 });
          } catch (err) {
            this.router.log.error(err);
            process.exit(1);
        }
    }
    private async addRoutes() {
        this.router.get('/', async (request : FastifyRequest, reply : FastifyReply) => {
            return {
                status: "OK",
                routes: [],
            };
        });

        this.router.get('/health', async (request : FastifyRequest, reply : FastifyReply) => {
            return {
                status: "OK",
                url: request.url,
            };
        });

        this.router.get('/repo', async (request : FastifyRequest, reply : FastifyReply) => reply.redirect("https://github.com/Ssmidge/HCBFetcher", 301));

        this.router.get('/modules', async (request : FastifyRequest, reply : FastifyReply) => {
            return {
                status: "OK",
                modules: this.client.moduleList.map((module) => {
                    return {
                        id: module.id,
                        organization: module.organization,
                    };
                }),
            };
        });
    }
}


// TODO: Try to fix this
class CustomFastifyLogger {
    args: any[];
    hcbClient: HCBFetcher;
    logLevel: LogLevel;
    constructor(hcbClient: HCBFetcher, ...args: any[]) {
        this.args = args;
        this.hcbClient = hcbClient;
        this.logLevel = hcbClient.logger.logLevel;
    }
    child(bindings: Bindings, options?: ChildLoggerOptions): Fastify.FastifyBaseLogger {
        throw new Error("Method not implemented.");
    }
    fatal(message: unknown, ...args: any[]): void { this.hcbClient.logger.error({ module: "webapi", message: String(message) }); }
    error(message: unknown, ...args: any[]): void { this.hcbClient.logger.error({ module: "webapi", message: String(message) }); }
    warn(message: unknown, ...args: any[]): void { this.hcbClient.logger.warn({ module: "webapi", message: String(message) }); }
    info(message: unknown, ...args: any[]): void { this.hcbClient.logger.info({ module: "webapi", message: String(message) }); }
    debug(message: unknown, ...args: any[]): void { this.hcbClient.logger.debug({ module: "webapi", message: String(message) }); }
    trace(message: unknown, ...args: any[]): void { this.hcbClient.logger.debug({ module: "webapi", message: String(message) }); }
    silent(message: unknown, ...args: any[]): void { this.hcbClient.logger.debug({ module: "webapi", message: String(message) }); }
    level = this.getLogLevel();

    private getLogLevel() {
        const level = this.logLevel;
        return level.toLowerCase();
    }


}

// Pino types
type Level = "fatal" | "error" | "warn" | "info" | "debug" | "trace";
type LevelOrString = Level | (string & {});
type LevelWithSilent = Level | "silent";
type LevelWithSilentOrString = LevelWithSilent | (string & {});