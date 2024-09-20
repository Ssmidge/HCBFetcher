import Module from "../types/Module.ts";
import Bolt, { LogLevel as SlackLogLevel } from "@slack/bolt";
import { numberWithCommas } from "../utils/MoneyUtils.ts";
import { LogLevel } from "../api/Logger.mts";
import HCBFetcher from "../core/HCBFetcher.mts";
import Handler from "../types/slackbot/SlackHandler.mts";
import { CommandHandler } from "./slack/handlers/CommandHandler.mts";
import BalanceCommand from "./slack/commands/Balance.mts";

export default class SlackBot extends Module {
    static multiHandler: boolean = true;
    handlers: Handler[] = [];
    logLevel: LogLevel = LogLevel.DEBUG;
    constructor({ organization, client, isMultiHandler } : { organization: string, client: HCBFetcher, isMultiHandler?: boolean }) {
        super({ organization, client, isMultiHandler });
        this.id = "slackbot";
        this.logLevel = LogLevel[client.yamlConfig.Logging.Level as keyof typeof LogLevel];
        if (!this.client.slackBot) {
            this.client.setSlackBot(new Bolt.App({
                token: this.client.yamlConfig.Slack.Tokens.Bot,
                signingSecret: this.client.yamlConfig.Slack.Secrets.Signing,
                socketMode: true, // add this
                appToken: this.client.yamlConfig.Slack.Tokens.App,
                logLevel: this.logLevel.toLowerCase() as SlackLogLevel,
                logger: {
                    debug: (...msgs) => {
                        if ([LogLevel.DEBUG].includes(this.logLevel))
                            this.log(LogLevel.DEBUG, JSON.stringify(msgs));
                    },
                    info: (...msgs) => { 
                        if ([LogLevel.INFO, LogLevel.DEBUG, LogLevel.WARN, LogLevel.ERROR].includes(this.logLevel))
                            this.log(LogLevel.INFO, JSON.stringify(msgs));
                    },
                    warn: (...msgs) => { 
                        if ([LogLevel.DEBUG, LogLevel.WARN, LogLevel.ERROR].includes(this.logLevel))
                            this.log(LogLevel.WARN, JSON.stringify(msgs));
                    },
                    error: (...msgs) => {
                        if ([LogLevel.DEBUG, LogLevel.ERROR].includes(this.logLevel))
                            this.log(LogLevel.ERROR, JSON.stringify(msgs));
                    },
                    setLevel: () => { },
                    getLevel: () => { return this.client.logger.logLevel.toLocaleLowerCase() as SlackLogLevel; },
                    setName: () => { },
                },
            }));    
        }
    }
    
    async sendOutput() {
        (this.client.slackBot as unknown as Bolt.App).start();
        this.client.slackCommands.push(new BalanceCommand(this.client.slackBot as Bolt.App, this.client));
        this.handlers.push(new CommandHandler(this.client.slackBot as Bolt.App, this.client));
        this.log(LogLevel.INFO, `SlackBot for ${this.client.organizations.length} organizations initialized`);
        this.handlers.forEach((handler) => handler.handle());
        // this.setupSlack();
    }

