import fs from "node:fs";
import YAML from "yaml";
import { Config } from "../types/Configuration.ts";

let config: Config;

function parseYAMLConfigurationFile() : Config {
    const configurationFile = fs.readFileSync('config.yml', 'utf8');
    return YAML.parse(configurationFile);
}

function parseEnvironmentConfiguration(env: NodeJS.ProcessEnv) : Config {
    // Each _ is part of the type wohoo
    const config: Config = new Config();

    for (const [key, value] of Object.entries(env) as [string, string][]) {
        const keys = key.split('_');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current : any = config;

        const topLevelKeys: (keyof Config)[] = Object.keys(config) as (keyof Config)[];
        const allNestedKeys = topLevelKeys.flatMap((key) => getAllNestedKeys(config[key]));
        const allKeys = [...topLevelKeys, ...allNestedKeys];
        
        // Traverse and create nested objects
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const mappedKey = allKeys.find((key) => key.toLocaleLowerCase() === k.toLocaleLowerCase()) as string;
            if (i === keys.length - 1) {
                // Last key, set the value, splitting by comma if needed
                current[mappedKey] = value?.includes(',')
                    ? value.split(',').map((item : string) => item.trim())
                    : value;
            } else {
                // Create nested object if it doesn't exist
                current[mappedKey] = current[mappedKey] || {};
                current = current[mappedKey];
            }
        }
    }

    return config as Config;
    
}

export function getConfiguration(env: NodeJS.ProcessEnv = process.env) : Config {
    if (!config || config.HCB.API.BaseUrl.length <= 1) {
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
    }

    return config;
}

function getAllNestedKeys(obj: object): string[] {
    const keys = [];
  
    for (const key of Object.keys(obj)) {
      keys.push(key);
      const value = obj[key as keyof typeof obj] as unknown as object;
  
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nestedKeys = getAllNestedKeys(value);
        keys.push(...nestedKeys.map(nestedKey => `${nestedKey}`));
      }
    }
  
    return keys;
}