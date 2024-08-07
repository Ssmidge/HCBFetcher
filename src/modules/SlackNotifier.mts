import { getOrganization } from "../api/HCB.mts";
import Module from "../types/Module.ts";
import Bolt, { LogLevel as SlackLogLevel } from "@slack/bolt";
import { numberWithCommas } from "../utils/MoneyUtils.ts";
import { LogLevel } from "../api/Logger.mts";
import HCBFetcher from "../core/HCBFetcher.mts";

let lastTransactionId : string = "";

export default class SlackNotifier extends Module {
    logLevel: LogLevel = LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] as unknown as SlackLogLevel;
    constructor({ organization, client }: { organization: string, client: HCBFetcher }) {
        super({ organization, client });
        this.id = "slacknotif";
    }
    
    async sendOutput(): Promise<any> {
        this.setupSlack();
    }

    async setupSlack() {
        console.log(`${this.getLoggingPrefix("INFO")} SlackNotifier for ${this.organization} initialized`);
        setInterval(async () => {
            const lastTransaction = (await this.getHCBOrganizationTransactions()).filter((t) => t.type == "card_charge")[0];   
            if (lastTransactionId == lastTransaction.id) return;
            await this.client.slackBot?.client.chat.postMessage({
                channel: process.env.SLACK_CHANNEL as string,
                token: process.env.SLACK_BOT_TOKEN,
                mrkdwn: true,
                parse: "none",
                text: `
                <https://hcb.hackclub.com/hcb/${lastTransaction.id.split("txn_")[1]}|*NEW TRANSACTION*>
*Date*: ${lastTransaction.date}
*Memo*: ${lastTransaction.memo}
*Balance Change*: $${numberWithCommas(lastTransaction.amount_cents / 100)}
*User*: ${lastTransaction.card_charge?.user.full_name}
                `
            });
            lastTransactionId = lastTransaction.id;
        }, 5 * 60 * 1000);
    }
}