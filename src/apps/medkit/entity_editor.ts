import  * as smgr from "./state_manager" 

import * as tsw from "tidyscripts_web" 


let log = tsw.util.common.Logger("entity_editor.ts") 

let EditableFields = [ 
    "Entity" , 
    "Symptoms" , 
    "Clinical Features",     
    "Risk Factors" , 
    "Diagnosis" , 
    "Treatments" ,
    
] 

export function generic_processor(i  : string) { 
    let active = smgr.get("activeField")	
    log("Active: " + active) 
    let smgr_name = active + "_parse"
    log("Calling= " + smgr_name) 
    smgr.get(smgr_name)(i) 
} 

export function keyword_processor(i : string) { 
    EditableFields.map( (f : string) => { 
	let fl = f.toLowerCase() ; 
	if (i == `select ${fl}`) {
	    //match 
	    smgr.get('setActive')(f) 
	} else {
	    //pass 
	} 
    })
} 

export function input_processor(i : string) {
    i = i.toLowerCase() 
    if (i.split(" ")[0] == "select" ) { 
	keyword_processor(i)
    } else { 
	generic_processor(i) 
    } 
} 

