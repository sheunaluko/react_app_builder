export declare const log: (v: any) => void;
export declare const LOCAL_DB_HANDLE_CACHE: any;
export declare var CACHE_CHECK_INTERVAL: number;
export declare const default_store_name = "main_store";
export declare const default_db_header = "TIDYSCRIPTS_WEB_";
export declare function GET_DB(name: string, verbose?: boolean): any;
export declare var TTL: any;
export declare function set_cache_check_interval(n: number): void;
export declare var cache_check_interval_id: any;
export declare function do_cache_check(): Promise<void>;
export declare function START_CACHE_CHECK(interval: number): void;
export declare function STOP_CACHE_CHECK(): void;
