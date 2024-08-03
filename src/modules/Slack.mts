import { getOrganization } from "../api/HCB.mts";
import Module from "../types/Module.ts";
import Bolt from "@slack/bolt";

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
        
        this.app.message(async ({ message, say }) => {
            console.log(message);
            // await this.app.client.chat.postMessage({
            //     channel: "C07EKVDS5B8",
            //     token: process.env.SLACK_BOT_TOKEN,
            //     text: "Hello, world!" 
            // });
        });
    }

    async sendOutput(): Promise<any> {

        this.app.command("/hcb-test", async ({ command, ack, client }) => {
            try {
                const orgName = command.text;
                const organizationData = await this.getOtherHCBOrganization(orgName);
                await ack();
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
                        text: `${organizationData.name} has a balance of ${organizationData.balances.balance_cents / 100} USD`
                    });
                }
            } catch (error) {
                console.log("err")
                console.error(error);
            }
        });
    }
}