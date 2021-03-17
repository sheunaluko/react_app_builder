
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

export async function  disease_counts() { 
    
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
	msg = `Cache Hit [DiseaseCounts]`
    }  else { 
	msg = `Retrieved Medline Disease Counts` 	
    } 
    hlm.ext_log(msg) 
    
    return data 
} 


export async function  symptom_counts() { 
    
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
	msg = `Cache Hit [SymptomCounts]`
    }  else { 
	msg = `Retrieved Medline Symptom Counts` 	
    } 
    hlm.ext_log(msg) 
    return data 
} 


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
