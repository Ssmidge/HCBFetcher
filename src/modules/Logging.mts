import { LogLevel, sixteenColorChalk } from "../api/Logger.mts";
import HCBFetcher from "../core/HCBFetcher.mts";
import { Transaction } from "../types/HCB.ts";
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
        this.log(LogLevel.INFO, `[${sixteenColorChalk.yellow("TRANSACTION")}${sixteenColorChalk.reset()}] The last transaction for ${organizationData.name} was a ${lastTransaction.amount_cents < 0 ? 'debit' : 'credit'} of $${numberWithCommas(Math.abs(lastTransaction.amount_cents / 100))}`);
        this.client.emit("loggingExecuted", this, lastTransaction);
        
        
        setInterval(async () => {
            lastTransactions = await this.getHCBOrganizationTransactions();
            lastTransaction = lastTransactions.filter((t: Transaction) => (!t.memo.toLowerCase().includes("fiscal sponsorship for") || !t.memo) && t.amount_cents != 0.00)[0];
            if (!lastTransaction) return;
            this.log(LogLevel.INFO, `The last transaction for ${organizationData.name} was a ${lastTransaction.amount_cents < 0 ? 'debit' : 'credit'} of $${numberWithCommas(Math.abs(lastTransaction.amount_cents / 100))}`);
            this.client.emit("loggingExecuted", this, lastTransaction);
        }, 5 * 60 * 1000);
        return null;
    }
}