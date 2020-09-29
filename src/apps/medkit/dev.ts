

import * as tsw from   "tidyscripts_web"  ; 


let fp = tsw.util.common.fp 
let debug = tsw.util.common.debug 

interface wdobj { 
    type : string , 
    value : string, 
    itemLabel : string 
} 

interface dsd { 
    item : wdobj  , 
    itemLabel : wdobj, 
    symptom : wdobj,  
    symptomLabel : wdobj,   
} 

export function get_dsd() { 
    let dsd = JSON.parse(localStorage['dsdraw']) 
    return dsd.map(transform_dsd) 
} 




interface tdsd { 
    itemId : string, 
    itemLabel : string, 
    symptomId : string, 
    symptomLabel : string 
} 


export function transform_dsd(d : dsd) : tdsd {  
    return { 
	'itemId' : fp.last(d.item.value.split("/")) , 
	'itemLabel' : d.itemLabel.value , 
	'symptomId' : fp.last(d.symptom.value.split("/")) , 
	'symptomLabel' : d.symptomLabel.value 
    } 
} 


export function get_dsd_summary(d : tdsd[]) { 
    
    var summary : any  = {}   
    
    for (var i of d ) { 
	
	debug.log("Processing: " + i.itemLabel) 
	
	if (summary[i.itemId]) {
	    //already had a match so we will append 
	    summary[i.itemId].matches.push(i) 
	} else { 
	    //no match yet so we create the data structure
	    summary[i.itemId] = { itemLabel : i.itemLabel, matches : [ i ] } 
	} 
	
	//update the count (i know... not the most efficient but for now its ok) 
	summary[i.itemId].count  = summary[i.itemId].matches.length 

    } 
    
    debug.log("done")    
    
    return summary 
    
} 


export function dsd_rankings(d : tdsd[]) { 
    
    let sum = get_dsd_summary(d) 
    let cts = fp.values(sum).map(x=>[x.count,x.itemLabel] ) 
    
    cts.sort(function(a:any,b:any) {
	return b[0] - a[0] 
    })
    
    return cts
    
    
} 


export function print_dsd_rankings() { 
    let dsd = get_dsd()
    let cts = dsd_rankings(dsd)
    cts.map((x : any) => console.log(fp.format("{}, {}",x )) ) 
} 
