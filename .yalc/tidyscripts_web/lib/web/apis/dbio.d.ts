/**
 * Export all data from an IndexedDB database
 *
 * @param {IDBDatabase} idbDatabase The database to export from
 * @return {Promise<string>}
 */
export declare function exportToJson(idbDatabase: any): Promise<unknown>;
/**
 * Import data from JSON into an IndexedDB database.
 * This does not delete any existing data from the database, so keys may clash.
 *
 * @param {IDBDatabase} idbDatabase Database to import into
 * @param {string}      json        Data to import, one key per object store
 * @return {Promise<void>}
 */
export declare function importFromJson(idbDatabase: any, json: string): Promise<unknown>;
/**
 * Clear a database
 *
 * @param {IDBDatabase} idbDatabase The database to delete all data from
 * @return {Promise<void>}
 */
export declare function clearDatabase(idbDatabase: any): Promise<unknown>;
