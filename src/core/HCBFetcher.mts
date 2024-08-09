import Bolt from "@slack/bolt";
import Module from "../types/Module.ts";
import SlackBot from "../modules/SlackBot.mts";
import Logging from "../modules/Logging.mts";
import SlackNotifier from "../modules/SlackNotifier.mts";
import EventEmitter from 'node:events';

export default class HCBFetcher {
    slackBot?: Bolt.App;
    slackCommands: string[] = [];
    organizations: string[];
    moduleList: Module[] = [];
    yamlConfig: any;
    private eventEmitter;

    constructor(organizations: string[], yamlConfig: any) {
        this.organizations = organizations;
        this.eventEmitter = new EventEmitter();
        this.yamlConfig = yamlConfig;
    }

    async initializeModules() {
        this.organizations.forEach((org) => {
            const moduleList = [Logging, SlackBot, SlackNotifier];
            moduleList.forEach((m : any) => {
                const module = m as typeof Module;
                // quick check to not instantiate multiple times the same module
                if (module.prototype.multiHandler && this.organizations.indexOf(org) == 0)
                    this.moduleList.push(new module({ organization: org, client: this, isMultiHandler: true }));
                else
                    this.moduleList.push(new module({ organization: org, client: this }));
                // this.moduleList.splice(this.moduleList.indexOf(m), 1);
            });
        });

        this.eventEmitter.emit("modulesInitialized", this, this.moduleList);
    }

    async runAllModules() {
        this.moduleList.forEach((module) => {
            if (module.multiHandler)
                module.sendOutput({ organizations: this.organizations });
            else
                module.sendOutput({});
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

    on(event: string, listener: (...args: any[]) => void) {
        this.eventEmitter.on(event, listener);
    }

    emit(event: string, ...args: any[]) {
        this.eventEmitter.emit(event, ...args);
    }

    once(event: string, listener: (...args: any[]) => void) {
        this.eventEmitter.once(event, listener);
    }

    off(event: string, listener: (...args: any[]) => void) {
        this.eventEmitter.off(event, listener);
    }

    removeAllListeners(event: string) {
        this.eventEmitter.removeAllListeners(event);
    }

    listeners(event: string) {
        return this.eventEmitter.listeners(event);
    }

    listenerCount(event: string) {
        return this.eventEmitter.listenerCount(event);
    }
}