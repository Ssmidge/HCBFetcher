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
    private eventEmitter;

    constructor(organizations: string[]) {
        this.organizations = organizations;
        this.eventEmitter = new EventEmitter();
    }

    async initializeModules() {
        this.organizations.forEach((org) => {
            [Logging, SlackBot, SlackNotifier].forEach((m : any) => {
                const module = m as typeof Module;
                // this.moduleList.splice(this.moduleList.indexOf(m), 1);
                this.moduleList.push(new module({ organization: org, client: this }));
            });
        });
    }

    async runAllModules() {
        this.moduleList.forEach((module) => {
            module.sendOutput();
        });
    }

    setSlackBot(slackBot: Bolt.App) {
        this.slackBot = slackBot;
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