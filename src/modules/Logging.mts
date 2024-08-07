import HCBFetcher from "../core/HCBFetcher.mts";
import Module from "../types/Module.ts";
import { numberWithCommas } from "../utils/MoneyUtils.ts";

export default class Logging extends Module {
    constructor({ organization, client }: { organization: string, client: HCBFetcher }) {
        super({ organization, client });
        this.id = "Logging";
    }

    async sendOutput(): Promise<any> {
        const organizationData = await this.getHCBOrganization();
        const lastTransactions = await this.getHCBOrganizationTransactions();
        const lastTransaction = lastTransactions[0];
        if (!lastTransaction) return;

        console.log(`${this.getLoggingPrefix("BALANCE")} The balance of ${organizationData.name} is $${numberWithCommas(organizationData.balances.balance_cents / 100)}`);
        console.log(`${this.getLoggingPrefix("TRANSACTION")} The last transaction for ${organizationData.name} was a ${lastTransaction.amount_cents < 0 ? 'debit' : 'credit'} of $${numberWithCommas(Math.abs(lastTransaction.amount_cents / 100))}`);
        
        
        setInterval(async () => {
            const lastTransactions = await this.getHCBOrganizationTransactions();
            const lastTransaction = lastTransactions.filter((t) => t.type == "card_charge")[0];
            if (!lastTransaction) return;
            console.log(`${this.getLoggingPrefix("TRANSACTION")} The last transaction for ${organizationData.name} was a ${lastTransaction.amount_cents < 0 ? 'debit' : 'credit'} of $${numberWithCommas(Math.abs(lastTransaction.amount_cents / 100))}`);
        }, 5 * 60 * 1000);
        return null;
    }
}