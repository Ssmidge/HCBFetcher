import Module from "../types/Module.ts";
import { numberWithCommas } from "../utils/MoneyUtils.ts";

export default class Logging extends Module {
    constructor(organization: string) {
        super(organization);
        this.id = "Logging";
    }

    async sendOutput(): Promise<any> {
        const organizationData = await this.getHCBOrganization();
        
        setInterval(async () => {
            const lastTransactions = await this.getHCBOrganizationTransactions();
            const lastTransaction = lastTransactions.filter((t) => t.type == "card_charge")[0];
            if (!lastTransaction) return;
            console.log(`The last transaction for ${organizationData.name} was a ${lastTransaction.amount_cents < 0 ? 'debit' : 'credit'} of $${numberWithCommas(lastTransaction.amount_cents / 100)}`);
        }, 5 * 60 * 1000);
        return null;
    }
}