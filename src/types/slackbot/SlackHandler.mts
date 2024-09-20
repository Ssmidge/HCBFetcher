import { App as BoltApp } from "@slack/bolt";
import HCBFetcher from "../../core/HCBFetcher.mts";

export default abstract class Handler {
    client: BoltApp;
    hcbClient: HCBFetcher;

    constructor(client: BoltApp, hcbClient: HCBFetcher) {
        this.client = client;
        this.hcbClient = hcbClient;
    }

    abstract handle(): Promise<void>;

}