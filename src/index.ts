import fs from 'fs';
import YAML, { YAMLMap } from 'yaml';
import axios from 'axios';
import { getOrganization } from './api/HCB';

let config: any;

async function parseConfigurationFile() {
  const configurationFile = fs.readFileSync('config.yml', 'utf8');
  config = YAML.parse(configurationFile);
}

async function main() {
    await parseConfigurationFile();
    const org = await getOrganization({ baseUrl: config.HCB.API.BaseUrl, organization: "arcade"});
    const balance = org.balances.balance_cents / 100;
    console.log(`The balance of ${org.name} is $${balance}`);
}

main();