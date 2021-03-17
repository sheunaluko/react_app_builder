//Sun Feb 14 18:16:45 CST 2021

import * as tsw from   "tidyscripts_web"  ; 
import * as wiki_props from "./wikidata_medical_properties" 


let fp = tsw.util.common.fp 
let debug = tsw.util.common.debug 
let wiki  = tsw.apis.wikidata 
let mesh  = tsw.apis.mesh 
let hlm = tsw.hyperloop.main;


let log = console.log

declare var window : any ; 

let smgr  = window.state_manager ; let ui_log = (t:string)=>smgr.addConsoleText(t) ;  

export async function do_it() {
    
    let props = ["P780"] 
    let qids = ["Q181754"] 
    
    let results = await wiki.props_for_qids(qids,props) 
    console.log(results) 
    debug.add("dev.sparql1" , results) 
    
} 




/*
  OK! now we are ready to request ALL of the diagnostic properties for a given qid 
  1) request the forward properties using the forward props_for_qid
     - use wiki_props.property_ids_of_type("diagnostic","forward")
  2) request the backward properties using the "reverse_props_for_qid"
     - use wiki_props.property_ids_of_type("diagnostic","backward")  
     
     TODO - update these to also get the MeSH ids (will need for linking to pubmed) 
 */


export async function get_diagnostic_properties_for_qid(qid : string, label?  : string) {
    // -- \_(^o^)_/ -- -- \_(^o^)_/ -- -- \_(^o^)_/ -- -- \_(^o^)_/ -- 
    let fprops = wiki_props.property_ids_of_type("diagnostic","forward")
    let bprops = wiki_props.property_ids_of_type("diagnostic","backward")    
    // -- fyi - f(orward) means |qid pred val| and b(ackward) means |val pred qid| 
    let fresults = wiki.props_for_qids([qid],fprops)  
    let bresults = wiki.reverse_props_for_qids([qid],bprops)         
    // -- dont want to await them in series - should do parallel network req 
    let [forward,backward] = await Promise.all([fresults, bresults])
    // --
    let result = { forward : forward[qid] || {} , backward : backward[qid] || {}  , label : (label || null) }
    // -- 
    debug.add("dprops"  , result)
    // -- 
    return result 
} 

/* 
   1) Work on the interface so that as new qids are selected the diagnostic properties are reqd and the result obj is conjd onto the state 
    -- the UI is a pure function of this state and sorts the returned properties into tabs in the lower pane and disease ranking into upper pane 
       -- tablevel1 => property (top level indicates count of submatches as well as forward/reverse - could represent latter with color? or text?)
        -- tablevel2 => userentry (the initial symptom that was entered which matches) 
	 --  display: all the values the match the |userentry property ?val| triple or |?val property userentry| , in a SCROLLABLE? Box 
 */

function dict_conj_id(d : any, id : string, el : any) {
    if (d[id]) { d[id].push(el) } 
    else { d[id] = [el] }
} 

function get_prop_direction(p : string) { return wiki_props.properties.by_id[p].direction } 
    
