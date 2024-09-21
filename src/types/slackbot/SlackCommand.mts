import { App as BoltApp, Context, RespondFn, SlashCommand } from "@slack/bolt";
import HCBFetcher from "../../core/HCBFetcher.mts";
import { getAllOrganizationTransactions, getCard, getOrganization, getTransaction } from "../../api/HCB.mts";
import { Card, Organization, Transaction } from "../HCB.ts";
import { getConfiguration } from "../../api/ConfigurationLoader.mts";

const config = getConfiguration();

export default abstract class Command {
    name?: string;
    subCommand?: string;
    description: string;
    commandArguments: Argument[] = [];
    usage: string = `/command ${this.commandArguments.join(" ")}`;
    client: BoltApp;
    hcbClient: HCBFetcher;
    constructor ({ name, subCommand, description, usage, commandArguments, client, hcbClient } : { name?: string, subCommand?: string, description: string, usage?: string, commandArguments?: Argument[], client: BoltApp, hcbClient: HCBFetcher }) {
        if (name) this.name = name;
        if (subCommand) this.subCommand = subCommand;
        if (subCommand) this.name = subCommand.split(".")[1];
        this.description = description;
        if (usage) this.usage = usage;
        else this.usage = `${this.name} ${this.commandArguments.join(" ")}`;
        if (commandArguments) this.commandArguments = commandArguments;
        this.client = client;
        this.hcbClient = hcbClient;
    }

    get getName() {
        return this.name;
    }
    get getDescription() {
        return this.description;
    }
    get getUsage() {
        return this.usage;
    }
    get getCommandArguments() {
        return this.commandArguments;
    }

    abstract execute({ context, body, command }: { context: Context; body: SlashCommand; command: SlashCommand; }, args: Argument[], respond: RespondFn): Promise<void>;

    protected async getOtherHCBOrganization(organization: string): Promise<Organization> {
        return await getOrganization({ baseUrl: config.HCB.API.BaseUrl, organization: organization.toLowerCase(), cache: this.hcbClient.cache });
    }
    protected async getOtherHCBOrganizationTransactions(organization: string): Promise<Transaction[]> {
        return await getAllOrganizationTransactions({ baseUrl: config.HCB.API.BaseUrl, organization: organization.toLowerCase(), cache: this.hcbClient.cache });
    }
    protected async getHCBTransaction(transactionId: string): Promise<Transaction> {
        return await getTransaction({ baseUrl: config.HCB.API.BaseUrl, transactionId, cache: this.hcbClient.cache });
    }
    protected async getHCBCard(cardId: string): Promise<Card> {
        return await getCard({ baseUrl: config.HCB.API.BaseUrl, cardId, cache: this.hcbClient.cache });
    }
}

export type Argument = {
    name: string;
    description: string;
    required: boolean;
    type: string;
    example: string;
    value?: string;
}