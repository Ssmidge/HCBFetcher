import { getConfiguration } from './api/YamlConfiguration.mts';
import { getLoggingPrefix } from './api/Logger.mts';
import HCBFetcher from './core/HCBFetcher.mts';
import "dotenv/config";
import axios from 'axios';

const config = getConfiguration();
const hcbClients = [];

// Global Initialization \\
// Axios \\
axios.defaults.headers.post['User-Agent'] = config.HCB.API.UserAgent;

// End Global Initialization \\

// HCB Fetcher Instances \\

const client = new HCBFetcher(config.HCB.MonitoredOrganizations, config);
await client.initializeModules();
await client.runAllModules();
hcbClients.push(client);

// End HCB Fetcher Instances \\

// Post-Initialization \\
console.log(`${getLoggingPrefix({ module: "SYSTEM", type: "INFO", highlight: true })} Done initializing modules`);
console.log(`${getLoggingPrefix({ module: "SYSTEM", type: "INFO", highlight: true })} Monitoring ${config.HCB.MonitoredOrganizations.length} organizations`);

// End Post-Initialization \\

// Univeral todos and notes \\
// TODO: Implement EventEmitter for the app - Working on this
// TODO: Implement Redis for better caching - Researching
// TODO: Implement some sort of KV store to prevent duplicate messages on restart - Not started (Probably will use Redis or store a very small structure in something like PG or MySQL)

// End Universal todos and notes \\