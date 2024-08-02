import { getConfiguration } from './api/YamlConfiguration.mts';
import Logging from './modules/Logging.mts';
import Module from './types/Module.ts';
import Logging2 from './modules/Logging2.mts';
import { organizationCache } from './api/Caching.mts';

const config = await getConfiguration();

const modules = [Logging, Logging2];

config.HCB.MonitoredOrganizations.forEach((slug: string) => {
    // const org = await getOrganization({ baseUrl: config.HCB.API.BaseUrl, organization: slug.toLowerCase() });
    // const balance = org.balances.balance_cents / 100;
    // const transactions = (await getAllOrganizationTransactions({ baseUrl: config.HCB.API.BaseUrl, organization: slug.toLowerCase() })).filter((t) => !t.pending);
    // console.log(`The balance of ${org.name} is $${balance}`);
    // const isLastTransactionNegative = transactions[0].amount_cents < 0;
    // console.log(`The last transaction for ${org.name} was a ${isLastTransactionNegative ? 'debit' : 'credit'} of ${transactions[0].amount_cents / 100}`);
    modules.forEach((m: any) => {
        const module = m as typeof Module;
        const instance = new module(slug);
        try {
            instance.sendOutput();
        } catch(err) {
            const error = err as Error;
            console.error(`Error in module ${instance.id}: ${error.message}`);
        }
    });
});

console.log(`OrganizationCache - ${organizationCache.keys()}`);
console.log("Done");