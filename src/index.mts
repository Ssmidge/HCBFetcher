import { getConfiguration } from './api/YamlConfiguration.mts';
import { getLoggingPrefix } from './api/Logger.mts';
import HCBFetcher from './core/HCBFetcher.mts';
import "dotenv/config";

const config = await getConfiguration();
const hcbClients = [];

const client = new HCBFetcher(config.HCB.MonitoredOrganizations);
await client.initializeModules();
await client.runAllModules();
hcbClients.push(client);

console.log(`${getLoggingPrefix({ module: "SYSTEM", type: "INFO", highlight: true })} Done initializing modules`);
console.log(`${getLoggingPrefix({ module: "SYSTEM", type: "INFO", highlight: true })} Monitoring ${config.HCB.MonitoredOrganizations.length} organizations`);

// Univeral todos and notes:
// TODO: Implement EventEmitter for the app - Working on this
// TODO: Implement Redis for better caching - Researching
// TODO: Implement some sort of KV store to prevent duplicate messages on restart - Not started (Probably will use Redis or store a very small structure in something like PG or MySQL)