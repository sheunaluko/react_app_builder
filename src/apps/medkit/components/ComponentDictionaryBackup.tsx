import React from 'react' 


import WikiDataSearch from "./WikiDataSearch"  
import MeshSearch from "./MeshSearch2"  
import ProblemList from "./ProblemList"
import MeshTreeAccordion from "./MeshTreeAccordion"
import SparqlWidget from "./SparqlWidget"
import Diagnoser from "./Diagnoser"
import NccihBrowser from "./NccihBrowser"
import EntityViewer from "./WikidataEntityViewer" 



//DO_NOT_REMOVE_OR_MODIFY -- THIS LINE USED BY TOOLS [import] 


export var MenuComponents : {[k:string] : any }  = { 
    "diagnoser" : <Diagnoser />, 
    "sparql" : <SparqlWidget /> , 
    "wiki_search" : <WikiDataSearch />, 
    "nccih_herb" : <NccihBrowser /> ,    
    "entity_view" : <EntityViewer /> , 
    "problem_list" : <ProblemList  /> , 	 
    
    //DO_NOT_REMOVE_OR_MODIFY -- THIS LINE USED BY TOOLS [dictionary]     
} 




