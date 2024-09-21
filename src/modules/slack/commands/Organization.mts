import HCBFetcher from "../../../core/HCBFetcher.mts";
import Command, { Argument } from "../../../types/slackbot/SlackCommand.mts";
import { App as BoltApp, RespondFn, SlashCommand } from "@slack/bolt";
import { numberWithCommas } from "../../../utils/MoneyUtils.ts";

export default class OrganizationCommand extends Command {

    constructor(client: BoltApp, hcbClient: HCBFetcher) {
        super({
            subCommand: "hcb.org",
            description: "Returns general information about a specific organization.",
            commandArguments: [
                {
                    name: "organization",
                    description: "The organization to check the balance of.",
                    required: true,
                    type: "string",
                    example: "weliketocodestuff"
                }
            ],
            usage: "/hcb org <organization>",
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


        const organizationData = await this.getOtherHCBOrganization(organization);

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
    }

}