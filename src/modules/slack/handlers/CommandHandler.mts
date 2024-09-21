import HCBFetcher from "../../../core/HCBFetcher.mts";
import Command from "../../../types/slackbot/SlackCommand.mts";
import Handler from "../../../types/slackbot/SlackHandler.mts";
import { App as BoltApp } from "@slack/bolt";

export class CommandHandler extends Handler {
    commands: Command[] = [];
    constructor(client: BoltApp, hcbClient: HCBFetcher) {
        super(client, hcbClient);
        this.commands = this.hcbClient.slackCommands;
    }
    async handle() {
        this.client.command(/.*?/, async ({ ack, body, command, respond, context }) => {
            await ack();
            await respond({ replace_original: true, text: "Processing your command..." });
            
            const commandName = command.command.replace("/", "").toLowerCase();
            const commandArguments = command.text.split(" ");

            // Help command isn't a real command, it's just a way to get the list of commands
            if (commandName.toLowerCase() === "hcb" && commandArguments[0].toLowerCase() === "help") {
                const commandList = this.commands.map((c) => {
                    return {
                        name: c.name,
                        description: c.description,
                        usage: c.usage,
                        commandArguments: c.commandArguments
                    };
                });

                const commandListString = commandList.map((c) => {
                    return `*${c.name}*: ${c.description}\nUsage: \`${c.usage}\`\nArguments: ${c.commandArguments.map((a) => {
                        return `\n\t- *${a.name}*: ${a.description}\n\t\t- Required: ${a.required}\n\t\t- Type: ${a.type}\n\t\t- Example: ${a.example}`;
                    }).join("")}`;
                }).join("\n\n");

                return await respond({
                    text: `Here is a list of commands you can use:\n${commandListString}`,
                    thread_ts: body.ts,
                });
            }

            const commandToExecute = this.commands.find((c) => {
                // if it's a subcommand, check for the commandName to be the first part for split . and the subcommand to be the second part
                if (c.subCommand) {
                    const [commandName, subCommand] = c.subCommand.split(".");
                    return commandName === commandName && subCommand === commandArguments[0];
                } else {
                    return c.name === commandName;
                }
            });
            if (!commandToExecute) {
                await respond({
                    text: `I'm sorry, I don't know what command \`/${commandArguments.length > 1 ? `${commandName} ${commandArguments[0]}` : commandName}\` is.`,
                    thread_ts: body.ts,
                });
                return;
            }

            try {
                await commandToExecute.execute({
                    context,
                    body,
                    command
                }, commandArguments.splice(1).map((argument) => {
                    const toReturn = commandToExecute.commandArguments[commandArguments.indexOf(argument) + 1];
                    toReturn.value = argument;
                    return toReturn;
                }), respond);
            } catch (e: unknown) {
                await respond({
                    text: `An error occurred while executing the command ${commandName}.\n${e}`,
                    thread_ts: body.ts,
                });
            }

        });
    }
}