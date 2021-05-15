
/* 
   Script for automating the evaluation 
 */ 
import * as cds from "./cds" ; 
import * as tsw from "tidyscripts_web";
import Context from "./EntityEditor_Context";
import * as smgr from "../state_manager" 

let fp = tsw.util.common.fp;
let apis = tsw.apis ; 
let mesh = tsw.apis.mesh;
let wikidata = tsw.apis.wikidata;
let log = tsw.util.common.Logger("evaluation") 
let debug = tsw.util.common.debug;
declare var window: any;



export var meta_db = tsw.apis.db.GET_DB("entity_meta")
export var entity_db = tsw.apis.db.GET_DB("entity_info")
export var results_db = tsw.apis.db.GET_DB("eval_results")

export var levels = [5,10,20,50,100] 	 ; 

export async function get_data_for_id(id : string) { 
    return meta_db.get(id) 
} 

export async function resolve_entries_for_id(id  : string) { 
    
    let dta = await get_data_for_id(id) ; 
    let qids = fp.keys(dta) 
    
    log(`Got qids: ${qids}`) 
    
    let promises = qids.map( qid=> entity_db.get(qid)) 
    let results = fp.zip( qids, await Promise.all(promises)) 
    
    log("Results:") 
    log(results) 
    
    return results 
} 


export function convert_entry_to_test_case( entry : any ) { 
    
    let [diagnosis , dta] = entry ; 
    
    //extract some fields 
    let to_extract = ['Symptoms' , 'Clinical Features',  'Risk Factors', 'Causes' , 'Labs' ] 
    //
    let extracted_ids = to_extract.map( k=> fp.values(dta[k]).map(y=>y.resolved_option.id))
    let inputs = fp.flat_once(extracted_ids) 
    return { diagnosis, inputs } 
    
} 


/* -- */ 
export var state = { 
    diagnosis_mode  : "Use Wikidata Only" , 
    //diagnosis_mode : "Use Wikidata with PubMed Priors", 
    
    selected : [] ,  //selected user queries 
    data_cache : { 
	//starts null but will be populated as elements are selected 
    }  , 
    results_cache : {
	//will be computed 
    } , 
    diagnosis_cache : {
	//will be computed 
    } , 
    rank_cache : [
	// will be computed 
	// [ [ mk,  {total_score, qid_scores}]  , ... ]
    ] , 
    mesh_id_cache : { // will be filled at runtime -- this is an "in memory" cache, there is another indexeddb cache which is requested if data is missing here 
	// if it is missing there too then the web request is made and it is stored in both caches 
    }  , 
    scoring_params : null , 
} 



export async function get_data_for_qids( qids : string[]) { 
    let unresolved = qids.filter( qid => !state.data_cache[qid])
    let results = await Promise.all( unresolved.map( qid => cds.get_diagnostic_properties_for_qid(qid, qid+"_label")))
    let data_cache_update = fp.zip_map(unresolved, results) 
    //update the data_cache 
    Object.assign(state.data_cache, data_cache_update) 
    log(`Updated data cache with: ${fp.keys(data_cache_update)}`)
    
        
    return "DONE" 
} 

export function get_rank_stats(qid : string, ranking : any) {
    let tot = fp.len(ranking) ; 
    let stats = { 
	match: false , 	pos : null, score : null,  meta : null    } 
    for (var i =0 ; i< tot; i++) {
	let [mk , meta] = ranking[i] ; 
	let cqid = mk.split("<->")[0]
	if (cqid == qid) {
	    stats = { match : true, pos : i , score : i/tot , meta }
	} 
    } 
    return stats 
} 

//after the above the next step is to call cds.compute_diagnostic_data :) 
export var neph_cache ; 



