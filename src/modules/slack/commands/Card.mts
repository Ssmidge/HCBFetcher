import HCBFetcher from "../../../core/HCBFetcher.mts";
import Command, { Argument } from "../../../types/slackbot/SlackCommand.mts";
import { App as BoltApp, RespondFn, SlashCommand } from "@slack/bolt";
import { numberWithCommas } from "../../../utils/MoneyUtils.ts";

export default class CardCommand extends Command {

    constructor(client: BoltApp, hcbClient: HCBFetcher) {
        super({
            subCommand: "hcb.card",
            description: "Returns information about a specific card, it won't show the last 4 digits though!",
            commandArguments: [
                {
                    name: "cardID",
                    description: "The API ID of the card to get information about.",
                    required: true,
                    type: "string",
                    example: "GDh8p2"
                }
            ],
            usage: "/hcb balance <cardID>",
            client,
            hcbClient
        });
    }

    async execute({ body }: { body: SlashCommand }, args: Argument[], respond: RespondFn) {
        const cardID = args.find((a) => a.name === "cardID")?.value as string;
        const errors: string[] = [];
        if (!cardID) errors.push("You must provide a card ID to fetch.");

        if (errors.length > 0) {
            await respond({
                text: errors.join("\n"),
                thread_ts: body.ts,
            });
            return;
        }


        const cardData = await this.getHCBCard(cardID.startsWith("crd_") ? cardID : `crd_${cardID}`);
        if (cardData.message) {
            await respond({
                replace_original: true,
                text: `${cardData.message}`
            });
            return;
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
    }

}