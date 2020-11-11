import React from 'react' 


import WikiDataSearch from "./WikiDataSearch"  
import MeshSearch from "./MeshSearch2"  
import ProblemList from "./ProblemList"
import MeshTreeAccordion from "./MeshTreeAccordion"
import SparqlWidget from "./SparqlWidget"
import Diagnoser from "./Diagnoser"
import NccihBrowser from "./NccihBrowser"
import EntityViewer from "./WikidataEntityViewer" 
import Settings from "./Settings" 
import Console from "./JSConsole"  
import Html from "./Html" 


//import_marker 

export var MenuComponents : {[k:string] : any }  = { 
    "diagnoser" : <Diagnoser />, 
    "sparql" : <SparqlWidget /> , 
    "wiki_search" : <WikiDataSearch />, 
    "nccih_herbs" : <NccihBrowser /> ,    
    "mesh_search" : <MeshSearch /> , 
    "console" : <Console />, 
    "entity_view" : <EntityViewer /> , 
    "problem_list" : <ProblemList  /> , 	 
    "html" : <Html /> , 
    "settings" : <Settings  /> , 	     
    //dictionary_marker
} 



