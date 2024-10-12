import { getAllOrganizationTransactions, getAllTransparentOrganizations, getCard, getOrganization, getTransaction } from "../api/HCB.mts";
import { getConfiguration } from "../api/ConfigurationLoader.mts";
import { Card, Organization, Transaction } from "./HCB.ts";
import { LogLevel } from "../api/Logger.mts";
import HCBFetcher from "../core/HCBFetcher.mts";

const config = getConfiguration();

export default class Module implements IModule {
    id: string = Module.name;
    organization: string;
    client: HCBFetcher;
    static multiHandler: boolean = false; // One handler per instance of per organization (Good for Slack stuff because of the ratelimits)
    multiHandler: boolean = false;

    // TODO: Implement EventEmitter for the app
    once: boolean = false;

    protected async getHCBOrganization(): Promise<Organization> {
        if (this.multiHandler) throw new Error("This module is not designed to be used with multiple handlers");
        else
            return await getOrganization({ baseUrl: config.HCB.API.BaseUrl, organization: this.organization, cache: this.client.cache });
    }
    protected async getHCBOrganizationTransactions(): Promise<Transaction[]> {
        if (this.multiHandler) throw new Error("This module is not designed to be used with multiple handlers");
        else
            return await getAllOrganizationTransactions({ baseUrl: config.HCB.API.BaseUrl, organization: this.organization, cache: this.client.cache });
    }
    // FIXME: Add a public utility class instead of having this in the Module class
    public async getOtherHCBOrganization(organization: string): Promise<Organization> {
        return await getOrganization({ baseUrl: config.HCB.API.BaseUrl, organization: organization, cache: this.client.cache });
    }
    public async getOtherHCBOrganizationTransactions(organization: string): Promise<Transaction[]> {
        return await getAllOrganizationTransactions({ baseUrl: config.HCB.API.BaseUrl, organization: organization, cache: this.client.cache });
    }
    public async getHCBTransaction(transactionId: string): Promise<Transaction> {
        return await getTransaction({ baseUrl: config.HCB.API.BaseUrl, transactionId, cache: this.client.cache });
    }
    public async getHCBCard(cardId: string): Promise<Card> {
        return await getCard({ baseUrl: config.HCB.API.BaseUrl, cardId, cache: this.client.cache });
    }
    public async getAllTransparentOrganizations(): Promise<Organization[]> {
        return await getAllTransparentOrganizations({ baseUrl: config.HCB.API.BaseUrl, cache: this.client.cache });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async sendOutput({ organizations }: { organizations?: string[] | undefined | null }): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
    protected log(level: LogLevel, message: string) {
        return this.client.logger.log({
            level,
            message,
            module: this.id,
        });
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
    sendOutput({ organizations }: { organizations: string[] | undefined | null }): Promise<unknown>;
}