import { getConfiguration } from './api/YamlConfiguration.mts';
import Logging from './modules/Logging.mts';
import Module from './types/Module.ts';
import SlackBot from './modules/Slack.mts';

import "dotenv/config";
import { getLoggingPrefix } from './api/Logger.mts';

const config = await getConfiguration();

const modules = [Logging, SlackBot];
const moduleInstances: Module[] = [];

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
        try {
            const instance = new module(slug);
            moduleInstances.push(instance);
        } catch (e) {
            console.error(`${getLoggingPrefix({ module: "SYSTEM", type: "ERROR", highlight: true })} Error initializing module ${module.name}: ${e}`);
        }
    });
}
console.log(`${getLoggingPrefix({ module: "SYSTEM", type: "INFO", highlight: true })} Done initializing modules`);
console.log(`${getLoggingPrefix({ module: "SYSTEM", type: "INFO", highlight: true })} Monitoring ${config.HCB.MonitoredOrganizations.length} organizations`);

const runModules = async () => {
    for (const module of moduleInstances) {
        try {
            await module.sendOutput();
        } catch (e) {
            console.error(`${getLoggingPrefix({ module: "SYSTEM", type: "ERROR", highlight: true })} Error running module ${module.id}: ${e}`);
        }
    }
}

runModules();