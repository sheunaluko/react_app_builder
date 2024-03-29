import * as client from "./client";
export declare var default_client: any;
import { ext_log } from "./ext_log";
export { ext_log };
import * as client_cacher from "./client_cacher";
export { client_cacher };
export declare function default_client_ready(): Promise<boolean>;
export declare function get_default_client(ops?: client.ClientOps): Promise<any>;
export declare function http_json(url_base: string, url_params: any): Promise<any>;
export declare function http(url_base: string, url_params: any, to_dom?: boolean): Promise<any>;
export declare function post_json(url: string, post_msg: object): Promise<any>;
export declare function write_file(args: {
    path: string;
    data: string;
    append: boolean;
}): Promise<any>;
export declare function configure_endpoint(host: string, port: number, wss: boolean): Promise<void>;
export declare function reset_endpoint(): Promise<void>;
export declare function configure_local(): Promise<void>;
