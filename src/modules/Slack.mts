import { getOrganization } from "../api/HCB.mts";
import Module from "../types/Module.ts";
import Bolt from "@slack/bolt";
import { numberWithCommas } from "../utils/MoneyUtils.ts";

let lastTransactionId : string = "";

export default class SlackBot extends Module {
    app: Bolt.App;
    constructor(organization: string) {
        super(organization);
        this.id = "slackbot";
        this.app = new Bolt.App({
            token: process.env.SLACK_BOT_TOKEN,
            signingSecret: process.env.SLACK_SIGNING_SECRET,
            socketMode: true, // add this
            appToken: process.env.SLACK_APP_TOKEN // add this
        });

        this.app.start();
    }
    
    async sendOutput(): Promise<any> {
        this.setupSlack();
    }

    async setupSlack() {
        this.app.message("ssmidgetestabc123", async ({ message }) => {
        });
        
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
        }, 5 * 60 * 1000);

        this.app.command("/hcb", async ({ command, ack, client }) => {
            try {
                const subCommand = command.text.split(" ")[0];
                switch (subCommand) {
                    case "balance": {
                       const orgName = command.text.split(" ")[1];
                          const organizationData = await this.getOtherHCBOrganization(orgName);
                       if (organizationData.message) {
                        await client.chat.postEphemeral({
                            channel: command.channel_id,
                            user: command.user_id,
                            text: `${organizationData.message}`
                        });
                        } else if (organizationData.balances) {
                            await client.chat.postEphemeral({
                                channel: command.channel_id,
                                user: command.user_id,
                                text: `${organizationData.name} has a balance of ${numberWithCommas(organizationData.balances.balance_cents / 100)} USD`
                            });
                        }
                        break;
                    }
                    default: {
                        await ack();
                        await client.chat.postEphemeral({
                            channel: command.channel_id,
                            user: command.user_id,
                            text: "Invalid subcommand"
                        });
                    }
                };
                await ack();
            } catch (error) {
                console.log("err")
                console.error(error);
            }
        });
    }
}