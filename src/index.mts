import { getConfiguration } from './api/YamlConfiguration.mts';
import Logging from './modules/Logging.mts';
import Module from './types/Module.ts';
import SlackBot from './modules/Slack.mts';

import "dotenv/config";

const config = await getConfiguration();

const modules = [Logging, SlackBot];

// const org = await getOrganization({ baseUrl: config.HCB.API.BaseUrl, organization: slug.toLowerCase() });
// const balance = org.balances.balance_cents / 100;
// const transactions = (await getAllOrganizationTransactions({ baseUrl: config.HCB.API.BaseUrl, organization: slug.toLowerCase() })).filter((t) => !t.pending);
// console.log(`The balance of ${org.name} is $${balance}`);
// const isLastTransactionNegative = transactions[0].amount_cents < 0;
// console.log(`The last transaction for ${org.name} was a ${isLastTransactionNegative ? 'debit' : 'credit'} of ${transactions[0].amount_cents / 100}`);
for (const m of modules) {
    const module = m as typeof Module;
    config.HCB.MonitoredOrganizations.forEach(async (slug: string) => {
        if (module.name === "SlackBot" && config.HCB.MonitoredOrganizations[0] !== slug) return;
        const instance = new module(slug);
        try {
            await instance.sendOutput();
        } catch(err) {
            const error = err as Error;
            console.error(`Error in module ${instance.id}: ${error.message}`);
        }
    });
}