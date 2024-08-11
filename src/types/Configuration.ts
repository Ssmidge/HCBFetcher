export type ConfigType = {
    HCB: {
        API: {
            BaseUrl: string;
            UserAgent?: string;
        },
        MonitoredOrganizations: string[],
    },
    Slack: {
        Tokens: {
            Bot: string;
            App: string;
        },
        Secrets: {
            Signing: string;
        },
        Channels: {
            TransactionFetcher: string;
        }
    },
    Logging: {
        Level: string;
    }
}

export class Config implements ConfigType {
    HCB = {
        API: {
            BaseUrl: "a",
            UserAgent: "a",
        },
        MonitoredOrganizations: [],
    };

    Slack = {
        Tokens: {
            Bot: "",
            App: "",
        },
        Secrets: {
            Signing: ""
        },
        Channels: {
            TransactionFetcher: "",
        },
    };

    Logging = {
        Level: "INFO"
    };

}