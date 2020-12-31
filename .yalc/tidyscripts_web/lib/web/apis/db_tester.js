/*
   @Copyright Sheun Aluko
   Test suite for the db module
   
   Thu Dec 31 13:16:13 CST 2020
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
import { GET_DB, STOP_CACHE_CHECK, START_CACHE_CHECK, TTL, log, } from "./db";
const test_db = GET_DB("tester");
export function do_test() {
    START_CACHE_CHECK(1000);
    let ms_delays = [2000, 4100, 6100, 8100, 11000];
    for (var delay of ms_delays) {
        let x = 'delay_' + String(delay);
        test_db.set_with_ttl({
            ttl_ms: delay,
            id: x,
            value: x,
        });
    }
    setTimeout(function () {
        return __awaiter(this, void 0, void 0, function* () {
            STOP_CACHE_CHECK();
            let ttl_num = (yield TTL.keys()).length;
            let test_num = (yield test_db.keys()).length;
            log(`Finished with test! There are ${test_num} and ${ttl_num} entries in test and ttl dbs respectively...`);
        });
    }, 14000);
}
//# sourceMappingURL=db_tester.js.map