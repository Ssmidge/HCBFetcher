import fs from "fs";
import YAML from "yaml";

let config: any = null;

async function parseConfigurationFile() {
    const configurationFile = fs.readFileSync('config.yml', 'utf8');
    return await YAML.parse(configurationFile);
}
export async function getConfiguration() {
    if (!config) {
        return config = await parseConfigurationFile();
    } else {
        return config;
    }
}