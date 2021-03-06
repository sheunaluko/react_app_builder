/*
   @Copyright Sheun Aluko
   Mon Dec 21 22:03:25 CST 2020
   Database wrapper around idb-keyval
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
import * as idbkv from "./idbkv_mod";
import * as common from "../../common/util/index"; //common utilities  
import * as dbio from "./dbio";
export const log = common.Logger("db"); // get logger 
const date = common.Date;
export const LOCAL_DB_HANDLE_CACHE = {};
//export const CACHE_CHECK_INTERVAL = 1000*60*5  //5 min 
export var CACHE_CHECK_INTERVAL = 1000 * 5;
export const default_store_name = "main_store";
export const default_db_header = "TIDYSCRIPTS_WEB_";
/*
 issue im having is that the upgradeneeded is where the object store is created, but it only
 fires on VERSION changes
 
 <- OPTION 1:  in the onupgradeneeded function I can just create ALL the required stores upfront which tidyscripts
 will use.
 
 option 2 : could keep track existing databases / object stores and dynamically update them to get new handle  -- wil figure this out
 
 option 3 [x] ill implement --- simply create new database for each ONE!
    new idbkv.Store('TIDYSCRIPTSWEB_' + name , 'main_store' )
*/
export function GET_DB(name, verbose = true) {
    //first attempt to get from a local handle cache 
    if (LOCAL_DB_HANDLE_CACHE[name]) {
        if (verbose) {
            log(`getting db from local cache: ${name}`);
        }
        return LOCAL_DB_HANDLE_CACHE[name];
    }
    // create the client store 
    var store = new idbkv.Store(default_db_header + name, default_store_name);
    // and define wrappers 
    function set(key, val) { return idbkv.set(key, val, store); }
    function get(key) { return idbkv.get(key, store); }
    function del(key) { return idbkv.del(key, store); }
    function keys() { return idbkv.keys(store); }
    function clear() { return idbkv.clear(store); }
    function get_db_store() { return store; }
    function ready() { return store._dbp; }
    /* will this recursive stuff work ? */
    function set_with_ttl(ops) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, ttl_ms, value } = ops;
            let expiration = ttl_ms + date.ms_now();
            log(`In db "${name}" setting "${id}" with ttl_ms ${ttl_ms}, expiration = ${expiration}`);
            yield set(id, value);
            yield TTL.set(expiration, { db_id: name, del_id: id });
            log("done setting with ttl \\(^.^)/");
        });
    }
    let result = {
        store, set, get, del, keys, clear, set_with_ttl, get_db_store, ready
    };
    //cache it then return it 
    LOCAL_DB_HANDLE_CACHE[name] = result;
    if (verbose) {
        log(`getting db: ${name}`);
    }
    return result;
}
/*
   Will have a special db here to store TTL info
*/
export var TTL = GET_DB("TTL");
export function set_cache_check_interval(n) {
    CACHE_CHECK_INTERVAL = n;
    log("Updated cache check interval to " + n + " ms");
}
export var cache_check_interval_id = null;
export function do_cache_check() {
    return __awaiter(this, void 0, void 0, function* () {
        let all = yield TTL.keys();
        let num = all.length;
        let expired = all.filter((k) => k < date.ms_now());
        let num_expired = expired.length;
        let removed = [];
        for (var id of expired) {
            //log(id) 
            let { db_id, del_id } = yield TTL.get(id);
            //get the db handle 
            let dbh = GET_DB(db_id, false);
            //and then delete the entry 
            yield dbh.del(del_id);
            //and then delete the TTL entry as well 
            yield TTL.del(id);
            removed.push({ db_id, del_id });
        }
        log(`CacheCheck |> ${num_expired}/${num} expired:`);
        if (num_expired > 0) {
            log(removed);
        }
    });
}
export function START_CACHE_CHECK(interval) {
    if (cache_check_interval_id) {
        log("Already checking, will clear old interval.");
        STOP_CACHE_CHECK();
    }
    set_cache_check_interval(interval);
    cache_check_interval_id = setInterval(do_cache_check, CACHE_CHECK_INTERVAL);
}
export function STOP_CACHE_CHECK() {
    clearInterval(cache_check_interval_id);
    log("Stopped cache check");
}
export function deleteDB(name) {
    return window.indexedDB.deleteDatabase(default_db_header + name);
}
export function exportDBString(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let dta = GET_DB(name);
        let idb = dta.get_db_store()._db;
        //
        return yield dbio.exportToJson(idb);
    });
}
export function importFromJson(name, jsn) {
    return __awaiter(this, void 0, void 0, function* () {
        let dta = GET_DB(name);
        yield dta.ready(); // be patient computer! 
        let idb = dta.get_db_store()._db;
        //
        return yield dbio.importFromJson(idb, jsn);
    });
}
//# sourceMappingURL=db.js.map