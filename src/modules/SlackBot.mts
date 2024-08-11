import { getOrganization } from "../api/HCB.mts";
import Module from "../types/Module.ts";
import Bolt, { AckFn, RespondFn, LogLevel as SlackLogLevel, SlashCommand } from "@slack/bolt";
import { numberWithCommas } from "../utils/MoneyUtils.ts";
import { LogLevel } from "../api/Logger.mts";
import HCBFetcher from "../core/HCBFetcher.mts";


export default class SlackBot extends Module {
    logLevel: LogLevel = SlackLogLevel.DEBUG;
    constructor({ organization, client }: { organization: string, client: HCBFetcher }) {
        super({ organization, client });
        this.id = "slackbot";
        this.multiHandler = true;
        this.logLevel = client.yamlConfig.Logging.Level as unknown as LogLevel as SlackLogLevel;
        if (!this.client.slackBot) {
            this.client.setSlackBot(new Bolt.App({
                token: this.client.yamlConfig.Slack.Tokens.Bot,
                signingSecret: this.client.yamlConfig.Slack.Secrets.Signing,
                socketMode: true, // add this
                appToken: this.client.yamlConfig.Slack.Tokens.App,
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
                    setLevel: () => { },
                    getLevel: () => { return this.logLevel; },
                    setName: () => { },
                },
            }));
    
            try {
                (this.client.slackBot as unknown as Bolt.App).start();
            } catch (error) {
                console.log(`${this.getLoggingPrefix("ERROR")} ${error}`);
            }
        }
    }
    
    async sendOutput(): Promise<any> {
        console.log(`${this.getLoggingPrefix("INFO")} SlackBot for ${this.client.organizations.length} organizations initialized`);
        this.setupSlack();
    }

    async setupSlack() {
        if (this.client.slackCommands.includes("/hcb")) return;
        this.client.slackCommands.push("/hcb");
        this.client.slackBot?.command("/hcb", async ({ command, ack, respond }) => {
            await ack();
            await respond({ replace_original: true, text: "Processing your command..." });
            console.log(`${this.getLoggingPrefix("SLACK")} Processing command: ${command.text}`);
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
                console.log(`${this.getLoggingPrefix("SLACK")} ${error}`) ;
                await respond({ replace_original: true,text: "An error occurred while processing your command." });
            }
        });
    }
}