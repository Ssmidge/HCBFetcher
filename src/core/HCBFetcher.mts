import Bolt from "@slack/bolt";
import Module from "../types/Module.ts";
import EventEmitter from 'node:events';
import { Cache } from "../types/Cache.mts";
import { RedisCache } from "../api/RedisCache.mts";
import { Config } from "../types/Configuration.ts";
import { Logger, LogLevel } from "../api/Logger.mts";
import Command from "../types/slackbot/SlackCommand.mts";

export default class HCBFetcher {
    private eventEmitter;
    slackBot?: Bolt.App;
    slackCommands: Command[] = [];
    organizations: string[];
    modulesToRun: typeof Module[] = [];
    moduleList: Module[] = [];
    yamlConfig: Config;
    cache: Cache;
    logger: Logger;

    constructor(organizations: string[], yamlConfig: Config, modules: typeof Module[], cacheType: typeof Cache = RedisCache) {
        this.organizations = organizations;
        this.eventEmitter = new EventEmitter();
        this.yamlConfig = yamlConfig;
        this.modulesToRun = modules;
        this.cache = new cacheType(this);
        this.logger = new Logger(this.yamlConfig.Logging.Level as LogLevel);
    }

    async initializeModules() {
        this.organizations.forEach((org) => {
            this.modulesToRun.forEach((module : typeof Module) => {
                if (module.multiHandler) {
                    if (this.organizations.indexOf(org) != 0) return;
                    try {
                        this.moduleList.push(new module({ organization: "all", client: this, isMultiHandler: true }));
                    } catch(e) {
                        const error: Error = e as Error;
                        this.logger.error({
                            module: module.name,
                            message: error.message,
                        });
                    }
                } else {
                    try {
                        this.moduleList.push(new module({ organization: org, client: this }));
                    } catch (e) {
                        const error: Error = e as Error;
                        this.logger.error({
                            module: module.name,
                            message: error.message,
                        });
                    }
                }
            });
        });

        this.eventEmitter.emit("modulesInitialized", this, this.moduleList);
    }

    async runAllModules() {
        // keep only one organization for multiHandler modules
        const filteredModules = this.moduleList.filter((module) => module.multiHandler)
        // we keep one org per module, so no like 4 slacknotifiers with each one having a different org
        .filter((module, index, self) => self.findIndex((m) => m.constructor.name === module.constructor.name) === index);
        this.moduleList.forEach((module) => {
            if (!module.multiHandler) {
                try {
                    module.sendOutput({});
                    this.eventEmitter.emit("moduleExecuted", this, module);
                } catch (e) {
                    const error: Error = e as Error;
                    this.logger.error({
                        module: module.id,
                        message: error.message,
                    });
                }
            }
        });
        filteredModules.forEach((module) => {
            module.organization = "all";
            try {
                module.sendOutput({ organizations: this.organizations });
                this.eventEmitter.emit("moduleExecuted", this, module);
            } catch(e) {
                const error: Error = e as Error;
                this.logger.error({
                    module: module.id,
                    message: error.message,
                });
            }
        });

        this.eventEmitter.emit("modulesExecuted", this, this.moduleList);
    }

    setSlackBot(slackBot: Bolt.App) {
        this.slackBot = slackBot;
        this.eventEmitter.emit("slackBotSet", this, this.slackBot);
    }

    /**
     * Passing through the event emitter, got inspired by Discord.js, also makes the code A LOT more readable imo
     * @date today (7/8/2024, DD/MM/YYYY)
     */

    on(event: HCBEvent, listener: (...args: unknown[]) => void) {
        this.eventEmitter.on(event, listener);
    }

    emit(event: HCBEvent, ...args: unknown[]) {
        this.eventEmitter.emit(event, ...args);
    }

    once(event: HCBEvent, listener: (...args: unknown[]) => void) {
        this.eventEmitter.once(event, listener);
    }

    off(event: HCBEvent, listener: (...args: unknown[]) => void) {
        this.eventEmitter.off(event, listener);
    }

    removeAllListeners(event: HCBEvent) {
        this.eventEmitter.removeAllListeners(event);
    }

    listeners(event: HCBEvent) {
        return this.eventEmitter.listeners(event);
    }

    listenerCount(event: HCBEvent) {
        return this.eventEmitter.listenerCount(event);
    }
}

type HCBEvent = "modulesInitialized" | "moduleExecuted" | "modulesExecuted" | "slackBotSet" | "cacheReady" | "cacheDisconnect" | "cacheError" | "loggingExecuted" | "slackNotifierExecuted";