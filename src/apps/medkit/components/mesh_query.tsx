
/* 
   
   Performs a MeSH Sparql Query for advanced searching 
   Supports modification of the following paramters
   
   1) Limit - Maximum number of results to return 
   2) IncludeList - Tree Numbers which the result should be a descendant of 
   3) ExcludeList - Tree Numbers which the result should NOT be a descendant of 
   
   Note that these parameters are entirely configurable by the UI provided by the MeshSearch2 component.  
   
   
   
*/ 
import * as tsw from "tidyscripts_web" 
let mesh  = tsw.apis.mesh 
let fp    = tsw.util.common.fp 
let log   = tsw.util.common.Logger("mq")
let debug = tsw.util.common.debug 

interface MQOps { 
    val : string, 
    state : any 
} 

export async function handleMeshQuery( ops : MQOps) { 
    
    
    log("Handling mesh query with ops!:") 
    console.log(ops) 
    
    let { val : search_term  , state } = ops 
    
    let { tools } = state  ; 
    
    let { treeState , commonParametersState } = tools ; 
    
    
    let {limit} = commonParametersState ; 
    
    let {includedMap, 
	 excludedMap } = (treeState || {})  ; 
    
    let get_tree_number_if_state = function (d : any) { 
	if (d['state']) {
	    return d['TreeNumber'] 
	} else { 
	    return null
	} 
    } 
	
    let includeList = fp.remove_empty( fp.values(includedMap || {}).map( get_tree_number_if_state ) )
    let excludeList = fp.remove_empty( fp.values(excludedMap || {}).map( get_tree_number_if_state ) ) 
    
    log(`Got search term: ${search_term}`) 
    log(`Got limit: ${limit}`) 
    log("Got the following tree filtering info") 
    
    console.log({ 
	includeList, 
	excludeList, 
    })
    
    
    /* 
       do_mesh_query ARGS format -> 
       { 
          search_term : string, 
          limit : number , 
          includeList : string[], 
          excludeList : string[] 
       } 
    */ 

    
    return await do_mesh_query( {
	search_term , 
	limit , 
	includeList, 
	excludeList , 
    })
    
    
    
    
} 


let include_filter_line = "FILTER(STRSTARTS(?treeNumLabel,?include)) ."
let exclude_filter_line = "FILTER(!STRSTARTS(?treeNumLabel,?exclude)) ."

var global_mesh_query_handler_template = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX meshv: <http://id.nlm.nih.gov/mesh/vocab#>
PREFIX mesh: <http://id.nlm.nih.gov/mesh/>
PREFIX mesh2020: <http://id.nlm.nih.gov/mesh/2020/>
PREFIX mesh2019: <http://id.nlm.nih.gov/mesh/2019/>
PREFIX mesh2018: <http://id.nlm.nih.gov/mesh/2018/>

SELECT DISTINCT ?d ?dName 
FROM <http://id.nlm.nih.gov/mesh>
WHERE {


  ?d a meshv:Descriptor .
  ?d meshv:treeNumber ?treeNum . 
  ?d meshv:concept ?c .

  ?d rdfs:label ?dName .
  ?c rdfs:label ?cName .
  ?treeNum rdfs:label ?treeNumLabel

  INCLUDE_LIST
  EXCLUDE_LIST 


  FILTER(REGEX(?dName,'SEARCH_TERM','i') || REGEX(?cName,'SEARCH_TERM','i')) . 

  INCLUDE_FILTER 
  EXCLUDE_FILTER 

} 
ORDER BY ?dName
LIMIT LIMIT_VALUE
								     ` 


interface MQSearchOps { 
    search_term : string, 
    limit : number , 
    includeList : string[], 
    excludeList : string[] 
} 

export async function do_mesh_query(ops : MQSearchOps) {
    
    var mesh_query_handler_template : string =  `${global_mesh_query_handler_template}`   // make a copy 
    
    let { 
	search_term, 
	limit, 
	includeList, 
	excludeList, 
    }  = ops ; 
    

    log("mesh query") 
    console.log([includeList,excludeList]) 
    
    
    /* 
       For sanity, excludeList trumps the include list 
       This was a quick fix, actually there is probably a bug in the accordion selection as the state is not updating properly 
    */ 
    let excludeSet = new Set(excludeList)
    includeList = includeList.filter( (s:string)=> ! excludeSet.has(s) ) 
    
    var includeListReplacer : any = ""
    var excludeListReplacer : any = ""
    
    let transform = (x : string[]) => fp.join( x.map( (s :string) => `"${s}"` )  , " " )
    
    if ( fp.is_empty(includeList) ) { 
	includeListReplacer = "" 
	//manually edit the template since the include will be missing
	mesh_query_handler_template = mesh_query_handler_template.replace("INCLUDE_FILTER","")
	log("removed include filter") 
	
    } else { 
	includeListReplacer = `VALUES ?include { ${transform(includeList)} } .`
	mesh_query_handler_template = mesh_query_handler_template.replace("INCLUDE_FILTER", include_filter_line)	
	log("put in include filter")
    } 
    
    debug.add("template_post_include", mesh_query_handler_template)    
    
    if ( fp.is_empty(excludeList) ) { 
	excludeListReplacer = "" 
	//manually edit the template since the exclude will be missing
	mesh_query_handler_template = mesh_query_handler_template.replace("EXCLUDE_FILTER","")
	log("Removed exclude filter")
	console.log(excludeList)
    } else { 
	excludeListReplacer = `VALUES ?exclude { ${transform(excludeList)} } .`
	mesh_query_handler_template = mesh_query_handler_template.replace("EXCLUDE_FILTER", exclude_filter_line)		
	log("put in exclude filter")
    } 
    
    debug.add("template_preflight", mesh_query_handler_template)
    debug.add("replacers" , [includeListReplacer, excludeListReplacer] ) 
    
    let tmp = await mesh.sparql_template_fn( {
	template : mesh_query_handler_template , 
	replacers : [
	    [ "SEARCH_TERM" , search_term] ,
	    [ "LIMIT_VALUE" , String(limit) ], 
	    [ "INCLUDE_LIST" , includeListReplacer]  , 
	    [ "EXCLUDE_LIST" , excludeListReplacer], 	    
	] , 
	url_base : "https://id.nlm.nih.gov/mesh/sparql" , 	
	url_params : { 
	    format : 'json' , 
	    inference : true, 
	    
	} 
    }) 
    
    debug.add("mesh_result", tmp) 
    
    let bindings=  tmp.result.value.results.bindings
    if (bindings.length > 0 ) {
	let processed_bindings = bindings.map((b:any) => ({
	    resource : b.d.value , 
	    label : b.dName.value 
	}))
	
	debug.add("processed_bindings", processed_bindings) 
	return processed_bindings
	
	
    } else { 
	return null
    }
    
}


