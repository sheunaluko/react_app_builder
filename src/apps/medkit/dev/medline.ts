
/* 
   
   Temp Utilities for retrieving medline information
   
*/


import * as tsw from "tidyscripts_web";
let hlm = tsw.hyperloop.main;
let common = tsw.util.common; 
let {fp, 
     asnc,
     debug, 
     Logger} = common 
let log = Logger("medline") 


export async function x_counts(x: string) {
    
    let data =  { 
	result :  { 
	    value : await ( await fetch(`/${x}_counts.json`) ).json() 
	} 
    } 
    
    
    debug.add(`${x}_counts`, data ) 
    hlm.ext_log(`Medline: Retrieved ${x} counts`) 
    
    return data
} 

var disease_counts = ()=>x_counts("disease")
var symptom_counts = ()=>x_counts("symptom")

/* the hyperloop functions below were temporary -- i just moved the json to public dir */ 
export async function  disease_counts_hyperloop() { 
    
    let client = await hlm.get_default_client() 
    let {hit,data} = await client.call({ id : "medline.disease_counts" })

    log("Done") 
    //log("Got value: " + JSON.stringify(data)) 
    debug.add("disease_counts", data)    

    /* 
     Prepare and issue the external log   
    */
    var msg : any = null 
    if (hit) {
	msg = `Cache Hit [Mesh Disease Counts]`
    }  else { 
	msg = `Retrieved Medline Disease Counts` 	
    } 
    hlm.ext_log(msg) 
    
    return data 
} 


export async function  symptom_counts_hyperloop() { 
    
    let client = await hlm.get_default_client() 
    let {hit,data} = await client.call({ id : "medline.symptom_counts" })

    log("Done") 
    //log("Got value: " + JSON.stringify(data)) 
    debug.add("symptom_counts", data)    

    /* 
     Prepare and issue the external log   
    */
    var msg : any = null 
    if (hit) {
	msg = `Cache Hit [Mesh Symptom Counts]`
    }  else { 
	msg = `Retrieved Medline Symptom Counts` 	
    } 
    hlm.ext_log(msg) 
    return data 
} 

export var mesh_id_counts : {[k:string] : any }   = {} ; 
//populate the above asynchronously 

async function get_sorted_counts(f : any) { 
    
    let counts = (await f()).result.value 
    let counts_list = fp.dict_to_list(counts) 
    let sorted_list = counts_list.sort( (a :any,b:any) => b[1] - a[1] )
    
    return { 
	dictionary : counts,  
	sorted : sorted_list, 
	max : sorted_list[0][1], 
    } 
        
} 

(function(){
    get_sorted_counts(symptom_counts).then( (x:any) =>  mesh_id_counts['symptoms'] = x ) ; 
    get_sorted_counts(disease_counts).then( (x:any) =>  mesh_id_counts['diseases'] = x) 
})()


export async function  association_count(symptom_id : string, disease_id : string) { 
    
    let client = await hlm.get_default_client() 
    let {hit,data} = await client.call({ id : "medline.association_count", args : {symptom_id,disease_id} })

    log("Done") 
    log("Got value: " + JSON.stringify(data)) 
    debug.add(`association_count`, data)    

    /* 
     Prepare and issue the external log   
    */
    var msg : any = null 
    if (hit) {
	msg = `Cache Hit [AssociationCount.${symptom_id}.${disease_id}]`
    }  else { 
	msg = `Retrieved AssociationCount.${symptom_id}.${disease_id}` 	
    } 
    hlm.ext_log(msg) 
    return data 
} 
