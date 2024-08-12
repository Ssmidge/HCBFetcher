import Module from "../types/Module.ts";
import { numberWithCommas } from "../utils/MoneyUtils.ts";
import HCBFetcher from "../core/HCBFetcher.mts";
import { Transaction } from "../types/HCB.ts";
import { CacheName } from "../types/Cache.mts";

export default class SlackNotifier extends Module {
    constructor({ organization, client }: { organization: string, client: HCBFetcher }) {
        super({ organization, client });
        this.id = "slacknotif";
        this.multiHandler = true;
    }
    
    async sendOutput({ organizations }: { organizations?: string[] | undefined | null }): Promise<any> {
        if (!organizations) throw new Error("No organizations provided");
        this.setupSlack(organizations);
    }

    async setupSlack(orgNames: string[]) {
        console.log(`${this.getLoggingPrefix("INFO")} SlackNotifier for ${this.client.organizations.length} organizations initialized`);
        const execute = async () => {
            const messageQueue: string[][] = [];
            for (const org of orgNames) {
                const lastTransaction = (await this.getOtherHCBOrganizationTransactions(org)).filter((t: Transaction) => (!t.memo.toLowerCase().includes("fiscal sponsorship for") || !t.memo) && t.amount_cents != 0.00)[0];
                if (!lastTransaction) continue;
                if (await this.client.cache.has(CacheName.LastTransactions, org) && await this.client.cache.get(CacheName.LastTransactions, org) == lastTransaction.id) continue;
                const text = [];
                if (lastTransaction.id) text.push(`<https://hcb.hackclub.com/hcb/${lastTransaction.id.split("txn_")[1]}|*NEW TRANSACTION*>`);
                if (lastTransaction.organization?.name) text.push(`*Organization*: ${lastTransaction.organization.name}`);
                if (lastTransaction.date) text.push(`*Date*: ${lastTransaction.date}`);
                if (lastTransaction.memo) text.push(`*Memo*: ${lastTransaction.memo}`);
                if (lastTransaction.amount_cents) text.push(`*Balance Change*: ${lastTransaction.amount_cents < 0 ? "-" : "+"}$${numberWithCommas(Math.abs(lastTransaction.amount_cents / 100))}`);
                if (lastTransaction.card_charge?.user.full_name) text.push(`*User*: ${lastTransaction.card_charge?.user.full_name}`);
                if (lastTransaction.ach_transfer?.status || lastTransaction.check?.status || lastTransaction.donation?.status || lastTransaction.invoice?.status || lastTransaction.transfer?.status || lastTransaction.pending) {
                    const statusText : string = lastTransaction.ach_transfer?.status || lastTransaction.check?.status || lastTransaction.donation?.status || lastTransaction.invoice?.status || lastTransaction.transfer?.status || (lastTransaction.pending ? "pending" : null) || "";
                    if (statusText) text.push(`*Status*: ${statusText.substring(0, 1).toUpperCase()}${statusText.substring(1)}`);
                }
                messageQueue.push(text);
                await this.client.cache.set(CacheName.LastTransactions, org, lastTransaction.id);
            }
            
            if (messageQueue.length >= this.client.organizations.length) {
                await this.client.slackBot?.client.chat.postMessage({
                    channel: this.client.yamlConfig.Slack.Channels.TransactionTracker as string,
                    mrkdwn: true,
                    parse: "none",
                    text: messageQueue.map((m) => m.join("\n")).join("\n\n"),
                });
                
                this.client.emit("slackNotifierExecuted", this, messageQueue);
                // Reset the message queue
                messageQueue.splice(0, messageQueue.length);
            }
        };
        await execute();
        setInterval(execute, 5 * 60 * 1000);
    }
}