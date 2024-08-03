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
                        if (!command.text.split(" ")[1] || command.text.split(" ")[1]?.length < 1) {
                            await client.chat.postEphemeral({ channel: command.channel_id, user: command.user_id, text: "Please provide an organization name." });
                            break;
                        }
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
                    case "tx": {
                        if (!command.text.split(" ")[1] || command.text.split(" ")[1]?.length < 1) {
                            await client.chat.postEphemeral({ channel: command.channel_id, user: command.user_id, text: "Please provide a transaction id." });
                            break;
                        }
                        const transactionID = command.text.split(" ")[1];
                        const transactionData = await this.getHCBTransaction(transactionID.startsWith("txn_") ? transactionID : `txn_${transactionID}`);

                        if (transactionData.message) {
                            await client.chat.postEphemeral({
                                channel: command.channel_id,
                                user: command.user_id,
                                text: `${transactionData.message}`
                            });
                        } else {
                            const fields = [];
                            if(transactionData.date) fields.push(`*Date*: ${transactionData.date}`);
                            if(transactionData.memo) fields.push(`*Memo*: ${transactionData.memo}`);
                            if(transactionData.amount_cents) fields.push(`*Balance Change*: ${numberWithCommas(transactionData.amount_cents / 100)} USD`);
                            if(transactionData.organization) fields.push(`*Organization*: <https://hcb.hackclub.com/${transactionData.organization.slug}|${transactionData.organization.name}>`);
                            if(transactionData.organization?.balances) fields.push(`*Organization Balance*: ${numberWithCommas(transactionData.organization.balances.balance_cents / 100)} USD`);
                            if(transactionData.card_charge?.user || transactionData.ach_transfer?.user || transactionData.check?.user || transactionData.donation?.user || transactionData.invoice?.user || transactionData.transfer?.user) fields.push(`*User*: ${transactionData.card_charge?.user.full_name || transactionData.ach_transfer?.user.full_name || transactionData.check?.user.full_name || transactionData.donation?.user.full_name || transactionData.invoice?.user.full_name || transactionData.transfer?.user.full_name || "Unknown"}`);
                            if(transactionData.card_charge?.card?.name) fields.push(`*Card*: ${transactionData.card_charge.card.name}`);
                            if(transactionData.comments) fields.push(`*Comments*: ${transactionData.comments.count}`);

                            await client.chat.postEphemeral({
                                channel: command.channel_id,
                                user: command.user_id,
                                mrkdwn: true,
                                parse: "none",
                                // I wanted to try another way of adding each field because I felt like it
                                text: fields.join("\n"),
                            });
                        }
                        break;
                    }
                    case "card": {
                        if (!command.text.split(" ")[1] || command.text.split(" ")[1]?.length < 1) {
                            await client.chat.postEphemeral({ channel: command.channel_id, user: command.user_id, text: "Please provide a card id." });
                            break;
                        }
                        const cardID = command.text.split(" ")[1];
                        const cardData = await this.getHCBCard(cardID.startsWith("crd_") ? cardID : `crd_${cardID}`);
                        if (cardData.message) {
                            await client.chat.postEphemeral({
                                channel: command.channel_id,
                                user: command.user_id,
                                text: `${cardData.message}`
                            });
                            break;
                        }

                        const fields = [];
                        // feeling fancy so I'm making the type and status uppercase on the first letter
                        if (cardData.name) fields.push(`*Name*: ${cardData.name}`);
                        if (cardData.type) fields.push(`*Type*: ${cardData.type.charAt(0).toUpperCase() + cardData.type.slice(1)}`);
                        if (cardData.status) fields.push(`*Status*: ${cardData.status.charAt(0).toUpperCase() + cardData.status.slice(1)}`);
                        if (cardData.owner) fields.push(`*Owner*: ${cardData.owner.full_name}`);
                        if (cardData.organization) fields.push(`*Organization*: <https://hcb.hackclub.com/${cardData.organization.slug}|${cardData.organization.name}>`);
                        if (cardData.issued_at) {
                            const date = new Date(cardData.issued_at);
                            fields.push(`*Issued At*: ${date.toDateString()} ${date.toTimeString()}`);
                        }
                        if (cardData.organization.balances) fields.push(`*Organization Balance*: ${numberWithCommas(cardData.organization.balances.balance_cents / 100)} USD`);

                        await client.chat.postEphemeral({
                            channel: command.channel_id,
                            user: command.user_id,
                            mrkdwn: true,
                            parse: "none",
                            text: fields.join("\n"),
                        });
                        break;
                    }
                    case "help": {
                        await client.chat.postEphemeral({
                            channel: command.channel_id,
                            user: command.user_id,
                            text: "```/hcb balance <organization> - Get the balance of an organization\n/hcb tx <transaction id> - Get the details of a transaction\n/hcb card <card id> - Get information about a specific card.\n/hcb help - Get help```"
                        });
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