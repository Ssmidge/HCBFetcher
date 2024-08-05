import { getConfiguration } from './api/YamlConfiguration.mts';
import Module from './types/Module.ts';
import Logging from './modules/Logging.mts';
import SlackBot from './modules/SlackBot.mts';
import SlackNotifier from './modules/SlackNotifier.mts';
import { getLoggingPrefix } from './api/Logger.mts';


import "dotenv/config";
const config = await getConfiguration();

const modules = [Logging, SlackBot];
const moduleInstances: Module[] = [];

for (const m of modules) {
    const module = m as typeof Module;
    config.HCB.MonitoredOrganizations.forEach(async (slug: string) => {
        if (["SlackBot", "SlackNotifier"].includes(module.name) && config.HCB.MonitoredOrganizations[0] !== slug) return;
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