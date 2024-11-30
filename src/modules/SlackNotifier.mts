import Module from "../types/Module.ts";
import { numberWithCommas } from "../utils/MoneyUtils.ts";
import HCBFetcher from "../core/HCBFetcher.mts";
import { Transaction } from "../types/HCB.ts";
import { CacheExpiration, CacheName } from "../types/Cache.mts";
import { LogLevel } from "../api/Logger.mts";

export default class SlackNotifier extends Module {
    static multiHandler: boolean = true;
    constructor({ organization, client, isMultiHandler } : { organization: string, client: HCBFetcher, isMultiHandler?: boolean }) {
        super({ organization, client, isMultiHandler });
        this.id = "slacknotif";
    }
    
    async sendOutput({ organizations }: { organizations?: string[] | undefined | null }) {
        if (!organizations) throw new Error("No organizations provided");
        this.setupSlack(organizations);
    }

    async setupSlack(orgNames: string[]) {
        this.log(LogLevel.INFO, `SlackNotifier for ${this.client.organizations.length} organizations initialized`);
        const execute = async () => {
            const messageQueue: string[][] = [];
            for (const org of orgNames) {
                (await this.getOtherHCBOrganizationTransactions(org)).filter((t: Transaction) => (!t.memo.toLowerCase().includes("fiscal sponsorship for") || !t.memo) && t.amount_cents != 0.00).forEach(async (lastTransaction: Transaction) => {
                    if (!lastTransaction?.id) return;
                    if ((await this.client.cache.get(CacheName.LastTransactions, lastTransaction.id)) === "true") return;
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
                    await this.client.cache.set(CacheName.LastTransactions, lastTransaction.id, "true", CacheExpiration.NEVER);
                });
            }

            if (messageQueue.length >= 1) {
                const splitArrays = messageQueue.reduce((resultArray: string[][][], item, index) => { 
                    const chunkIndex = Math.floor(index / 10);
                    if (!resultArray[chunkIndex]) {
                        resultArray[chunkIndex] = [];
                    }
                    resultArray[chunkIndex].push(item);
                    return resultArray;
                }, []);
            
                for (const messages of splitArrays) {
                    await this.client.slackBot?.client.chat.postMessage({
                        channel: this.client.yamlConfig.Slack.Channels.TransactionTracker as string,
                        mrkdwn: true,
                        parse: "none",
                        text: messages.map((m) => m.join("\n")).join("\n\n"),
                    });
                }
                
                this.client.emit("slackNotifierExecuted", this, messageQueue);
                // Reset the message queue
                messageQueue.splice(0, messageQueue.length);
            }
        };
        await execute();
        setInterval(execute, 1 * 60 * 1000);
    }
}