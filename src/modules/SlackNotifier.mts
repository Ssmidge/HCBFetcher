import { getOrganization } from "../api/HCB.mts";
import Module from "../types/Module.ts";
import Bolt, { LogLevel as SlackLogLevel } from "@slack/bolt";
import { numberWithCommas } from "../utils/MoneyUtils.ts";
import { LogLevel } from "../api/Logger.mts";

let lastTransactionId : string = "";

export default class SlackNotifier extends Module {
    app: Bolt.App;
    logLevel: LogLevel = LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] as unknown as SlackLogLevel;
    constructor(organization: string) {
        super(organization);
        this.id = "slacknotif";
        this.app = new Bolt.App({
            token: process.env.SLACK_BOT_TOKEN,
            signingSecret: process.env.SLACK_SIGNING_SECRET,
            socketMode: true, // add this
            appToken: process.env.SLACK_APP_TOKEN,
            logLevel: this.logLevel,
            logger: {
                debug: (...msgs) => { 
                    if (this.logLevel == LogLevel.DEBUG)
                        console.log(`${this.getLoggingPrefix("DEBUG")} ${JSON.stringify(msgs)}`) 
                },
                info: (...msgs) => { 
                    if ([LogLevel.INFO, LogLevel.DEBUG, LogLevel.WARN, LogLevel.ERROR].includes(this.logLevel))
                        console.log(`${this.getLoggingPrefix("INFO")} ${JSON.stringify(msgs)}`) 
                },
                warn: (...msgs) => { 
                    if ([LogLevel.DEBUG, LogLevel.WARN, LogLevel.ERROR].includes(this.logLevel))
                        console.log(`${this.getLoggingPrefix("WARNING")} ${JSON.stringify(msgs)}`) 
                },
                error: (...msgs) => {
                    if ([LogLevel.DEBUG, LogLevel.ERROR].includes(this.logLevel))
                        console.log(`${this.getLoggingPrefix("SLACK")} ${JSON.stringify(msgs)}`) 
                },
                setLevel: (level) => { },
                getLevel: () => { return this.logLevel; },
                setName: (name) => { },
            },
        });

        this.app.start();
    }
    
    async sendOutput(): Promise<any> {
        this.setupSlack();
    }

    async setupSlack() {
        setInterval(async () => {
            const lastTransaction = (await this.getOtherHCBOrganizationTransactions('arcade')).filter((t) => t.type == "card_charge")[0];   
            if (lastTransactionId == lastTransaction.id) return;
            await this.app.client.chat.postMessage({
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