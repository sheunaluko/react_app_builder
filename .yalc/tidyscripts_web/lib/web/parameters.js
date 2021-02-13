/*
   parameter mgmt
   Thu Jan  7 21:33:36 CST 2021
   @copyright sheun aluko
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
import { GET_DB } from "./apis/db";
import { Logger } from "../common/util/logger";
import { wait_until } from "../common/util/async";
//define logger 
const log = Logger("params");
//define some default namespaced parameters 
//anything stored in the DB will OVERRIDE these (see below) 
//these are NEVER MODIFIED 
export const defaults = {
    "cache.enabled": true,
    "hyperloop.host": "sattsys.com/api/hyperloop",
    "hyperloop.port": 80,
    "hyperloop.wss": true,
};
//define a variable that holds the CURRENT param values 
//and copy the defaults into it 
//thie var IS modified 
export var PARAMS = Object.assign({}, defaults);
// get a db instance 
const PARAM_DB = GET_DB("parameters");
// read the param_db and populate the parameters 
var params_are_loaded = false;
(function populate_params() {
    return __awaiter(this, void 0, void 0, function* () {
        for (var k of (yield PARAM_DB.keys())) {
            log("Processing param key= " + k);
            let v = yield PARAM_DB.get(k);
            PARAMS[k] = v;
        }
        params_are_loaded = true;
        log("Finished loading params");
    });
})(); //call this async function immediately 
/*
   Begin external interface
*/
export function ready() {
    return __awaiter(this, void 0, void 0, function* () {
        //for external interface to wait on param loading before attempting to use the params 
        return wait_until(() => params_are_loaded, 10000, 100);
    });
}
// set a parameter ephemerally 
export function set(k, v) { PARAMS[k] = v; }
// set a parameter permanently  
export function setp(k, v) {
    return __awaiter(this, void 0, void 0, function* () {
        //first we set it locally 
        set(k, v);
        //then we update the database too so that it persists later 
        yield PARAM_DB.set(k, v);
    });
}
// get a parameter 
export function get(k) { return PARAMS[k]; }
// get a parameter but ensure asynchronous completion of loading first  
export function aget(k) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ready();
        return PARAMS[k];
    });
}
// delete a parameter from the db 
export function remove_from_db(k) {
    return __awaiter(this, void 0, void 0, function* () {
        yield PARAM_DB.del(k);
    });
}
//# sourceMappingURL=parameters.js.map