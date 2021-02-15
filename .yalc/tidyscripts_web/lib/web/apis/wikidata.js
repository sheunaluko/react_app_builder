var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as hyperloop from "../hyperloop/index";
import * as common from "../../common/util/index"; //common utilities  
let log = common.Logger("wikidata");
let hlm = hyperloop.main;
let fp = common.fp;
let debug = common.debug;
export function qwikidata(ops) {
    return __awaiter(this, void 0, void 0, function* () {
        ops.format = 'json';
        return (yield hlm.http_json("https://www.wikidata.org/w/api.php", ops));
    });
}
export function WikiEntities(ops) {
    return __awaiter(this, void 0, void 0, function* () {
        return qwikidata({
            action: "wbgetentities",
            sites: "enwiki",
            titles: ops.titles,
            props: ops.props,
            languages: 'en',
            format: 'json',
        });
    });
}
export function WikidataSearch(strang) {
    return __awaiter(this, void 0, void 0, function* () {
        return qwikidata({
            action: "wbsearchentities",
            search: strang,
            language: 'en',
            format: 'json',
            limit: 50,
        });
    });
}
export function WikidataSearchAsList(query) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield WikidataSearch(query);
        return result.result.value.search; //lol 
    });
}
let instance_of_template = `
SELECT ?item ?itemLabel 
WHERE 
{
  ?item wdt:P31 wd:ENTITY_ID.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}`;
export function wikidata_instances_of_id(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let sparql = instance_of_template.replace("ENTITY_ID", id);
        let url_params = {
            query: sparql,
            format: 'json',
        };
        let url_base = "https://query.wikidata.org/sparql";
        let value = yield hlm.http_json(url_base, url_params);
        return value;
    });
}
export function sparql_template_fn(ops) {
    return __awaiter(this, void 0, void 0, function* () {
        let { template, replacers, url_base, url_params, param_key } = ops;
        //prep query 
        var sparql = template;
        for (var replacer of replacers) {
            var [to_replace, w] = replacer;
            sparql = sparql.replace(new RegExp(to_replace, "g"), w);
        }
        //return sparql 
        log("sparql template fn using:");
        console.log(sparql);
        //prep url params 
        url_params[param_key || 'query'] = sparql;
        let value = yield hlm.http_json(url_base, url_params);
        return value;
    });
}
let has_meshid_template = `
SELECT ?item ?itemLabel 
WHERE 
{
  ?item wdt:P486 "MESH_ID" .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}`;