export async function run_test_case(ops : any) { 
    
    let {test_case, scoring_params_array } = ops 
    
    
    //UPDATE the state here... 
    state.selected = test_case.inputs.map(id=> ({id}))     ; 


    
    //ensure the data is downloaded 
    await get_data_for_qids(test_case.inputs)
    //compute 1 
    let {results_cache, diagnosis_cache}  = cds.compute_diagnostic_data(state.data_cache, state.selected)
    //UPDATE the state 
    state.results_cache = results_cache; state.diagnosis_cache = diagnosis_cache; 
    
    // -- CACHE MESH IDS -- // 
    // now we want to get the mesh_ids for all of the user selected items and the ranked diagnoses as well 
    // to do this intelligently we first check the mesh_id_cache to see if its there, and only request those which are not... 
    let selected_ids = fp.map_get(state.selected,"id") 
    //get diagnosis ids from diagnosis_cache 
    let diagnosis_ids = fp.keys(diagnosis_cache).map( (x : string) => x.split("<->")[0] ) 
    let all_ids = fp.flat_once( [ selected_ids , diagnosis_ids] ) 
    let to_request : string[] = []  ; 
    all_ids.map((qid : string) => {
	if (state.mesh_id_cache[qid]) {
	    //already have the id stored 
	} else { 
	    //will need to get it 
	    to_request.push(qid) 
	} 
    }); 
    let retrieved_ids = await cds.retrieve_mesh_ids(to_request) ; 
    //and then we cache them here! 
    state.mesh_id_cache = fp.merge_dictionary(state.mesh_id_cache, retrieved_ids)
    // -- CACHE MESH IDS -- // 
    
    let diagnosis = test_case.diagnosis ;     
    log(`DIAGNOSIS QID= ${diagnosis}`)
    let dx_has_mesh = state.mesh_id_cache[diagnosis] ? "SUCCESS" : "FAIL"
    log(`DIAGNOSIS mesh=${dx_has_mesh}`)    
    
    
    /* 
     
       TODO -- refactor so I can actually debug why 
       I am getting multiple same scores... 
       First I should manually call diagnosis_cache_to_rankings !! 
       [1] I should make a STATELESS evaluation pipeline (pure function) 
       
       [2] ALSO --- instead of suppressing all logs -- I can decide which 
       files can log ... based on the header... that seems to be fucking stuff up 
       
       [3] L M A O - W T F 
       
     */ 
    
    //compute the rank cache 
    let ALL_RESULTS = [] 
    for (var scoring_params of scoring_params_array) {
	
	state.scoring_params = scoring_params ; 
	log(`Using scoring params: ${JSON.stringify(state.scoring_params)}`)
	state.diagnosis_mode = "Use Wikidata Only"  
	log("Computing wiki ranks...")
	let wiki_rank = cds.diagnosis_cache_to_rankings(state)    
	
	//console.log(JSON.stringify(wiki_rank))
	//window.alert("post_rank_wiki!")

	
	
	state.diagnosis_mode = "Use Wikidata with PubMed Priors"  
	log("Computing pubmed ranks...")    
	let pubmed_rank = cds.diagnosis_cache_to_rankings(state)    
	
	//console.log(JSON.stringify(pubmed_rank))
	//window.alert("post_rank_pubmed!")
	
	
	
	log("complete") 
	
	
	log("Computing wiki rank stats...")
	let wiki_stats = get_rank_stats(diagnosis,wiki_rank) 
	log("Computing pubmed rank stats...")    
	let pubmed_stats = get_rank_stats(diagnosis,pubmed_rank) 	
	ALL_RESULTS.push( fp.clone({wiki_rank, 
			   pubmed_rank, 
			   dx_has_mesh, 
			   wiki_stats, 
			   scoring_params, 
				    pubmed_stats}) ) 
    }
    
    return ALL_RESULTS 
    
} 

export async function test(ops: any  ){     
    /* 
       Run test case with default scoring params and extract value 
       It normally takes an array of params for parameter search and returns 
       an array of results 
     */
    let {test_case} = ops 
    let scoring_params_array = [{ has_mesh : 0.05, max_prior_boost  : 100 }] 
    let tmp  = await run_test_case({test_case,scoring_params_array}) 
    return tmp[0] 
} 

export async function get_test_cases_for_tag(tag : string) { 
    let ys = await resolve_entries_for_id(tag)   
    return ys.map(y=>convert_entry_to_test_case(y))	 
} 


export async function run_evaluation_for_tag(tag : string ,nocache : boolean) {
    
    if (!nocache) {
	//try to get result
	let result =  await results_db.get("${tag}_results")
	if (result)  { 
	    log("Got cached evaluation for tag: " + tag) 
	    return result 
	} 
    } 
    
    let successes = [] 
    let fails = [] 
    let test_cases = await get_test_cases_for_tag(tag)
    
    for ( var i =0;i<fp.len(test_cases);i++ ){ 
	
	tsw.util.common.params.suppress_log()//log off
	
	let test_case = test_cases[i] ; 
	let results = await test({test_case}) 
	
	
	tsw.util.common.params.enable_log()//log on 
	log(`Diagnosis (${i}/${fp.len(test_cases)}) ${test_case.diagnosis}`) 
	//window.alert("proceed")
	if (results.wiki_stats.match || results.pubmed_stats.match ) {
	    log("S")
	    successes.push([test_case, results])
	} else {
	    fails.push([test_case,results]) 
	    log("F")	    
	} 
    } 
    
    log("Saving results to db")
    let all_results = {successes, fails}
    debug.add(`${tag}_results`, all_results)
    await results_db.set("${tag}_results", all_results) 
    return all_results 
} 

