export declare const defaults: {
    "cache.enabled": boolean;
    "hyperloop.host": string;
    "hyperloop.port": number;
    "hyperloop.wss": boolean;
};
export declare var PARAMS: any;
export declare function ready(): Promise<unknown>;
export declare function set(k: string, v: any): void;
export declare function setp(k: string, v: any): Promise<void>;
export declare function get(k: string): any;
export declare function aget(k: string): Promise<any>;
export declare function remove_from_db(k: string): Promise<void>;
