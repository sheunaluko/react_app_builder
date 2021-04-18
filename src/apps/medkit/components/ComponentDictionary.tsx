import React from 'react' 


import * as tsw from "tidyscripts_web" 

import WikiDataSearch from "./WikiDataSearch"  
import MeshSearch from "./MeshSearch2"  
import ProblemList from "./ProblemList"
import MeshTreeAccordion from "./MeshTreeAccordion"
import SparqlWidget from "./SparqlWidget"
import Diagnoser from "./Diagnoser"
import DiagnosisSupport2 from "./DiagnosisSupport2"
import NccihBrowser from "./NccihBrowser"
import EntityViewer from "./WikidataEntityViewer" 
import Settings from "./Settings" 
import Console from "./JSConsole"  
import Html from "./Html" 
import Antibiotics from "./Antibiotics" 


import EntityEditor from "./EntityEditor2" 
import VoicePanel from "./VoicePanel" 
import Visualizations from "./Visualizations" 

//import_marker 
//let VoicePanel = tsw.components.material_ui.VoicePanel



export var MenuComponents : {[k:string] : any }  = { 
    "diagnoser" : <Diagnoser />, 
    "diagnoser2" : <DiagnosisSupport2 /> , 
    "sparql" : <SparqlWidget /> , 
    "wiki_search" : <WikiDataSearch />, 
    "nccih_herbs" : <NccihBrowser /> ,    
    "mesh_search" : <MeshSearch /> , 
    "console" : <Console />, 
    "entity_view" : <EntityViewer /> , 
    "entity_editor" : <EntityEditor /> ,     
    "html" : <Html /> , 
    "settings" : <Settings  /> , 	     
    "voice_panel" : <VoicePanel /> , 
    "visualizations" : <Visualizations />,
    "abx"  : <Antibiotics /> , 
    //dictionary_marker
} 



