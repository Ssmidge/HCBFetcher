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
            TransactionTracker: string;
        }
    },
    Logging: {
        Level: string;
    },
    Web: {
        Port: number;
    },
    Cache: {
        Redis: {
            URI: string;
        }
    }
}

export class Config implements ConfigType {
    HCB = {
        API: {
            BaseUrl: "",
            UserAgent: "",
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
            TransactionTracker: "",
        },
    };

    Logging = {
        Level: "INFO"
    };

    Web = {
        Port: 3000,
    };

    Cache = {
        Redis: {
            URI: "",
        }
    };

}