export async function run_evaluations(tags : string[]) {
    let evaluation_results = {} 
    for (var tag of tags) { 
	evaluation_results[tag] = await run_evaluation_for_tag(tag, true) 
    } 
    return evaluation_results 
} 

export async function default_main_evaluation() {
    let results = await run_evaluations(["nephrology"])
    log("MAIN complete") 
    debug.add("main_results",results) 
    return results 
}



export async function get_successess() { 
    let main_results = await default_main_evaluation() 
    let too_explore = [] 
    
    let tags = fp.keys(main_results)  
    
    for (var tag of tags) {
	
	let {successes, fails} = main_results[tag]
	
	for (var sc of successes) {
	    sc[0].tag = tag 
	    too_explore.push(sc[0]) 
	} 
	
    } 
    let labels = await apis.db_fns.cached_qid_request(fp.map_get(too_explore,'diagnosis'))
    too_explore.map( te=> te.label = labels[te.diagnosis])
    return too_explore 
} 


export async function  single_boost_parameter_analysis(test_case : any, max_boosts : number[]) { 

    var results = [] 
    let scoring_params_array = max_boosts.map( mb=> ({has_mesh : 0.05, max_prior_boost : mb}))
    return await run_test_case({test_case, scoring_params_array})

} 


export async function boost_parameter_analysis() {
    let max_boosts  = [ 0, 0.1 , 0.5 , 1 , 3, 5 , 10 ,20 , 50 , 100 ]  ; 
    var results = {} ; 
    let test_cases = await get_successess() 
    for ( var tc of test_cases ) { 
	let all_results = await single_boost_parameter_analysis(tc,max_boosts) 
	results[tc.label] = all_results 
    } 
    return {results , 
	    boosts : max_boosts } 
} 


export async function boost_parameter_graph_data()  { 
    let {results, boosts}  = await boost_parameter_analysis() 
    
    boosts = boosts.map(b=>String(b))  ; 
    
    
    let title = "Prior Weight Parameter Search" 
    let xlabel = "Prior Weight" 
    let ylabel = "Wiki Only Rank - PubMed Weighted Rank"
    let margin = { 
	//b : 160 , 
	//r : 120 , 
    } 
    
    let color_cnt = 0 
    
    
    let data =  fp.map_items(results).map( (k,v) => (
	{
	    x : boosts , 
	    y : v , 
	    marker : { 
		color : color_cnt ++ 
	    } , 
	    type : 'line+scatter' , 
	    name : k , 
	}
    ))
					   
    return { 
	data , title, xlabel, ylabel , margin 
    }     
    
} 


