import fs from "node:fs";
import YAML from "yaml";
import { Config } from "../types/Configuration.ts";

let config: any = null;

function parseYAMLConfigurationFile() : Config {
    const configurationFile = fs.readFileSync('config.yml', 'utf8');
    return YAML.parse(configurationFile);
}

function parseEnvironmentConfiguration(env: any) : Config {
    // Each _ is part of the type wohoo
    const config: Config = new Config();

    for (const [key, value] of Object.entries(env) as [string, any][]) {
        const keys = key.split('_');
        let current: any = config;

        const topLevelKeys: (keyof Config)[] = Object.keys(config) as (keyof Config)[];
        const nestedKeys = topLevelKeys.map((key) => Object.keys(config[key]) as Array<keyof typeof config[typeof key]>);


        // Traverse and create nested objects
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (i === keys.length - 1) {
        //         // Last key, set the value, splitting by comma if needed
        //         current[k] = value?.includes(',')
        //             ? value.split(',').map((item : string) => item.trim())
        //             : value;
        //     } else {
        //         // Create nested object if it doesn't exist
        //         current[k] = current[k] || {};
        //         current = current[k];
            }
        }
    }

    return config as Config;
    
}

export function getConfiguration(env: any = process.env) {
    // if (!config || !config.HCB) {
        try {
            config = parseYAMLConfigurationFile();
            if (!config) {
                config = parseEnvironmentConfiguration(env);
            }
        } catch (err) {
            if (err instanceof TypeError) {
                config = parseEnvironmentConfiguration(env);
            } else
                console.log(err);
        }
    // } else {
    //     return config;
    // }
}