    async setupSlack() {
        // if (this.client.slackCommands.find((c) => c.name.toLowerCase() === "hcb")) return;
        // this.client.slackCommands.push("/hcb");
        this.client.slackBot?.command("/hcb", async ({ command, ack, respond }) => {
            await ack();
            await respond({ replace_original: true, text: "Processing your command..." });
            try {
                const subCommand = command.text.split(" ")[0];
                switch (subCommand) {
                    case "balance": {
                        if (!command.text.split(" ")[1] || command.text.split(" ")[1]?.length < 1) {
                            await respond({ replace_original: true, text: "Please provide an organization name." });
                            break;
                        }
                        const orgName = command.text.split(" ")[1];
                        const organizationData = await this.getOtherHCBOrganization(orgName);
                       if (organizationData.message) {
                        await respond({
                            replace_original: true,
                            text: `${organizationData.message}`
                        });
                        } else if (organizationData.balances) {
                            await respond({
                                replace_original: true,
                                text: `${organizationData.name} has a balance of ${numberWithCommas(organizationData.balances.balance_cents / 100)} USD`
                            });
                        }
                        break;
                    }
                    case "tx": {
                        if (!command.text.split(" ")[1] || command.text.split(" ")[1]?.length < 1) {
                            await respond({ replace_original: true, text: "Please provide a transaction id." });
                            break;
                        }
                        const transactionID = command.text.split(" ")[1];
                        const transactionData = await this.getHCBTransaction(transactionID.startsWith("txn_") ? transactionID : `txn_${transactionID}`);

                        if (transactionData.message) {
                            await respond({
                                replace_original: true,
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

                            await respond({
                                replace_original: true,
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
                            await respond({ replace_original: true, text: "Please provide a card id." });
                            break;
                        }
                        const cardID = command.text.split(" ")[1];
                        const cardData = await this.getHCBCard(cardID.startsWith("crd_") ? cardID : `crd_${cardID}`);
                        if (cardData.message) {
                            await respond({
                                replace_original: true,
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

                        await respond({
                            replace_original: true,
                            mrkdwn: true,
                            parse: "none",
                            text: fields.join("\n"),
                        });
                        break;
                    }
                    // arav asked for it :)
                    case "org": {
                        if (!command.text.split(" ")[1] || command.text.split(" ")[1]?.length < 1) {
                            await respond({ replace_original: true, text: "Please provide a organization slug." });
                            break;
                        }

                        const organizationSlug = command.text.split(" ")[1];
                        const organizationData = await this.getOtherHCBOrganization(organizationSlug);

                        if (organizationData.message)
                            return await respond({
                                replace_original: true,
                                text: `${organizationData.message}`
                            });

                        const fields = [];

                        if (organizationData.name) fields.push(`*Name*: ${organizationData.name}`);
                        if (organizationData.slug) fields.push(`*Slug*: ${organizationData.slug}`);
                        if (organizationData.category) fields.push(`*Category*: ${organizationData.category.substring(0, 1).toUpperCase() + organizationData.category.slice(1)}`);
                        if (organizationData.balances) fields.push(`*Balance*: ${numberWithCommas(organizationData.balances.balance_cents / 100)} USD`);
                        if (organizationData.donation_link) fields.push(`*Donation Link*: ${organizationData.donation_link}`);
                        if (organizationData.website) fields.push(`*Website*: ${organizationData.website}`);
                        if (organizationData.users) fields.push(`*Users*: ${organizationData.users.map((u) => u.full_name).join(", ")}`);
                        
                        await respond({
                            replace_original: true,
                            mrkdwn: true,
                            parse: "none",
                            text: fields.join("\n"),
                        });
                        break;
                    }
                    case "transactions": {
                        if (!command.text.split(" ")[1] || command.text.split(" ")[1]?.length < 1) {
                            await respond({ replace_original: true, text: "Please provide a organization slug." });
                            break;
                        }

                        const organizationSlug = command.text.split(" ")[1];
                        const organizationTransactions = await this.getOtherHCBOrganizationTransactions(organizationSlug);

                        if (typeof organizationTransactions === 'object' && 'message' in organizationTransactions) {
                            await respond({
                                replace_original: true,
                                text: `${(organizationTransactions as any).message}`
                            });
                            break;
                        }

                        const fields: string[] = [];

                        organizationTransactions.forEach((transaction) => {
                            if (transaction.id) fields.push(`*Transaction ID*: <https://hcb.hackclub.com/hcb/${transaction.id.split("txn_")[1]}|${transaction.id}>`);
                            if (transaction.date) fields.push(`*Date*: ${transaction.date}`);
                            if (transaction.memo) fields.push(`*Memo*: ${transaction.memo}`);
                            if (transaction.amount_cents) fields.push(`*Balance Change*: ${transaction.amount_cents < 0 ? "-" : "+"}$${numberWithCommas(Math.abs(transaction.amount_cents / 100))}`);
                            const user = transaction.card_charge?.user || transaction.ach_transfer?.user || transaction.check?.user || transaction.donation?.user || transaction.invoice?.user || transaction.transfer?.user;
                            if (user) fields.push(`*User*: ${user.full_name}`);
                            const status = transaction.ach_transfer?.status || transaction.check?.status || transaction.donation?.status || transaction.invoice?.status || transaction.transfer?.status || (transaction.pending ? "Pending" : null) || (transaction.card_charge ? transaction.pending ? "Pending" : "Completed" : null);
                            if (status) fields.push(`*Status*: ${status.substring(0, 1).toUpperCase()}${status.substring(1)}`);
                            fields.push("");
                        });

                        await respond({
                            replace_original: true,
                            mrkdwn: true,
                            parse: "none",
                            text: fields.join("\n"),
                        });
                        break;
                    }
                    case "help": {
                        await respond({
                            replace_original: true,
                            text: "```/hcb balance <organization> - Get the balance of an organization\n/hcb tx <transaction id> - Get the details of a transaction\n/hcb card <card id> - Get information about a specific card.\n/hcb help - Get help```"
                        });
                        break;
                    }
                    default: {
                        await respond({
                            replace_original: true,
                            text: "Invalid subcommand"
                        });
                    }
                };
            } catch (error) {
                this.log(LogLevel.ERROR, `Error processing command: ${error}`);
                await respond({ replace_original: true,text: "An error occurred while processing your command." });
            }
        });
    }
}