export async function get_evaluation_stats(ops : any ) {
    
    tsw.util.common.params.suppress_log() 
    
    let {filter_possible} = ops 
    
    if (filter_possible) {
	var {possible_matches} = await get_all_test_analytics() ; 
	var possible_qids = fp.map_get(possible_matches, 'diagnosis')
    } 
    
    let raw_data = (debug.get('main_results') || await default_main_evaluation() )
    
    
    let ks = fp.keys(raw_data) //the diff tags 
    let all_successes = [] 
    let all_fails   = [] 
    
    
    for (var k of ks ) { 
	for (var sc of raw_data[k].successes) { 
	    if (filter_possible) { 
		if ( possible_qids.includes(sc[0].diagnosis) ) { 
		    all_successes.push([k , sc])		    
		} 
	    } else { 
		all_successes.push([k , sc])
	    } 
	} 

	for (var fl of raw_data[k].fails) { 
	    if (filter_possible) {
		if ( possible_qids.includes(fl[0].diagnosis) ) { 
		    all_fails.push([k , fl])	    
		} 
		
	    } else { 
		all_fails.push([k , fl])	    
	    } 
	} 
    } 
    

    
    //console.log(all_successes) 
    
    let total_successes = all_successes.length
    let total_num = all_successes.length + all_fails.length 
    

    
    let analyze_success = function( d : any ) {
	let [k, s ] = d ; 
	//console.log(s) 
	//console.log(s[1])
	let wiki_pos = s[1].wiki_stats.pos
	let pm_pos   = s[1].pubmed_stats.pos

	let res = {  wiki_pos , 
		     pm_pos , 
		     wiki_levels : {}, 
		     pm_levels : {} , 
		     original : s } ; 
	
	for (var l of levels) { 
	    res.wiki_levels[l] = (wiki_pos <= l)
	} 

	for (var l of levels) { 
	    res.pm_levels[l] = (pm_pos <= l )
	} 
	
	return res 
    } 
    
    let success_positions = all_successes.map(analyze_success) 
    
    let wiki_sum = { 
	'All'  : total_successes, 
    } 
    let pm_sum = { 
	'All' : total_successes,  
    }     
    
    for (var l of levels) { 
	wiki_sum['Top_'+l] = success_positions.filter(x=> x.wiki_levels[l]).length 
	pm_sum['Top_' +l] = success_positions.filter(x=> x.pm_levels[l]).length 	
    }     
    
    
    tsw.util.common.params.enable_log()     
    
    return { 
	wiki_sum , 	
	pm_sum , 
	total_num 
    } 
    
    
    
} 



export async function get_evaluation_graph_data() {
    
    let {wiki_sum, 
	 total_num,
	 pm_sum} = await get_evaluation_stats({filter_possible : false}) 
    
    let x_labels = [] 
    levels.map(l=> x_labels.push("Top_"+l)) ; x_labels.push("All") 
    
    let wiki_ys =  x_labels.map( xl=>wiki_sum[xl]/total_num)
    let pm_ys =  x_labels.map( xl=>pm_sum[xl]/total_num)    
    
    let title = "Evaluation Results" 
    let xlabel = "Scoring System" 
    let ylabel = "Accuracy"
    let margin = { 
	//b : 160 , 
	//r : 120 , 
    } 
    
    let wiki_series = null ; 
    
    let data = [{ 
	x : x_labels,
	y : wiki_ys ,  
	marker : { 
	    color : 'green'
	} , 
	type : 'line+scatter'  , 
	name : 'Wikidata', 
    } , { 
	x : x_labels,
	y : pm_ys ,  
	marker : { 
	    color : 'blue'
	} , 
	type : 'line+scatter'  , 
	name : 'Wikidata+PubMed Prior', 
    } 
    ]
	
    
    return { 
	data , title, xlabel, ylabel , margin 
    } 
    
} 

export async function get_filtered_evaluation_graph_data() {
    
    let {wiki_sum, 
	 total_num,
	 pm_sum} = await get_evaluation_stats({filter_possible : true}) 
    
    let x_labels = [] 
    levels.map(l=> x_labels.push("Top_"+l)) ; x_labels.push("All") 
    
    let wiki_ys =  x_labels.map( xl=>wiki_sum[xl]/total_num)
    let pm_ys =  x_labels.map( xl=>pm_sum[xl]/total_num)    
    
    let title = "Evaluation Results on Subset With Wikidata Coverage"
    let xlabel = "Scoring System" 
    let ylabel = "Accuracy"
    let margin = { 
	//b : 160 , 
	//r : 120 , 
    } 
    
    let wiki_series = null ; 
    
    let data = [{ 
	x : x_labels,
	y : wiki_ys ,  
	marker : { 
	    color : 'green'
	} , 
	type : 'line+scatter'  , 
	name : 'Wikidata', 
    } , { 
	x : x_labels,
	y : pm_ys ,  
	marker : { 
	    color : 'blue'
	} , 
	type : 'line+scatter'  , 
	name : 'Wikidata+PubMed Prior', 
    } 
    ]
	
    
    return { 
	data , title, xlabel, ylabel , margin 
    } 
    
} 


/* 
 
   TODO -- create the code to perform evaluation and produce graphs
   Maybe code to perform the parameter search for boosting factor... should probably keep the MAX prior boost in the range of 1-10 as a first pass
*/


// first get analytics for the different types of test cases 

