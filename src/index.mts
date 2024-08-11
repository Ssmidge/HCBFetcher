import { getConfiguration } from './api/ConfigurationLoader.mts';
import { getLoggingPrefix } from './api/Logger.mts';
import HCBFetcher from './core/HCBFetcher.mts';
import "dotenv/config";
import { AutoRouter, ResponseHandler } from 'itty-router';

const config = getConfiguration();
const hcbClients = [];

// Global Initialization \\
// Axios \\
// axios.defaults.headers.post['User-Agent'] = config.HCB.API.UserAgent;

// End Global Initialization \\

// HCB Fetcher Instances \\

// const client = new HCBFetcher(config.HCB.MonitoredOrganizations, config);
// await client.initializeModules();
// await client.runAllModules();
// hcbClients.push(client);

// End HCB Fetcher Instances \\

// Post-Initialization \\
// console.log(`${getLoggingPrefix({ module: "SYSTEM", type: "INFO", highlight: true })} Done initializing modules`);
// console.log(`${getLoggingPrefix({ module: "SYSTEM", type: "INFO", highlight: true })} Monitoring ${config.HCB.MonitoredOrganizations.length} organizations`);

// End Post-Initialization \\

// Univeral todos and notes \\
// TODO: Implement EventEmitter for the app - Working on this
// TODO: Implement Redis for better caching - Researching
// TODO: Implement some sort of KV store to prevent duplicate messages on restart - Not started (Probably will use Redis or store a very small structure in something like PG or MySQL)

// End Universal todos and notes \\

const logger: ResponseHandler = (response: Response, request: Request) => { 
    console.log(`[${new Date().toISOString()}] ${request.method} /${request.url.split(`/`)[3]} ${response.status} ${response.statusText}`);
}
const router = AutoRouter({
    finally: [logger],
});

router.get('/', (request: Request, env: any) => {
    // add env to process.env
    getConfiguration(env);
	return new Response('Hello, world! This is the root page of your Worker template.');
});

router.all('*', () => new Response('404, not found!', { status: 404 }));

export default {
    ...router,
} satisfies ExportedHandler;