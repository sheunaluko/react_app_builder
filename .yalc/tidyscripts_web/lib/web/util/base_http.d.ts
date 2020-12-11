import { AsyncResult } from "../../common/util/types";
export declare var log: (v: any) => void;
export declare function base_http_json(url: string): AsyncResult<object>;
interface HttpOps {
    url: string;
}
export declare function HTTP(ops: HttpOps): Promise<unknown>;
export declare function makeRequest(method: string, url: string): Promise<unknown>;
export declare function jfetch(url_base: string, url_params: any): Promise<any>;
export {};
