var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as common from "../../common/util/index"; //common utilities  
import { Success, Error } from "../../common/util/types";
export var log = common.Logger("http");
export function base_http_json(url) {
    return __awaiter(this, void 0, void 0, function* () {
        log(`Requesting url: ${url}`);
        const res = yield fetch(url);
        let status = res.status;
        let headers = res.headers;
        log(`Status: ${status}`);
        log("Got headers:");
        log(headers);
        if (status != 200) {
            //there was some error --
            return Error({ description: "status code failure",
                status,
                statusText: res.statusText });
        }
        //otherwise we got the result
        var json;
        try {
            json = yield res.json();
            return Success(json);
        }
        catch (error) {
            return Error({ description: error });
        }
    });
}
export function HTTP(ops) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield makeRequest("GET", ops.url);
        return result;
    });
}
/*
export async function HTTP_JSON(ops :  HttpJsonOpts)  : AsyncResult<object> {
    
    let {url } = ops
    
}
*/
// from stackoverflow (https://stackoverflow.com/questions/30008114/how-do-i-promisify-native-xhr) 
export function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            }
            else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}
function get_url_with_params(_url, params) {
    let url = new URL(_url);
    url.search = new URLSearchParams(params).toString();
    return url;
}
/* jfetch was designed to originally query the cloud function , but is still generic */
export function jfetch(url_base, url_params) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = get_url_with_params(url_base, url_params);
        log(`Using url: ${url}`);
        let result = yield fetch(url.toString());
        let jdata = yield result.json();
        log("Done");
        log("Got value: " + JSON.stringify(jdata));
        return jdata;
    });
}
//# sourceMappingURL=base_http.js.map