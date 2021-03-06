//Sun Feb 14 18:16:45 CST 2021

import * as tsw from   "tidyscripts_web"  ; 
import * as wiki_props from "./wikidata_medical_properties" 

let fp = tsw.util.common.fp 
let debug = tsw.util.common.debug 
let wiki  = tsw.apis.wikidata 

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
