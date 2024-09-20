import HCBFetcher from "../../../core/HCBFetcher.mts";
import Command, { Argument } from "../../../types/slackbot/SlackCommand.mts";
import { App as BoltApp, RespondFn, SlashCommand } from "@slack/bolt";

export default class BalanceCommand extends Command {

    constructor(client: BoltApp, hcbClient: HCBFetcher) {
        super({
            subCommand: "hcb.balance",
            description: "Checks the balance of a specific HCB organization.",
            commandArguments: [
                {
                    name: "organization",
                    description: "The organization to check the balance of.",
                    required: true,
                    type: "string",
                    example: "weliketocodestuff"
                }
            ],
            usage: "/balance <organization>",
            client,
            hcbClient
        });
    }

    async execute({ body }: { body: SlashCommand }, args: Argument[], respond: RespondFn) {
        console.log(args);
        // const organization = args.find((a) => a.name === "organization")?.value;
        const errors: string[] = [];
        // if (!organization) errors.push("You must provide an organization to check the balance of.");

        if (errors.length > 0) {
            await respond({
                text: errors.join("\n"),
                thread_ts: body.ts,
            });
            return;
        }
    }

}