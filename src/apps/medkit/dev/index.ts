

//import * as  indexed_db from "./indexed_db" 
import * as  evaluation from "./evaluation" 
import * as  diagnosis  from "./diagnosis" 
import * as cds from "./cds" 
import * as wiki_props from "./wikidata_medical_properties" 
import * as medline from "./medline" 
import * as sanford from "./antibiotic_info" 
import * as db_export from "./db_export" 

declare var window: any;

window.weval = evaluation 
    
export { 
    db_export, 
    medline, 
    diagnosis,  
    cds , 
    wiki_props, 
    sanford , 
    evaluation, 
} 
