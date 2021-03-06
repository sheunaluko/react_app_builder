/*
   Cache implementation for the hyperloop client
   @copyright Sheun Aluko
   Mon Dec 21 14:03:08 CST 2020
   
   
   --
   
   When the hyperloop client makes a call, there are only two arguments:
   id , args
   
   -->
   
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as DB from "../apis/db";
import * as common from "../../common/util/index"; //common utilities  
import * as params from "../parameters"; // params 
const date = common.Date;
const log = common.Logger("hlc_cacher"); // get logger 
const JSON = window.JSON;
/* caching params */
export const sec10 = 1000 * 10;
export const min1 = 1000 * 60;
export const hr1 = 1000 * 60 * 60;
export const DEFAULT_HL_CACHE_TIME = hr1;
export const DEFAULT_HL_CACHE_CHECK_INTERVAL = min1;
export const db_name = "HL_CLIENT";
// get handle on the db 
export var db = DB.GET_DB(db_name);
const { store, set, get, del, keys, clear, set_with_ttl } = db;
export function delete_db() {
    return DB.deleteDB(db_name);
}
// start the cache checking (if already started this will just restart it with the specified interval)  
//
if (params.defaults['cache.enabled']) {
    log("Enabled cache checking");
    DB.START_CACHE_CHECK(DEFAULT_HL_CACHE_CHECK_INTERVAL);
}
else {
    log("Cache checking disabled");
}
export { set_with_ttl, };
export function call_ops_to_id(x) {
    let { id, args } = x;
    let argstring = JSON.stringify(args);
    let call_id = `${id}|${argstring}`;
    log("Generated call id: " + call_id);
    return call_id;
}
export function check_cache_for_call_ops(x) {
    return __awaiter(this, void 0, void 0, function* () {
        let call_id = call_ops_to_id(x);
        log(`Checking cache for ${call_id}`);
        let result = yield get(call_id);
        if (result === undefined) {
            return { hit: false, call_id };
        }
        else {
            return { hit: true, value: result, call_id };
        }
    });
}
export var http_json_rules = [
    [new RegExp("query.wikidata.org/sparql"), DEFAULT_HL_CACHE_TIME],
    [new RegExp("wikidata.org/w/api.php\\?action=wbeditentity"), null],
    [new RegExp("wikidata.org/w/api.php\\?action=query&format=json&meta=tokens"), null],
    [new RegExp("wikidata.org/w/api"), DEFAULT_HL_CACHE_TIME],
    [new RegExp("id.nlm.nih.gov/mesh/sparql"), DEFAULT_HL_CACHE_TIME],
    [new RegExp("www.nccih.nih.gov"), DEFAULT_HL_CACHE_TIME],
];
export var post_json_rules = [
    [new RegExp("wikidata.org/w/api.php\\?action=wbeditentity"), null],
];
export var ttl_rules = {
    //rules for http json requests 
    "sattsys.hyperloop.http_json": function (args) {
        let url = args.url;
        log("Finding ttl match for " + url);
        // so we will filter based on the url 
        // for now the main apis the I am querying are 
        for (var i = 0; i < http_json_rules.length; i++) {
            let [re, ttl] = http_json_rules[i];
            log("Checking rule: " + re.toString());
            if (url.match(re) != null) {
                //there is a match so we return the ttl 
                log(`Found match with ${re.toString()} and returning ttl=${ttl}`);
                return ttl;
            }
        }
        log("No match found... so return null");
        return null;
    },
    "sattsys.hyperloop.http": function (args) {
        let url = args.url;
        log("Finding ttl match for " + url);
        // so we will filter based on the url 
        // for now the main apis the I am querying are 
        for (var x of http_json_rules) {
            let [re, ttl] = x;
            if (url.match(re) != null) {
                //there is a match so we return the ttl 
                log(`Found match with ${re.toString()} and returning ttl=${ttl}`);
                return ttl;
            }
        }
        log("No match found... so return null");
        return null;
    },
    "sattsys.hyperloop.post_json": function (args) {
        let url = args.url;
        log("Finding ttl match for " + url);
        // so we will filter based on the url 
        for (var x of post_json_rules) {
            let [re, ttl] = x;
            if (url.match(re) != null) {
                //there is a match so we return the ttl 
                log(`Found match with ${re.toString()} and returning ttl=${ttl}`);
                return ttl;
            }
        }
        log("No match found... so return null");
        return null;
    },
};
export function get_ttl(x) {
    let { id, args } = x;
    let ttl_fn = ttl_rules[id];
    if (ttl_fn) {
        log("Applying ttl rule for id " + id);
        return ttl_fn(args);
    }
    else {
        log("Ttl rule not found for id " + id);
        return null;
    }
}
//# sourceMappingURL=client_cacher.js.map