export function compute_diagnostic_data(data_cache : any, selected : any[]) { 
    // note that when the user deletes one of the selected items, the "selected" array is mutated but the data_cache is left unchanged
    // (so that a new request isnt tried if the user adds back the same item later). This isnt that necessary because the requests are cached anyways ... but 
    // I did it that way for the sake of the ui_log 
    // Thus, to compute the results cache we only take items from the data_cache that are in the selected array
    let qids = fp.map_get(selected,"id") 
    // -
    var results_cache : any  = {} //used for the lower right panel display (sorted by predicate)
    // - 
    var diagnosis_cache : any  = {} //tracks all the unique diagnoses (sorted by diagnosis) 
    // - 
    for (var qid of qids) { 
	// - 
	let dta = data_cache[qid] 
	/* 
	   note that the data returned is the return value from the above 
	   function 'get_diagnostic_properties_for_qid' and thus 
	   has {forward , backward, label} keys, where each subvalue of forward/backward 
	   is another object with { prop_id : [ {item_id, prop_id, match_id,match_label}  ] } 
	   The goal here is to reorganize all this data so that the results cache contains
	   the PROP_ID first, then the qid, then the array of matches 
	*/
	if (!dta) { continue } 
	
	let f = dta['forward']
	let b = dta['backward'] 
	let label = dta['label'] 
	// Initialize RESULTS_CACHE
	// 1. the results_cache should have the following keys 
	fp.concat(fp.keys(f),fp.keys(b)).map( (k:string)=> {  if (!results_cache[k]) { results_cache[k] = {} } 	})
	// 2. each of those keys should have a subkey which is 'qid' 
	// which holds label and match information 
	fp.keys(results_cache).map( (k:string)=> { if(!results_cache[k][qid]) { results_cache[k][qid] = { label , matches : []}}})
	
	//ok now we can populate the results_cache and diagnosis_cache
	let populate = function(f_or_p : any, results_cache : any ,diagnosis_cache : any) {
	    for (var pid of fp.keys(f_or_p)) {
		for (var match of f_or_p[pid]) { 
		    dict_conj_id(results_cache[pid][qid],'matches',match)
		    let mk = `${match.match_id}<->${match.match_label}`
		    //make sure the match_id exists in diagnosis_cache
		    if (!diagnosis_cache[mk]) {
			diagnosis_cache[mk] = {} 
		    } 
		    //make sure the qid exists in diagnosis_cache
		    if (!diagnosis_cache[mk][qid]) {
			diagnosis_cache[mk][qid] = {
			    label : label ,
			    matches : []
			} 
		    } 
		    //and then append to the matches here 
		    dict_conj_id(diagnosis_cache[mk][qid],'matches',match)		
		}
	    } 
	}
	//process the 'forward' predicates 
	populate(f,results_cache,diagnosis_cache) 
	//process the 'backward' predicates 	
	populate(b,results_cache,diagnosis_cache) 
    }
    // - 
    return {results_cache, diagnosis_cache}
}


/*
  note when computing the diagnosis score -- some entries will have multiple matches! (has effect backward, has cause - forward) ... and thus the algo should NOT double count 
  ALSO! -- need to get the mesh metadata into the match item (optionally) 
*/ 
export function get_diagnosis_score(mk : string,  entry  : any) { 
    /* 
       mk is of the form: Q1472<->Crohn's disease
       and entry is: {
           qid(user search) :  { 
	      label : _ , 
	      matches : [
	         { 
	             item_id (qid) ,  match_id (same as id portion of  mk), match_label, prop_id 
	         }  
	      ] 
	   } 
       } 
       
       This function is designed to be mapped accross the diagnosis_cache to calculate all scores
       i.e. => 
       let scores = fp.keys(diagnosis_cache).map( (k:string) => {
          get_diagnosis_score(k,diagnosis_cache[k])
       })
    */
    let [did ,dlabel ] = mk.split("<->")
    let qid_scores = fp.map( 
	fp.keys(entry) , 
	(qid : string) => {
	    let {label,matches} = entry[qid] 
	    let score = get_score_for_qid(matches)
	    return [qid, score]
	}
    ) 
    
    // -- 
    let total_score = fp.map( 
	qid_scores, 
	(e :any) => e[1].score
    ).reduce(fp.add,0)
    // -- 
    return {total_score, qid_scores } 
    
} 


export function get_score_for_qid(matches : any[]){
    /* 
       
       Needs upgrading 
       Will start with proof of concept 
       
       Upgrades
       => how to aggregate / NOT double count matches 
       => how to apply weighting to different matches 
       => how to use prevalance / incidence? 
           - the issue is that not all have this info
	   
       For now - will just COUNT the number of each 
       
     */
    
    return { 
	score : matches.length ,  // LOL
	metadata : null 
    } 
    
    
} 

