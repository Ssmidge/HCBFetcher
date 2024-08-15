/* eslint-disable @typescript-eslint/no-unused-vars */
import { RedisClientType } from "redis";
import HCBFetcher from "../core/HCBFetcher.mts";

export enum CacheName {
    Organization = "organization",
    OrganizationTransactions = "orgtransactions",
    Card = "card",
    Transaction = "transaction",
    LastTransactions = "lasttransactions",
}

export enum CacheExpiration {
    TEN_MINUTES = 10 * 60,
    FIVE_MINUTES = 5 * 60,
    NEVER = -1,
}


export class Cache implements ICache {

    constructor(hcbClient: HCBFetcher) {
        this.hcbClient = hcbClient;
    }

    hcbClient: HCBFetcher;
    client: RedisClientType | undefined;
    connect(): Promise<void> { throw new Error("Method not implemented."); }
    disconnect(): Promise<void> { throw new Error("Method not implemented."); }
    test(): Promise<void> { throw new Error("Method not implemented."); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(name: CacheName, key: string): Promise<any | undefined | null> { throw new Error("Method not implemented."); }
    set(name: CacheName, key: string, value: unknown, expiration: CacheExpiration = CacheExpiration.TEN_MINUTES): Promise<void> { throw new Error("Method not implemented."); }
    del(name: CacheName, key: string): Promise<void> { throw new Error("Method not implemented."); }
    keys(name: CacheName): Promise<string[]> { throw new Error("Method not implemented."); }
    has(name: CacheName, key: string): Promise<boolean> { throw new Error("Method not implemented."); }
    clear(): Promise<void> { throw new Error("Method not implemented."); }
} 

interface ICache {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    test(): Promise<void>;
    get(name: CacheName, key: string): Promise<any | undefined | null>;
    set(name: CacheName, key: string, value: any, expiration: CacheExpiration): Promise<void>;
    del(name: CacheName, key: string): Promise<void>;
    keys(name: CacheName): Promise<string[]>;
    has(name: CacheName, key: string): Promise<boolean>;
    clear(): Promise<void>;
}