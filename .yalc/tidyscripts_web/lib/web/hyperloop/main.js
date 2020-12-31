// -- this module is the main hyperloop client for the browser 
// -- will store it here so that browser functions do not keep creating new hyperloop clients but instead 
// -- can share one 
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as client from "./client";
export var default_client = null;
import * as common from "../../common/util/index"; //common utilities  
import * as wutil from "../util/index";
import { ext_log } from "./ext_log"; //import the hyperloop external logger 
const log = common.Logger("hlm");
let fp = common.fp;
let debug = common.debug;
// -- async function for checking status of default_client 
// -- if a react component needs to make an http query inorder to render itself 
// (via a useEffect hook for example)
// -- then it can await default_client_ready()  prior to making the request 
// -- in order to avoid runtime exception where the hyperloop client is not connected by 
// -- an external library calls into one of the functions 
export function default_client_ready() {
    return __awaiter(this, void 0, void 0, function* () {
        log("checking default client ready status...");
        let timeout = yield common.asnc.wait_until(() => (default_client != null && default_client.conn.readyState == 1), 10000, 30);
        if (timeout) {
            //never connected , 
            log("Default client timeout!");
            return false;
        }
        else {
            log("Successfully connect default hyperloop client");
            log("Returning async promise ->");
            return true;
        }
    });
}
var host = null;
let default_ops = {
    host: (host || "sattsys.com/api/hyperloop"),
    port: 80,
    secure: true,
    id: "sattsys.hyperloop.client." + wutil.uuid(),
};
export function get_default_client(ops) {
    return __awaiter(this, void 0, void 0, function* () {
        if (default_client) {
            return default_client;
        }
        else {
            default_client = new client.Client(ops || default_ops);
            try {
                yield default_client.connect(ops ? ops.secure : true);
                yield default_client_ready();
            }
            catch (error) {
                log("Error in connecting client -- likely endpoint is down");
                log("Retrying in 2 seconds:");
                setTimeout(get_default_client, 2000);
            }
            log("Successfully connected client! Now creating close listener for automatic restarting");
            //add an onclose listener 
            //which just calls this function again in 1 second
            //(after setting default_client to null first 
            default_client.conn.addEventListener("close", function restarter() {
                log("client closed -- attempt to recconect in 1s");
                default_client = null; //have to delete it first
                setTimeout(get_default_client, 1000);
            });
            return default_client;
        }
    });
}
function get_url_with_params(_url, params) {
    let url = new URL(_url);
    url.search = new URLSearchParams(params).toString();
    return url;
}
export function http_json(url_base, url_params) {
    return __awaiter(this, void 0, void 0, function* () {
        //ext_log("HTTP_JSON Request:")
        //ext_log(url_base) 
        let url = get_url_with_params(url_base, url_params);
        let client = yield get_default_client();
        log(`Using url: ${url.toString()}`);
        let { hit, data } = yield client.call({ id: "sattsys.hyperloop.http_json", args: { url: url.toString() } });
        log("Done");
        //log("Got value: " + JSON.stringify(data)) 
        debug.add("http_json", data);
        /*
         Prepare and issue the external log
         */
        var msg = null;
        if (hit) {
            msg = `Cache Hit [HttpJson] - ${url_base}`;
        }
        else {
            msg = `HttpJson - ${url_base}`;
        }
        ext_log(msg);
        return data;
    });
}
export function http(url_base, url_params, to_dom = true) {
    return __awaiter(this, void 0, void 0, function* () {
        //ext_log("HTTP Request:")
        //ext_log(url_base) 
        let url = get_url_with_params(url_base, url_params);
        let client = yield get_default_client();
        log(`Using url: ${url.toString()}`);
        let { hit, data } = yield client.call({ id: "sattsys.hyperloop.http", args: { url: url.toString() } });
        log("Done");
        //log("Got value: " + JSON.stringify(data)) 
        debug.add("http", data);
        /*
          Prepare and issue the external log
          */
        var msg = null;
        if (hit) {
            msg = `Cache Hit [Http] - ${url_base}`;
        }
        else {
            msg = `Http - ${url_base}`;
        }
        ext_log(msg);
        if (to_dom) {
            var el = document.createElement("html");
            el.innerHTML = data.result.value;
            return el;
        }
        return data;
    });
}
export function post_json(url, post_msg) {
    return __awaiter(this, void 0, void 0, function* () {
        //ext_log("POST Request:")
        //ext_log(url) 
        let client = yield get_default_client();
        log("Request to post json");
        let { hit, data } = yield client.call({ id: "sattsys.hyperloop.post_json",
            args: { url, msg: post_msg } });
        log("Done");
        //log("Got value: " + JSON.stringify(data))     
        debug.add("post_json", data);
        /*
         Prepare and issue the external log
         */
        var msg = null;
        if (hit) {
            msg = `Cache Hit [PostJson] - ${url}`;
        }
        else {
            msg = `PostJson - ${url}`;
        }
        ext_log(msg);
        return data;
    });
}
//# sourceMappingURL=main.js.map