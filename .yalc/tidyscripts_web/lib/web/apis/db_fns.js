var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as util from "../../common/util/index";
import * as db from "./db";
import * as wiki from "./wikidata";
let { fp, Logger } = util;
let log = Logger("db_util");
export function cached_db_id_request(ops) {
    return __awaiter(this, void 0, void 0, function* () {
        let { db_id, ids, retrieval_fn, ttl_ms, } = ops;
        //default ttl 1  day 
        ttl_ms = ttl_ms || 1000 * 60 * 60 * 24;
        //get the db 
        let the_db = db.GET_DB(db_id); //  - 
        //now we async request all the ids [ [], [] ... ] 
        let cached = fp.zip(ids, yield Promise.all(ids.map(id => the_db.get(id))));
        //init thangs 
        let results = {};
        let to_request = [];
        //loop 
        for (var [id, value] of cached) {
            if (value) {
                results[id] = value;
            }
            else {
                to_request.push(id);
            }
        }
        //do the request now  
        if (to_request.length > 0) {
            log(`Requesting ${to_request.length} ids for db: ${db_id}`);
            let requested_results = yield retrieval_fn(to_request);
            //and loop again to store 
            for (var [id, value] of fp.map_items(requested_results)) {
                results[id] = value; //store it in the return object 
                the_db.set_with_ttl({ id, ttl_ms, value }); //and in the database -- async (no await) 
            }
        }
        else {
            log("Everything cached not requesting!");
        }
        //and then return the results 
        return results;
    });
}
export function mesh_retrieval_function(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        let tmp_results = yield wiki.props_for_qids(ids, ["P486"]);
        let results = {};
        for (var qid of ids) {
            //get our caching parameters 
            let id = qid;
            let ttl_ms = 1000 * 60 * 60 * 24 * 7; // 1 week 
            //try to access it 
            if (tmp_results[qid]) {
                let mid = tmp_results[qid]['P486'][0].match_label;
                let value = { value: mid };
                //store as object so receiver can distinguish null ids from missing		
                results[qid] = value;
            }
            else {
                //there is NO matching mesh id for this qid 
                let value = { value: null };
                results[qid] = value;
            }
        }
        return results;
    });
}
export function cached_mesh_id_request(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        let ops = {
            db_id: "mesh_ids",
            ttl_ms: 1000 * 60 * 60 * 24 * 7,
            retrieval_fn: mesh_retrieval_function,
            ids
        };
        return yield cached_db_id_request(ops);
    });
}
export function qid_retrieval_function(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        let tmp_results = yield wiki.QidLabels(ids);
        if (tmp_results.error ||
            (tmp_results.result.value.error)) {
            log("Error with mesh retrieval!");
            log(tmp_results);
            return {};
        }
        let entities = tmp_results.result.value.entities;
        return fp.map_over_dic_values(entities, (x) => x.labels.en.value);
    });
}
export function cached_qid_request(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        let ops = {
            db_id: "mesh_ids",
            ttl_ms: 1000 * 60 * 60 * 24 * 7,
            retrieval_fn: qid_retrieval_function,
            ids
        };
        return yield cached_db_id_request(ops);
    });
}
//# sourceMappingURL=db_fns.js.map