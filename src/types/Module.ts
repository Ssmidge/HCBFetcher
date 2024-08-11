import chalk from "chalk";
import { getAllOrganizationTransactions, getCard, getOrganization, getTransaction } from "../api/HCB.mts";
import { getConfiguration } from "../api/ConfigurationLoader.mts";
import { Card, Organization, Transaction } from "./HCB.ts";
import { getLoggingPrefix, LogType } from "../api/Logger.mts";
import HCBFetcher from "../core/HCBFetcher.mts";

const config = getConfiguration();

export default class Module implements IModule {
    id: string = Module.name;
    organization: string;
    client: HCBFetcher;
    multiHandler: boolean = false; // One handler per instance of per organization (Good for Slack stuff because of the ratelimits)

    // TODO: Implement EventEmitter for the app
    once: boolean = false;

    protected async getHCBOrganization(): Promise<Organization> {
        if (this.multiHandler) throw new Error("This module is not designed to be used with multiple handlers");
        else
            return await getOrganization({ baseUrl: config.HCB.API.BaseUrl, organization: this.organization.toLowerCase() });
    }
    protected async getHCBOrganizationTransactions(): Promise<Transaction[]> {
        if (this.multiHandler) throw new Error("This module is not designed to be used with multiple handlers");
        else
            return await getAllOrganizationTransactions({ baseUrl: config.HCB.API.BaseUrl, organization: this.organization.toLowerCase() });
    }
    protected async getOtherHCBOrganization(organization: string): Promise<Organization> {
        return await getOrganization({ baseUrl: config.HCB.API.BaseUrl, organization: organization.toLowerCase() });
    }
    protected async getOtherHCBOrganizationTransactions(organization: string): Promise<Transaction[]> {
        return await getAllOrganizationTransactions({ baseUrl: config.HCB.API.BaseUrl, organization: organization.toLowerCase() });
    }
    protected async getHCBTransaction(transactionId: string): Promise<Transaction> {
        return await getTransaction({ baseUrl: config.HCB.API.BaseUrl, transactionId });
    }
    protected async getHCBCard(cardId: string): Promise<Card> {
        return await getCard({ baseUrl: config.HCB.API.BaseUrl, cardId });
    }
    public async sendOutput({ organizations }: { organizations?: string[] | undefined | null }): Promise<any> {
        throw new Error("Method not implemented.");
    }
    protected getLoggingPrefix(type : LogType) : string {
        return getLoggingPrefix({ module: this.id, type });
    }

    constructor({ organization, client, isMultiHandler } : { organization: string, client: HCBFetcher, isMultiHandler?: boolean }) {
        this.organization = organization;
        this.client = client;
        if (isMultiHandler) {
            this.multiHandler = true;
            this.organization = "all";
        }
    }
    
}

interface IModule {
    id: string;
    organization: string;
    sendOutput({ organizations }: { organizations: string[] | undefined | null }): Promise<any>;
}