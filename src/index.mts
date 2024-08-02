import fs from 'fs';
import YAML, { YAMLMap } from 'yaml';
import axios from 'axios';
import { getAllOrganizationTransactions, getOrganization } from './api/HCB.mts';
import { getConfiguration } from './api/YamlConfiguration.mts';

const config = await getConfiguration();

async function main() {
    config.HCB.MonitoredOrganizations.forEach(async (slug: string) => {
        const org = await getOrganization({ baseUrl: config.HCB.API.BaseUrl, organization: slug.toLowerCase() });
        const balance = org.balances.balance_cents / 100;
        const transactions = await getAllOrganizationTransactions({ baseUrl: config.HCB.API.BaseUrl, organization: slug.toLowerCase() });
        console.log(`The balance of ${org.name} is $${balance}`);
        console.log(transactions[0])
    });
}

main();