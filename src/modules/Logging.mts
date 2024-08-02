import { organizationCache } from "../api/Caching.mts";
import Module from "../types/Module.ts";

export default class Logging extends Module {
    constructor(organization: string) {
        super(organization);
        this.id = "Logging";
    }

    async sendOutput(): Promise<any> {
        const organizationData = await this.getHCBOrganization();
        // console.log(`Balance for ${organizationData.name} is ${organizationData.balances.balance_cents / 100} USD`);
        return null;
    }
}