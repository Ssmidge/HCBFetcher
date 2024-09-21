import HCBFetcher from "../../../core/HCBFetcher.mts";
import Command, { Argument } from "../../../types/slackbot/SlackCommand.mts";
import { App as BoltApp, RespondFn, SlashCommand } from "@slack/bolt";
import { numberWithCommas } from "../../../utils/MoneyUtils.ts";

export default class TransactionsCommand extends Command {

    constructor(client: BoltApp, hcbClient: HCBFetcher) {
        super({
            subCommand: "hcb.transactions",
            description: "Gets the last 15 transactions for a specific organization.",
            commandArguments: [
                {
                    name: "organization",
                    description: "The organization to get the transactions for.",
                    required: true,
                    type: "string",
                    example: "arav"
                }
            ],
            usage: "/hcb transactions <organization>",
            client,
            hcbClient
        });
    }

    async execute({ body }: { body: SlashCommand }, args: Argument[], respond: RespondFn) {
        const organization = args.find((a) => a.name === "organization")?.value as string;
        const errors: string[] = [];
        if (!organization) errors.push("You must provide an organization to check the balance of.");

        if (errors.length > 0) {
            await respond({
                text: errors.join("\n"),
                thread_ts: body.ts,
            });
            return;
        }


        const organizationTransactions = await this.getOtherHCBOrganizationTransactions(organization);

        if (typeof organizationTransactions === 'object' && 'message' in organizationTransactions) {
            await respond({
                replace_original: true,
                text: `${(organizationTransactions as { message: string }).message}`
            });
            return;
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
    }

}