export function entity_with_meshid(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let tmp = yield sparql_template_fn({
            template: has_meshid_template,
            replacers: [["MESH_ID", id]],
            url_base: "https://query.wikidata.org/sparql",
            url_params: {
                format: 'json'
            }
        });
        let bindings = tmp.result.value.results.bindings;
        if (bindings.length > 0) {
            return bindings[0];
        }
        else {
            return null;
        }
    });
}
let diseases_with_symptom_template = `
SELECT ?item ?itemLabel ?symptom ?symptomLabel
WHERE 
{
  VALUES ?symptom { ENTITY_STRING  }
  ?item wdt:P780 ?symptom  .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
`;
export function diseases_with_symptoms(wikidata_qids) {
    return __awaiter(this, void 0, void 0, function* () {
        let tmp = yield sparql_template_fn({
            template: diseases_with_symptom_template,
            replacers: [["ENTITY_STRING", wikidata_qids.join(" ")]],
            url_base: "https://query.wikidata.org/sparql",
            url_params: {
                format: 'json'
            }
        });
        let bindings = tmp.result.value.results.bindings;
        if (bindings.length > 0) {
            return bindings;
        }
        else {
            return null;
        }
    });
}
let reverse_findings_template = `
SELECT ?item ?itemLabel ?finding ?findingLabel
WHERE 
{
  VALUES ?finding { ENTITY_STRING } 
  
  ?item wdt:P5131 ?finding  .
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
`;
export function reverse_findings(wikidata_qids) {
    return __awaiter(this, void 0, void 0, function* () {
        let tmp = yield sparql_template_fn({
            template: reverse_findings_template,
            replacers: [["ENTITY_STRING", wikidata_qids.join(" ")]],
            url_base: "https://query.wikidata.org/sparql",
            url_params: {
                format: 'json'
            }
        });
        let bindings = tmp.result.value.results.bindings;
        if (bindings.length > 0) {
            return bindings;
        }
        else {
            return null;
        }
    });
}
let all_predicates_template = `
SELECT ?item ?itemLabel ?itemDescription
WHERE 
{
  ?item wdt:P31/wdt:P279* wd:Q19887775 . 
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}`;
export var ALL_PREDICATES = null; //will set below 
export var PREDICATE_TO_ID = {};
export var ID_TO_PREDICATE = {};
export var PREDICATES_READY = false;
export function all_predicates() {
    return __awaiter(this, void 0, void 0, function* () {
        let tmp = yield sparql_template_fn({
            template: all_predicates_template,
            replacers: [],
            url_base: "https://query.wikidata.org/sparql",
            url_params: {
                format: 'json'
            }
        });
        let bindings = tmp.result.value.results.bindings;
        ALL_PREDICATES = bindings.map((x) => [x.itemLabel.value, x.itemDescription, x.item.value]);
        for (var p of ALL_PREDICATES) {
            let id = fp.last(p[2].split("/"));
            PREDICATE_TO_ID[p[0]] = id;
            ID_TO_PREDICATE[id] = p[0];
        }
        PREDICATES_READY = true;
        return ALL_PREDICATES;
    });
}
//all_predicates() 
export function default_props_ready() {
    return __awaiter(this, void 0, void 0, function* () {
        yield common.asnc.wait_until(() => PREDICATES_READY, 10000, 100);
    });
}
var DEBUG = {};
export function data_about_entities(entities) {
    return __awaiter(this, void 0, void 0, function* () {
        //get reference to predicates 
        //let predicates = ALL_PREDICATES || (await all_predicates()) 
        //call wikibase API with ids and this set of properties 
        let url_params = {
            action: "wbgetentities",
            format: 'json',
            ids: entities.join("|"),
            titles: "",
            sites: "enwiki",
        };
        let url_base = "https://query.wikidata.org/w/api.php";
        let value = yield hlm.http_json(url_base, url_params);
        DEBUG['data_about_entities'] = value;
        return value;
    });
}
let prop_id_template = `
PREFIX schema: <http://schema.org/>

SELECT ?item ?itemLabel ?prop ?propValLabel ?mesh ?meshLabel ?description
WHERE 
{
  
  VALUES ?prop { PROP_IDS } . 

  VALUES ?mesh { MESH_IDS }  . 
  
  ?item wdt:P486 ?mesh ; 
        schema:description ?description; 
        ?prop ?propVal . 


  FILTER ( lang(?description) = "en" )

  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
`;
/*
   Looks up wikidata properties for a list of MESH ids
*/
export function default_props_for_ids(mesh_ids) {
    return __awaiter(this, void 0, void 0, function* () {
        yield default_props_ready();
        let prop_ids = fp.values(PREDICATE_TO_ID).map((id) => "wdt:" + id);
        let tmp = yield sparql_template_fn({
            template: prop_id_template,
            replacers: [["PROP_IDS", prop_ids.join(" ")], ["MESH_IDS", mesh_ids.map((id) => '"' + id + '"').join(" ")],
            ],
            url_base: "https://query.wikidata.org/sparql",
            url_params: {
                format: 'json'
            }
        });
        var bindings = null;
        try {
            bindings = tmp.result.value.results.bindings;
        }
        catch (e) {
            log("Error extracting bindings!");
            log(e);
            debug.add("wikidata.default_props_for_ids.tmp", tmp);
            bindings = [];
        }
        //*
        var to_return = {};
        for (var binding of bindings) {
            let { prop, mesh, item, itemLabel, description, propValLabel } = binding;
            let qid = fp.last(item.value.split("/"));
            let qlabel = itemLabel.value;
            var qDescription = null;
            try {
                qDescription = description.value;
            }
            catch (e) {
                log("Error reading item description");
                console.log(binding);
                qDescription = description;
            }
            let mesh_id = mesh.value;
            let prop_id = fp.last(prop.value.split("/"));
            let item_id = fp.last(item.value.split("/"));
            let prop_name = ID_TO_PREDICATE[prop_id];
            let prop_value = propValLabel.value;
            if (!to_return[qlabel]) {
                to_return[qlabel] = {};
            }
            let payload = {
                prop_id,
                prop_value,
            };
            if (to_return[qlabel][prop_name]) {
                to_return[qlabel][prop_name].push(payload);
            }
            else {
                to_return[qlabel][prop_name] = [payload];
            }
            to_return[qlabel]["description"] = qDescription;
            to_return[qlabel]["itemId"] = item_id;
        }
        return to_return;
        //*/
        //return bindings 
    });
}
let prop_qid_template = ` 
PREFIX schema: <http://schema.org/>

SELECT ?item ?itemLabel ?prop ?propVal ?propValLabel ?mesh ?meshLabel ?description
WHERE 
{
  
  VALUES ?prop { PROP_IDS } . 

  VALUES ?item { Q_IDS }  . 
  
  ?item wdt:P486 ?mesh ; 
        schema:description ?description; 
        ?prop ?propVal . 


  FILTER ( lang(?description) = "en" )

  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
`;
export function default_props_for_qids(qids) {
    return __awaiter(this, void 0, void 0, function* () {
        yield default_props_ready();
        let prop_ids = fp.values(PREDICATE_TO_ID).map((id) => "wdt:" + id);
        let tmp = yield sparql_template_fn({
            template: prop_qid_template,
            replacers: [["PROP_IDS", prop_ids.join(" ")], ["Q_IDS", qids.map((id) => "wd:" + id).join(" ")],
            ],
            url_base: "https://query.wikidata.org/sparql",
            url_params: {
                format: 'json'
            }
        });
        var bindings = null;
        try {
            bindings = tmp.result.value.results.bindings;
        }
        catch (e) {
            log("Error extracting bindings!");
            log(e);
            debug.add("wikidata.default_props_for_qids.tmp", tmp);
            bindings = [];
        }
        //*
        var to_return = {};
        for (var binding of bindings) {
            let { prop, mesh, item, itemLabel, description, propVal, propValLabel } = binding;
            let qid = String(fp.last(item.value.split("/")));
            let qlabel = itemLabel.value;
            var qDescription = null;
            try {
                qDescription = description.value;
            }
            catch (e) {
                log("Error reading item description");
                console.log(binding);
                qDescription = description;
            }
            let mesh_id = mesh.value;
            let prop_id = fp.last(prop.value.split("/"));
            let item_id = fp.last(item.value.split("/"));
            let item_label = itemLabel.value;
            let prop_name = ID_TO_PREDICATE[prop_id];
            let match_id = fp.last(propVal.value.split("/"));
            let match_label = propValLabel.value;
            if (!to_return[qid]) {
                to_return[qid] = {};
            }
            let payload = {
                prop_id,
                match_label,
                match_id,
            };
            if (to_return[qid][prop_name]) {
                to_return[qid][prop_name].push(payload);
            }
            else {
                to_return[qid][prop_name] = [payload];
            }
            to_return[qid]["description"] = qDescription;
            to_return[qid]["itemId"] = item_id;
            to_return[qid]["itemLabel"] = item_label;
        }
        return to_return;
        //*/
        //return bindings 
    });
}
/*
   
   GET A SET OF PROPERTIES AND THEIR LABELS FOR A SET OF QIDS
   More or less duplicate of above more general
   
 */
