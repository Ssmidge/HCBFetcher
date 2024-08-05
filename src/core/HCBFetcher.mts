import Bolt from "@slack/bolt";
import Module from "../types/Module.ts";

export default class HCBFetcher {
    slackBot: Bolt.App | undefined;
    organization: string;
    moduleList: Module[] = [];

    constructor(organization: string) {
        this.organization = organization;
    }

    async initializeModules() {
        this.moduleList.forEach((m : any) => {
            const module = m as typeof Module;
            this.moduleList.splice(this.moduleList.indexOf(m), 1);
            this.moduleList.push(new module(this.organization));
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
}