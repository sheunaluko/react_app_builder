export declare var keys: {
    [k: string]: string[];
};
declare type kdata = {
    [k: string]: string[];
};
export declare function keys_to_notes_1(key_data: kdata): any;
export declare function sound_key_handler(key_map: any, dur?: number, bk?: string): {
    [k: string]: any;
};
export declare function load_sound_key_handler(dur?: number, bk?: string): void;
export {};
