import { createClient, RedisClientType } from 'redis';
import { Cache, CacheName } from '../types/Cache.mts';
import HCBFetcher from '../core/HCBFetcher.mts';

export class RedisCache extends Cache {
    client: RedisClientType = createClient({
        url: `redis://localhost:6379`,
    });
    
    constructor(hcbClient: HCBFetcher) {
        super(hcbClient);
        this.connect();
    }
    async connect(): Promise<void> {
        await this.client.connect();
        this.client.once("ready", () => this.hcbClient.emit("cacheReady", this));
        this.client.on("end", () => this.hcbClient.emit("cacheDisconnect"));
        this.client.on("error", (err) => this.hcbClient.emit("cacheError", err));
    }

    async disconnect(): Promise<void> {
        await this.client.quit();
    }

    async test(): Promise<any> {
        return await this.client.ping();
    }

    async get(name: CacheName, key: string): Promise<string | null | undefined> {
        return await this.client.hGet(name, key);
    }

    async set(name: CacheName, key: string, value: string): Promise<void> {
        await this.client.hSet(name, key, value);
        await this.client.hExpire(name, key, this.expiration, "NX");
    }

    async del(name: CacheName, key: string): Promise<void> {
        await this.client.hDel(name, key);
    }

    async keys(name: CacheName): Promise<string[]> {
        return await this.client.hKeys(name);
    }

    async clear(): Promise<void> {
        await this.client.flushAll();
    }

    async has(name: CacheName, key: string): Promise<boolean> {
        return await this.client.hExists(name, key);
    }
}