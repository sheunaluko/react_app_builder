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
let fp = common.fp;
let log = common.Logger("mesh");
let debug = common.debug;
let hlm = hyperloop.main;
export function mesh_lookup(ops) {
    return __awaiter(this, void 0, void 0, function* () {
        let { label, match, limit } = ops;
        log("mesh lookup: " + label);
        let url_params = { 'label': label,
            'match': (match || "contains"),
            'limit': (limit || 10) };
        let url_base = "https://id.nlm.nih.gov/mesh/lookup/descriptor";
        let value = yield hlm.http_json(url_base, url_params);
        return value;
    });
}
export function mesh_contains(term) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield mesh_lookup({ label: term, match: 'contains' }));
    });
}
export function mesh_exact(term) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield mesh_lookup({ label: term, match: 'exact' }));
    });
}
// -- look up allowable qualifiers for a given entity 
export function mesh_qualifiers(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let url_params = {
            descriptor: id
        };
        let url_base = "https://id.nlm.nih.gov/mesh/lookup/qualifiers";
        let value = yield hlm.http_json(url_base, url_params);
        return value;
    });
}
let test = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX meshv: <http://id.nlm.nih.gov/mesh/vocab#>
PREFIX mesh: <http://id.nlm.nih.gov/mesh/>
PREFIX mesh2020: <http://id.nlm.nih.gov/mesh/2020/>
PREFIX mesh2019: <http://id.nlm.nih.gov/mesh/2019/>
PREFIX mesh2018: <http://id.nlm.nih.gov/mesh/2018/>

SELECT DISTINCT ?d ?dName ?treeNum
FROM <http://id.nlm.nih.gov/mesh>
WHERE {
  ?d a meshv:Descriptor .
  ?d meshv:treeNumber ?treeNum . 
  ?d meshv:concept ?c .
  ?d rdfs:label ?dName .
  ?c rdfs:label ?cName
  FILTER(REGEX(?dName,'SEARCH_TERM','i') || REGEX(?cName,'SEARCH_TERM','i')) 
} 
ORDER BY ?d`;
export function mesh_search2(s) {
    return __awaiter(this, void 0, void 0, function* () {
        let sparql = test.replace(new RegExp("SEARCH_TERM", "ig"), s);
        //return sparql 
        let url_params = {
            query: sparql,
            inference: true,
            format: 'JSON',
        };
        let url_base = "https://id.nlm.nih.gov/mesh/sparql";
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
        debug.add("sparql_template_fn_template", sparql);
        let value = yield hlm.http_json(url_base, url_params);
        debug.add("sparql_template_fn_response", value);
        return value;
    });
}
export function descendants_of_tree_code(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let { code, offset, limit, exclude } = args;
        limit = (limit || 1000);
        offset = (offset || 0);
        var exclude_filters = "";
        if (exclude) {
            exclude_filters = exclude.map((e) => {
                return `FILTER( !strStarts( ?treeLabel, "${e}" )) . `;
            }).join("\n") + "\n";
        }
        let separator = "|";
        let sparql = ` 
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX meshv: <http://id.nlm.nih.gov/mesh/vocab#>
PREFIX mesh: <http://id.nlm.nih.gov/mesh/>

SELECT  ?meshID (GROUP_CONCAT(distinct ?meshLabel ; separator = "${separator}") as ?meshLabels) (GROUP_CONCAT(distinct ?treeLabel ; separator = "${separator}") AS ?treeLabels)
FROM <http://id.nlm.nih.gov/mesh>
WHERE { 
  ?meshID meshv:treeNumber ?treeNode . 
  ?meshID rdfs:label ?meshLabel .
  ?treeNode rdfs:label ?treeLabel .            
  FILTER( strStarts( ?treeLabel, "${code}" ) ) .
  ${exclude_filters}
}
GROUP BY ?meshID 

`;
        log(sparql);
        let url_params = {
            query: sparql,
            format: 'JSON',
            offset
        };
        let url_base = "https://id.nlm.nih.gov/mesh/sparql";
        let value = yield hlm.http_json(url_base, url_params);
        debug.add("sparql.desc", value);
        return value;
    });
}
/*

SELECT  ?meshD ?treeLabel
FROM <http://id.nlm.nih.gov/mesh>
WHERE {
  ?meshD meshv:treeNumber ?treeNode.
  ?treeNode rdfs:label ?treeLabel .
  FILTER( strStarts( ?treeLabel, "C" ) )
  FILTER( !strStarts( ?treeLabel, "C22" ) )
  FILTER( !strStarts( ?treeLabel, "C23" ) )

}
*/
export function all_sparql_results(fn, args) {
    return __awaiter(this, void 0, void 0, function* () {
        // loops to get all sparql results 
        let offset = 0;
        let all_results = [];
        let max_calls = 2000;
        let limit = 1000;
        while (true) { //meh ...  
            let new_args = Object.assign(Object.assign({}, args), { offset, limit });
            let value = yield fn(new_args);
            //get the bindings ... 
            let bindings = value.result.value.results.bindings; //lol 
            //add them 
            all_results.push(bindings);
            // DETERMINE STOP CONDITIONS
            if (bindings.length < limit) {
                log(`Finished after ${all_results.length} calls`);
                break;
            }
            if (--max_calls == 0) {
                log("Ran out of calls!");
                break;
            }
            // IF CONTINUE 
            offset = offset + limit;
        }
        all_results = fp.flat_once(all_results);
        debug.add("sparql.all_desc", all_results);
        return all_results;
    });
}
export function all_descendants_of_tree_code(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return all_sparql_results(descendants_of_tree_code, args);
    });
}
export function all_mesh_diseases() {
    return __awaiter(this, void 0, void 0, function* () {
        //exclude C22 (Animal Diseases)
        //exclude C23 (Pathological Conditions, Signs and Symptoms) 
        return all_descendants_of_tree_code({ code: "C", exclude: ["C22", "C23"] });
    });
}
export function all_mesh_conditions_signs_symptoms() {
    return __awaiter(this, void 0, void 0, function* () {
        return all_descendants_of_tree_code({ code: "C23" });
    });
}
var custom_search_template = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX meshv: <http://id.nlm.nih.gov/mesh/vocab#>
PREFIX mesh: <http://id.nlm.nih.gov/mesh/>
PREFIX mesh2020: <http://id.nlm.nih.gov/mesh/2020/>
PREFIX mesh2019: <http://id.nlm.nih.gov/mesh/2019/>
PREFIX mesh2018: <http://id.nlm.nih.gov/mesh/2018/>

SELECT DISTINCT ?d ?dName ?treeNum
FROM <http://id.nlm.nih.gov/mesh>
WHERE {
  ?d a meshv:Descriptor .
  ?d meshv:treeNumber ?treeNum . 
  ?d meshv:concept ?c .
  ?d rdfs:label ?dName .
  ?c rdfs:label ?cName
  FILTER(REGEX(?dName,'SEARCH_TERM','i') || REGEX(?cName,'SEARCH_TERM','i')) 
} 
ORDER BY ?dName
LIMIT LIMIT_VALUE
`;
var custom_search_no_limit = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX meshv: <http://id.nlm.nih.gov/mesh/vocab#>
PREFIX mesh: <http://id.nlm.nih.gov/mesh/>
PREFIX mesh2020: <http://id.nlm.nih.gov/mesh/2020/>
PREFIX mesh2019: <http://id.nlm.nih.gov/mesh/2019/>
PREFIX mesh2018: <http://id.nlm.nih.gov/mesh/2018/>

