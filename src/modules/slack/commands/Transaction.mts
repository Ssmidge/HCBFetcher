import HCBFetcher from "../../../core/HCBFetcher.mts";
import Command, { Argument } from "../../../types/slackbot/SlackCommand.mts";
import { App as BoltApp, RespondFn, SlashCommand } from "@slack/bolt";
import { numberWithCommas } from "../../../utils/MoneyUtils.ts";

export default class TransactionCommand extends Command {

    constructor(client: BoltApp, hcbClient: HCBFetcher) {
        super({
            subCommand: "hcb.tx",
            description: "Gets information about a specific transaction.",
            commandArguments: [
                {
                    name: "transactionId",
                    description: "The ID of the transaction to get information about.",
                    required: true,
                    type: "string",
                    example: "1234567890"
                }
            ],
            usage: "/hcb tx <txID>",
            client,
            hcbClient
        });
    }

    async execute({ body }: { body: SlashCommand }, args: Argument[], respond: RespondFn) {
        const transactionID = args.find((a) => a.name === "transactionId")?.value as string;
        const errors: string[] = [];
        if (!transactionID) errors.push("You must provide a transaction ID to fetch.");

        if (errors.length > 0) {
            await respond({
                text: errors.join("\n"),
                thread_ts: body.ts,
            });
            return;
        }


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
    }

}