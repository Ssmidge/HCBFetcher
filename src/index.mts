import { getConfiguration } from './api/ConfigurationLoader.mts';
import HCBFetcher from './core/HCBFetcher.mts';
import "dotenv/config";
import { AutoRouter, ResponseHandler } from 'itty-router';
import { Config } from './types/Configuration.ts';
import axios from 'axios';
import { RedisCache } from './api/RedisCache.mts';
import Logging from './modules/Logging.mts';
import SlackNotifier from './modules/SlackNotifier.mts';
import SlackBot from './modules/SlackBot.mts';
import WebAPI from './modules/WebAPI.mts';
import { LogLevel } from './api/Logger.mts';

let config : Config = getConfiguration() as Config;
const hcbClients = [];

// Global Initialization \\
// Axios \\
axios.defaults.headers.post['User-Agent'] = config?.HCB.API.UserAgent;

const cacheType = RedisCache;

const allModules = [Logging, SlackNotifier, WebAPI];

// End Global Initialization \\

// HCB Fetcher Instances \\

const client = new HCBFetcher(config.HCB.MonitoredOrganizations, config, allModules, cacheType);
await client.initializeModules();
await client.runAllModules();
hcbClients.push(client);

// End HCB Fetcher Instances \\

// Post-Initialization \\
client.logger.log({ module: "SYSTEM", level: LogLevel.INFO, message: `Done initializing modules`, highlight: true });
client.logger.log({ module: "SYSTEM", level: LogLevel.INFO, message: `Monitoring ${config.HCB.MonitoredOrganizations.length} organizations`, highlight: true });

// End Post-Initialization \\

// Univeral todos and notes \\
// TODO: Implement EventEmitter for the app - Almost done

// End Universal todos and notes \\

// Wrangler stuff \\
// const logger: ResponseHandler = (response: Response, request: Request) => { 
//     console.log(`[${new Date().toISOString()}] ${request.method} /${request.url.split(`/`)[3]} ${response.status} ${response.statusText}`);
// }
// const router = AutoRouter({
//     finally: [logger],
// });

// router.get('/', (request: Request, env: any) => {
//     if (!config) config = getConfiguration(env);
// 	return Response.json({
//         status: "OK",
//         endpoints: [
//             ...router.routes.map((route) => {
//                 return {
//                     method: route[0],
//                     url: route[3] || '/',
//                 }
//             }, [])
//         ]
//     }, {
//         status: 200,
//         headers: {
//             'X-Server': `${config?.HCB?.API.UserAgent || 'HCB Transaction Fetcher (https://github.com/Ssmidge/HCBFetcher)'}`,
//         }
//     })
// });

// router.get('/health', (request: Request, env: any) => {
//     if (!config) config = getConfiguration(env);
//     return Response.json({
//         status: "OK",
//         url: request.url,
//     }, {
//         status: 200,
//         headers: {
//             'X-Server': `${config?.HCB?.API.UserAgent || 'HCB Transaction Fetcher (https://github.com/Ssmidge/HCBFetcher)'}`,
//         }
//     })
// });

// router.get('/repo', (request: Request, env: any) => {
//     if (!config) config = getConfiguration(env);
//     return Response.redirect('https://github.com/Ssmidge/HCBFetcher', 301);
// });

// router.all('*', () => new Response('404, not found!', { status: 404 }));

// export default {
//     ...router,
// } satisfies ExportedHandler;