SELECT DISTINCT ?d ?dName ?treeNum
FROM <http://id.nlm.nih.gov/mesh>
WHERE {
  ?d a meshv:Descriptor .
  ?d meshv:treeNumber ?treeNum . 
  ?d meshv:concept ?c .
  ?d rdfs:label ?dName .
  ?c rdfs:label ?cName
  FILTER(REGEX(?dName,'SEARCH_TERM','i') || REGEX(?cName,'SEARCH_TERM','i')) 
} 
ORDER BY ?dName
`;
export function mesh_custom_search(ops) {
    return __awaiter(this, void 0, void 0, function* () {
        let { search_term, limit } = ops;
        let temp = limit ? custom_search_template : custom_search_no_limit;
        let tmp = yield sparql_template_fn({
            template: temp,
            replacers: [
                ["SEARCH_TERM", search_term],
                ["LIMIT_VALUE", (String(limit) || "blah")]
            ],
            url_base: "https://id.nlm.nih.gov/mesh/sparql",
            url_params: {
                format: 'json',
                inference: true,
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
let ancestors_template = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX meshv: <http://id.nlm.nih.gov/mesh/vocab#>
PREFIX mesh: <http://id.nlm.nih.gov/mesh/>
PREFIX mesh2015: <http://id.nlm.nih.gov/mesh/2015/>
PREFIX mesh2016: <http://id.nlm.nih.gov/mesh/2016/>
PREFIX mesh2017: <http://id.nlm.nih.gov/mesh/2017/>

SELECT ?treeNum ?ancestorTreeNum ?ancestor ?alabel
FROM <http://id.nlm.nih.gov/mesh>

WHERE {
   mesh:DESCRIPTOR_ID meshv:treeNumber ?treeNum .
   ?treeNum meshv:parentTreeNumber+ ?ancestorTreeNum .
   ?ancestor meshv:treeNumber ?ancestorTreeNum .
   ?ancestor rdfs:label ?alabel
}

ORDER BY ?treeNum ?ancestorTreeNum`;
export function mesh_ancestors(did) {
    return __awaiter(this, void 0, void 0, function* () {
        let sparql = ancestors_template.replace("DESCRIPTOR_ID", did);
        let url_params = {
            query: sparql,
            inference: true,
            format: 'JSON',
        };
        let url_base = "https://id.nlm.nih.gov/mesh/sparql";
        let value = yield hlm.http_json(url_base, url_params);
        let arr = value.result.value.results.bindings;
        let treeNums = new Set(arr.map((x) => get_tree_num(x.treeNum.value)));
        let to_return = {};
        for (var a of arr) {
            let treeNum = get_tree_num(a.treeNum.value);
            let ancestorNum = get_tree_num(a.ancestorTreeNum.value);
            let depth = ancestorNum.split(".").length;
            if (!to_return[treeNum]) {
                to_return[treeNum] = {};
            }
            to_return[treeNum][depth] = {
                label: a.alabel,
                treeNum: ancestorNum,
            };
        }
        var results = [];
        for (var treeNum of treeNums) {
            let tmp = [];
            let max_depth = Number(fp.last(fp.keys(to_return[treeNum])));
            for (var i = 1; i <= max_depth; i++) {
                tmp.push(to_return[treeNum][i].label.value);
            }
            results.push({ treeNum, path: tmp });
        }
        return results;
        //return value 
    });
}
export function get_tree_num(url) {
    return String(fp.last(url.split("/")));
}
export function get_descriptor_id(url) {
    return fp.last(url.split("/"));
}
// there is a dedicated api for the mesh tree structures 
export function children_of_tree(t) {
    return __awaiter(this, void 0, void 0, function* () {
        let url_params = {};
        let url_base = `https://meshb.nlm.nih.gov/api/tree/children/${t}`;
        let value = yield hlm.http_json(url_base, url_params);
        try {
            return value.result.value;
        }
        catch (e) {
            return null;
        }
    });
}
//# sourceMappingURL=mesh.js.map