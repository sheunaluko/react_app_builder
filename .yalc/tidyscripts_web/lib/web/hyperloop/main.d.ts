import * as client from "./client";
export declare var default_client: any;
export declare function default_client_ready(): Promise<boolean>;
export declare function get_default_client(ops?: client.ClientOps): Promise<any>;
export declare function http_json(url_base: string, url_params: any): Promise<any>;
export declare function http(url_base: string, url_params: any, to_dom?: boolean): Promise<any>;
export declare function post_json(url: string, post_msg: object): Promise<any>;
