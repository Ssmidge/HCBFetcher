import { getAllOrganizationTransactions, getOrganization } from "../api/HCB.mts";
import { getConfiguration } from "../api/YamlConfiguration.mts";
import { Organization, Transaction } from "./HCB.ts";

const config = await getConfiguration();

export default class Module implements IModule {
    id: string = Module.name;
    organization: string;
    protected async getHCBOrganization(): Promise<Organization> {
        return await getOrganization({ baseUrl: config.HCB.API.BaseUrl, organization: this.organization.toLowerCase() });
    }
    protected async getHCBOrganizationTransactions(): Promise<Transaction[]> {
        return await getAllOrganizationTransactions({ baseUrl: config.HCB.API.BaseUrl, organization: this.organization.toLowerCase() });
    }
    public async sendOutput(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    constructor(organization: string) {
        this.organization = organization;
    }
    
}

interface IModule {
    id: string;
    organization: string;
    sendOutput(): Promise<any>;
}