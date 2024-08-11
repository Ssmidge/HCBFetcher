import fs from "node:fs";
import YAML from "yaml";

let config: any = null;

function parseConfigurationFile() {
    const configurationFile = fs.readFileSync('config.yml', 'utf8');
    return YAML.parse(configurationFile);
}
export function getConfiguration() {
    if (!config) {
        return config = parseConfigurationFile();
    } else {
        return config;
    }
}