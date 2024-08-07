import chalk from "chalk";
import { getAllOrganizationTransactions, getCard, getOrganization, getTransaction } from "../api/HCB.mts";
import { getConfiguration } from "../api/YamlConfiguration.mts";
import { Card, Organization, Transaction } from "./HCB.ts";
import { getLoggingPrefix, LogType } from "../api/Logger.mts";
import HCBFetcher from "../core/HCBFetcher.mts";

const config = await getConfiguration();

export default class Module implements IModule {
    id: string = Module.name;
    organization: string;
    client: HCBFetcher;

    // TODO: Implement EventEmitter for the app
    once: boolean = false;

    protected async getHCBOrganization(): Promise<Organization> {
        return await getOrganization({ baseUrl: config.HCB.API.BaseUrl, organization: this.organization.toLowerCase() });
    }
    protected async getHCBOrganizationTransactions(): Promise<Transaction[]> {
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
    public async sendOutput(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    protected getLoggingPrefix(type : LogType) : string {
        return getLoggingPrefix({ module: this.id, type });
    }

    constructor({ organization, client } : { organization: string, client: HCBFetcher }) {
        this.organization = organization;
        this.client = client;
    }
    
}

interface IModule {
    id: string;
    organization: string;
    sendOutput(): Promise<any>;
}