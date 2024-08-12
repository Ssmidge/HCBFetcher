import HCBFetcher from "../core/HCBFetcher.mts";
import Module from "../types/Module.ts";
import { numberWithCommas } from "../utils/MoneyUtils.ts";

export default class Logging extends Module {
    constructor({ organization, client, isMultiHandler } : { organization: string, client: HCBFetcher, isMultiHandler?: boolean }) {
        super({ organization, client, isMultiHandler });
        this.id = "Logging";
    }

    async sendOutput(): Promise<any> {
        const organizationData = await this.getHCBOrganization();
        let lastTransactions = await this.getHCBOrganizationTransactions();
        let lastTransaction = lastTransactions[0];
        if (!lastTransaction) return;

        // console.log(`${this.getLoggingPrefix("BALANCE")} The balance of ${organizationData.name} is $${numberWithCommas(organizationData.balances.balance_cents / 100)}`);
        console.log(`${this.getLoggingPrefix("TRANSACTION")} The last transaction for ${organizationData.name} was a ${lastTransaction.amount_cents < 0 ? 'debit' : 'credit'} of $${numberWithCommas(Math.abs(lastTransaction.amount_cents / 100))}`);
        this.client.emit("loggingExecuted", this, lastTransaction);
        
        
        setInterval(async () => {
            lastTransactions = await this.getHCBOrganizationTransactions();
            lastTransaction = lastTransactions.filter((t) => t.type == "card_charge")[0];
            if (!lastTransaction) return;
            console.log(`${this.getLoggingPrefix("TRANSACTION")} The last transaction for ${organizationData.name} was a ${lastTransaction.amount_cents < 0 ? 'debit' : 'credit'} of $${numberWithCommas(Math.abs(lastTransaction.amount_cents / 100))}`);
            this.client.emit("loggingExecuted", this, lastTransaction);
        }, 5 * 60 * 1000);
        return null;
    }
}