export async function get_test_analytics(tag : string) { 
    let ys = await resolve_entries_for_id(tag)  ; 
    //convert to test cases 
    let tests = ys.map(convert_entry_to_test_case)  ; 
    //get qids 
    let qids = fp.map_get(tests,'diagnosis')
    //get their labels as a map of (qid -> label) 
    let labels  = await apis.db_fns.cached_qid_request(qids)
    //get their props as a map of (qid -> prop) 
    
    tsw.util.common.params.suppress_log()//log off
    
    let traced_props = await Promise.all( 
	tests.map( test=> cds.trace_properties_for_diagnosis(test.diagnosis))
    ) 
    
    tsw.util.common.params.enable_log()//log on         
    
    let prop_map = fp.zip_map(qids,traced_props) 
    
    //and add them to the tests 
    for ( var test of tests ) { 
	test.label = labels[test.diagnosis] 
	test.traced_props = prop_map[test.diagnosis]
    } 
    //then return 
    return tests 
} 


export async function get_all_test_analytics(tags : string[]) { 
    tags  = tags ||  ["nephrology"]   ; 
    let tmp = {} ; 
    for (var tag of tags) { 
	tmp[tag] = await get_test_analytics(tag)  ; 
    } 
    //will have keys for each tag 
    let keys = fp.keys(tmp) ; 
    /* generate the CDS input data */ 
    let all_values = [] 
    for ( var [i,k] of fp.enumerate(keys) ) { 
	let values = tmp[k]  
	values.map( function(v){
	    v.num_inputs = v.inputs.length; 
	    v.color = i ; 
	    v.tag  = k ; 
	    v.total_props = total_props(v.traced_props) 
	    all_values.push(v) 
	}) 
    } 
    
    let possible_matches = all_values.filter( v=> (v.total_props > 0) ).map( v=> ({diagnosis :v.diagnosis, label : v.label }) )
    
    return { 
	all_values  , 
	possible_matches , 
    } 
} 


function num_props(f_or_b : any) { 
    let ks = fp.keys(f_or_b) ; 
    let tot = 0 ; 
    for (var k of ks ) {
	tot += f_or_b[k].length 
    } 
    return tot 
} 

function total_props(traced_props : any) {
    return num_props(traced_props.forward) + num_props(traced_props.backward)
} 


function test_input_data(all_values : any) { 
    all_values.sort( (a,b) => b.num_inputs - a.num_inputs) 	    
    let x = all_values.map( v=> v.label ) 
    let y = all_values.map( v=> v.num_inputs ) 
    let color = all_values.map( v=>v.color ) 
    let title = "Evaluation Set Input Statistics" 
    let xlabel = "Diagnosis" 
    let ylabel = "Number of CDS Inputs"
    let margin = { 
	b : 240 , 
    } 
    let data = [{ 
	x,
	y, 
	marker : { 
	    color 
	} , 
	type : 'bar' 
    }]
	
    return fp.clone({ 
	data , title, xlabel, ylabel , margin 
    }) 
} 

function test_prop_data(all_values : any) { 
    /* generate the traced  data */     
    all_values.sort( (a,b) => b.total_props - a.total_props ) ;     
    let x = all_values.map( v=> v.label ) 
    let y = all_values.map( v=> v.total_props) 
    let color = all_values.map( v=>v.color ) 
    let title = "Evaluation Set Representation in Wikidata" 
    let xlabel = "Diagnosis" 
    let ylabel = "Number of Possible Matches"
    let margin = { 
	b : 240 , 
    } 
    let data = [{ 
	x,
	y, 
	marker : { 
	    color 
	} , 
	type : 'bar' 
    }]    
    
    
    return fp.clone({ 
	data , title, xlabel, ylabel , margin 
    }) 
    
} 

export async function get_test_set_graph_data() {
    
    let {all_values} = await get_all_test_analytics() 
    
    let eval_input_data = test_input_data(all_values) 
    let eval_prop_data =  test_prop_data(all_values) 
    
    return { 
	eval_input_data, 
	eval_prop_data , 
    } 
        
    
    
} 



export async function debug_1(){
    
    let ss = await get_successess() 
    
    let scoring_params_array =  [
	{has_mesh : 0, max_prior_boost : 0},
	{has_mesh : 0.05, max_prior_boost : 10}	
    ] 
    
    let results = [] 
    for (var test_case of ss) { 
	log(`On case: ${test_case.label}`)
	let tmp = await run_test_case({ 
	    test_case, 
	    scoring_params_array 
	})
	
	results.push(tmp) 
    } 
    
    return {results , tests: ss } 
    
} 
