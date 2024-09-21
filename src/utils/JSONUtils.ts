export function validateJSON(json: unknown): boolean {
    return json instanceof Array || json instanceof Object;
}