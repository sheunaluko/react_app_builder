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


export async function get_diagnostic_properties_for_qid(qid : string) {
    // -- \_(^o^)_/ -- -- \_(^o^)_/ -- -- \_(^o^)_/ -- -- \_(^o^)_/ -- 
    let fprops = wiki_props.property_ids_of_type("diagnostic","forward")
    let bprops = wiki_props.property_ids_of_type("diagnostic","backward")    
    // -- fyi - f(orward) means |qid pred val| and b(ackward) means |val pred qid| 
    let fresults = wiki.props_for_qids([qid],fprops)  
    let bresults = wiki.reverse_props_for_qids([qid],bprops)         
    // -- dont want to await them in series - should do parallel network req 
    let [forward,backward] = await Promise.all([fresults, bresults])
    // --
    let result = { forward : forward[qid] || {} , backward : backward[qid] || {}   }
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

