declare const set_with_ttl: any;
export { set_with_ttl, };
interface CallFunctionOps {
    id: string;
    args: {
        [k: string]: any;
    };
}
export declare function call_ops_to_id(x: CallFunctionOps): string;
export declare function check_cache_for_call_ops(x: CallFunctionOps): Promise<{
    hit: boolean;
    call_id: string;
    value?: undefined;
} | {
    hit: boolean;
    value: any;
    call_id: string;
}>;
export declare var http_json_rules: (number | RegExp)[][];
export declare var ttl_rules: any;
export declare function get_ttl(x: CallFunctionOps): any;