export function diagnosis_cache_to_rankings(diagnosis_cache : any){ 
    /* 
       This can be optimized by: 
       1. keeping track of which qid was just added by the user 
          - finding all diagnoses affected by that qid
	  - only updating those diagnoses 
    */
    let rank_cache = fp.keys(diagnosis_cache).map( (k:string) => {
        return [k , get_diagnosis_score(k,diagnosis_cache[k])]
    }) //  [ [ mk,  {total_score, qid_scores}]  , ... ]

    // -  sort by 'total_score' 
    rank_cache.sort( (a:any,b:any) => (b[1].total_score - a[1].total_score))
    
    return rank_cache
} 



/* 
   OK We need to retrieve and cache MeshIDs for all of the symptoms / diseases which have 
   been pulled into the app 
*/

//get the db 
var mesh_id_db = tsw.apis.db.GET_DB('mesh_ids')
export {mesh_id_db} 
// -- 
export async function retrieve_mesh_ids(qids : string[]) {
    
    if (fp.is_empty(qids)) { return {} } 
    
    let results : { [k:string] : {[k:string]: (string | null)}  } = {} 
    let not_cached : string[] = [] 
    for (qid of qids) {
	//first try the cache 
	//can optimze this! (Promise.all) 
	let mid = await mesh_id_db.get(qid)
	if (mid) {
	    results[qid] = mid 
	} else { 
	    not_cached.push(qid) 
	}
    } 
    if (fp.is_empty(not_cached)) { 
	ui_log("Retrieved all mesh ids from cache")
	return results
    } else { 
	// need to request the ones that are not cached 
	ui_log(`MeshID - Requesting and caching ${fp.len(not_cached)} identifier(s)`)
	let tmp_results = await  wiki.props_for_qids(not_cached,["P486"])
	// note that those that dont match wont have a key
	
	/* 
	   CAN OPTIMIZE THIS FOR LOOP ! 
	*/
	for (var qid of not_cached) { 
	    
	    //get our caching parameters 
	    let id = qid ; 
	    let ttl_ms  = 1000*60*60*24*7 // 1 week 
	    
	    //try to access it 
	    if (tmp_results[qid]) {
		let mid = tmp_results[qid]['P486'][0].match_label
		let value = { value : mid} 		
		//store as object so receiver can distinguish null ids from missing		
		results[qid] = value 
		//and cache it NOw 
		mesh_id_db.set_with_ttl({id,ttl_ms,value}) //DONT need to await this for better perf 
	    } else {
		//there is NO matching mesh id for this qid 
		let value = { value : null } 
		results[qid] = value 
		//and cache the null value too (so we dont keep re-requesting) 
		mesh_id_db.set_with_ttl({id,ttl_ms,value})  //DONT need to await this for better perf 		
	    } 
	} 
	//ok were done I think
	ui_log(`MeshID - Done`)
    } 
    return results 
} 









/* 
   Retrieve mesh ids that will be used for association studies 
*/    

export async function get_mesh_ids_for_association_analysis(){
    
    //its all in the apis... 
    //simultaneous async web requests  -- the power of async :) 
    let [rf_ids,
	 symptom_ids,
	 disease_ids] = await Promise.all([ wiki.risk_factors_with_meshids(), 
					    mesh.all_mesh_conditions_signs_symptoms(), 
					    mesh.all_mesh_diseases() ]) 
    
    //collect into a json object 
    let data = { 
	rf_ids, 
	symptom_ids, 
	disease_ids 
    } 
    
    //return it
    return data 
} 

/* 
     Export mesh ids that will be used for association studies 
 */
export async function export_mesh_ids_for_association_analysis(){
    //get it -- 
    let data_obj  = await get_mesh_ids_for_association_analysis() 
    let data = JSON.stringify(data_obj)
    //export it to disk using hyperloop 
    let path = "all_mesh_ids.json"
    let append = false 
    let result = await hlm.write_file({data,path,append})
    log("Mesh id Write result=")
    log(result)
} 
