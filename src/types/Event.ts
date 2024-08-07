// Event types for the event emitter.

export type ClientEvent = {
    id: string;
    once?: boolean;
    organization: string;
    run: () => void;
    returns?: object; // What run will return.
}