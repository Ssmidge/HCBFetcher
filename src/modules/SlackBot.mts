import Module from "../types/Module.ts";
import Bolt, { LogLevel as SlackLogLevel } from "@slack/bolt";
import { LogLevel } from "../api/Logger.mts";
import HCBFetcher from "../core/HCBFetcher.mts";
import Handler from "../types/slackbot/SlackHandler.mts";
import { CommandHandler } from "./slack/handlers/CommandHandler.mts";
import BalanceCommand from "./slack/commands/Balance.mts";
import TransactionCommand from "./slack/commands/Transaction.mts";
import CardCommand from "./slack/commands/Card.mts";
import OrganizationCommand from "./slack/commands/Organization.mts";
import TransactionsCommand from "./slack/commands/Transactions.mts";

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
        this.setupSlack();
        this.log(LogLevel.INFO, `SlackBot for ${this.client.organizations.length} organizations initialized`);
        this.handlers.forEach((handler) => handler.handle());
    }

    async setupSlack() {
        this.client.slackCommands.push(
            ...[
                new CardCommand(this.client.slackBot as Bolt.App, this.client),
                new BalanceCommand(this.client.slackBot as Bolt.App, this.client),
                new TransactionCommand(this.client.slackBot as Bolt.App, this.client),
                new OrganizationCommand(this.client.slackBot as Bolt.App, this.client),
                new TransactionsCommand(this.client.slackBot as Bolt.App, this.client),
            ]
        );
        this.handlers.push(new CommandHandler(this.client.slackBot as Bolt.App, this.client));
    }
}