let props_qids_template = ` 
SELECT ?item ?prop ?propVal ?propValLabel 
WHERE 
{
  
  VALUES ?prop { PROP_IDS } . 

  VALUES ?item { Q_IDS }  . 
  
  ?item  ?prop ?propVal . 

  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
`;
// EDIT BELOW TO BETTER PARSE THE ABOVE -- maybe think about a more generic solution ? The reason i've been resisting this 
// is because of the uniqueness of parsing the returned bindings each time ... though it basically looks like 
// each of the items in the select clause appears as a key in each obect in the returned array [{},{},...] 
export function props_for_qids(qids, props) {
    return __awaiter(this, void 0, void 0, function* () {
        let prop_ids = props.map((id) => "wdt:" + id);
        let tmp = yield sparql_template_fn({
            template: props_qids_template,
            replacers: [["PROP_IDS", prop_ids.join(" ")], ["Q_IDS", qids.map((id) => "wd:" + id).join(" ")],
            ],
            url_base: "https://query.wikidata.org/sparql",
            url_params: {
                format: 'json'
            }
        });
        var bindings = null;
        try {
            bindings = tmp.result.value.results.bindings;
        }
        catch (e) {
            log("Error extracting bindings!");
            log(e);
            debug.add("wikidata.props_for_qids.tmp", tmp);
            bindings = [];
        }
        //*
        var to_return = {};
        for (var binding of bindings) {
            let { item, prop, propVal, propValLabel } = binding;
            let prop_id = fp.last(prop.value.split("/"));
            let item_id = fp.last(item.value.split("/"));
            let match_id = fp.last(propVal.value.split("/"));
            let match_label = propValLabel.value;
            if (!to_return[item_id]) {
                to_return[item_id] = {};
            }
            let payload = {
                item_id,
                prop_id,
                match_id,
                match_label,
            };
            if (to_return[item_id][prop_id]) {
                to_return[item_id][prop_id].push(payload);
            }
            else {
                to_return[item_id][prop_id] = [payload];
            }
        }
        return to_return;
    });
}
let reverse_props_qids_template = ` 
SELECT ?item ?prop ?propVal ?propValLabel 
WHERE 
{
  
  VALUES ?prop { PROP_IDS } . 

  VALUES ?item { Q_IDS }  . 
  
  ?propVal  ?prop ?item . 

  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
`;
//same as above but reverse the prop qid relationship 
//for example given prop="symptoms" and qid="Q_cough_", will find DISEASE -symptoms-> COUGH 
export function reverse_props_for_qids(qids, props) {
    return __awaiter(this, void 0, void 0, function* () {
        let prop_ids = props.map((id) => "wdt:" + id);
        let tmp = yield sparql_template_fn({
            template: reverse_props_qids_template,
            replacers: [["PROP_IDS", prop_ids.join(" ")], ["Q_IDS", qids.map((id) => "wd:" + id).join(" ")],
            ],
            url_base: "https://query.wikidata.org/sparql",
            url_params: {
                format: 'json'
            }
        });
        var bindings = null;
        try {
            bindings = tmp.result.value.results.bindings;
        }
        catch (e) {
            log("Error extracting bindings!");
            log(e);
            debug.add("wikidata.props_for_qids.tmp", tmp);
            bindings = [];
        }
        //*
        var to_return = {};
        for (var binding of bindings) {
            let { item, prop, propVal, propValLabel } = binding;
            let prop_id = fp.last(prop.value.split("/"));
            let item_id = fp.last(item.value.split("/"));
            let match_id = fp.last(propVal.value.split("/"));
            let match_label = propValLabel.value;
            if (!to_return[item_id]) {
                to_return[item_id] = {};
            }
            let payload = {
                item_id,
                prop_id,
                match_id,
                match_label,
            };
            if (to_return[item_id][prop_id]) {
                to_return[item_id][prop_id].push(payload);
            }
            else {
                to_return[item_id][prop_id] = [payload];
            }
        }
        return to_return;
    });
}
/*
 EDITING UTILITIES
 */
export function get_csrf_token() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield hlm.http_json("https://www.wikidata.org/w/api.php", { action: "query", format: "json", meta: "tokens" });
        return res.result.value.query.tokens.csrftoken; //access the returned token 
    });
}
export function create_wikidata_item(label) {
    return __awaiter(this, void 0, void 0, function* () {
        let tok = yield get_csrf_token();
        let res = yield hlm.post_json("https://www.wikidata.org/w/api.php", { action: 'wbeditentity',
            format: 'json',
            new: 'item',
            token: tok,
            data: "{\"labels\":{\"en\":{\"language\":\"en\",\"value\":\"" + label + "\"}}}" });
        debug.add("create_wiki_item", res);
        return res;
    });
}
//# sourceMappingURL=wikidata.js.map