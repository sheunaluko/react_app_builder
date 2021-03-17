
import * as tsw from   "tidyscripts_web"  ; 
let fp = tsw.util.common.fp 
let debug = tsw.util.common.debug 
let wiki  = tsw.apis.wikidata 


/* 
All  properties retrieved with the following  query

SELECT ?medProp ?medPropLabel 
WHERE 
{
  ?medProp wdt:P31/wdt:P279* wd:Q19887775
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}

*/

// > ok so we create a dictionary of the relevant medical properties  
// > organized by directionality of relationship to a potential diagnosis 
// > i.e. symptom_or_sign -PROP-> diagnosis  ( this direction is forward ) 

const diagnostic_properties =  { 
    'forward' : [
	//these map from the symptom to the disease 
	["P828", "has cause"],	
	["P5132", "suggests the existence of"],
	["P7500", "comorbidity"],
	// lol .. 
	//["P1606" , "natural reservoir of"], 

	/* 
	   some genetic properties below, will include these for now 
	   if a user inputs a gene then these will pick up potential associations to diseases
	   however, currently (Sun Feb 14 16:17:45 CST 2021) cannot allow the user to 
	   directly specify the property relationship between a symptom they enter and the 
	   desired diagnosis. For example, the feature input could have little widgets 
	   for inputting various types of findings, and the GENETIC widget would allow a drop
	   down of (increased/decreased expression, duplication, etc) and then a search 
	   upon selection the input would be paired with the desired property and this would 
	   be reflected in the resulting sparql query for candidate matches 
	*/
	
	//["P1910", "decreased expression"],
	//["P1911", "increased expression in"],
	//["P1912", "deletion association with"],
	//["P1913", "gene duplication association with"],
	//["P1914", "gene insertion association with"],
	//["P1915", "gene inversion association with"],
	//["P1916", "gene substitution association with"], 
	//[ - - ] - [ - - ] 
	
	["P3356", "positive diagnostic predictor" ], //several variations of this 
	
    ], 
    'backward' : [
	//these map from the disease to the symptom 
	["P780", "symptoms" ], 	
	["P5131", "possible medical findings"],
	["P1542", "has effect"], 	
	["P1605", "has natural reservoir"],
	["P1909", "side effect"],
	["P5642", "risk factor"],

    ]
}

const descriptive_properties =  {
    'forward' : [ 
	["P486" , "MeSH descriptor ID"] , 
	["P672" , "MeSH tree code"] ,
	["P699", "Disease Ontology ID"],
	["P493" , "ICD-9"] , 
	["P494" , "ICD-10"] , 
	["P1395", "National Cancer Institute ID"], 
    ], 
    'backward' : [
    ] 
} 


const informational_properties  = { 
    'forward' : [ 
	["P663", "DSM-IV classification" ], 
	["P1930", "DSM-5 classification"] , 
	["P689", "afflicts" ], 
	["P2841", "age of onset"],
	["P927", "anatomical location"],
	["P923", "medical examinations" ],
	["P924", "possible treatment" ], 
	["P1060", "pathogen transmission process"],
	["P1193", "prevalence"],	//this may need to be mandatory 
	["P2844", "incidence"], 
	["P2854", "disease burden"],
	["P3457", "case fatality rate"],
	["P1199", "mode of inheritance"], 
	["P1603", "number of cases"], 
	["P8010", "number of recoveries"],
	["P8011", "number of clinical tests"],
	["P8049", "number of hospitalized cases"],
	["P1605", "has natural reservoir"],
	["P3487", "maximal incubation period in humans"],
	["P3488", "minimal incubation period in humans"],	

	
    ],
    'backward' : [
	["P1050" , "medical condition"],
	
    ]
}

const drug_properties = { 
    'forward' : [ 
	["P636",  "route of administration" ]  , 
	["P715",  "DrugBank ID"] , 
	["P769",  "significant drug interaction"], 
	["P2240", "median lethal dose (LD50)"] ,
	["P2710", "minimal lethal concentration"],
	["P2712", "median lethal concentration (LC50)"],
	["P2717", "no-observed-adverse-effect level"],
	["P2718", "lowest-observed-adverse-effect level"],
	["P3345", "RxNorm ID"],
	["P3781", "has active ingredient"],
	["P4250", "defined daily dose"],
    ],
    'backward' : [
	["P2176" , "drug used for treatment"], 
    ]
} 

const additional_properties = {
  'forward' : [ 
      ["P1995", "health specialty" ], 
      ["P2175", "medical condition treated"], // ? 
      ["P3094", "develops from" ],
      ["P3841", "Human Phenotype Ontology ID"],
      ["P8656", "Symptom Ontology ID"],
      ["P4044", "therapeutic area"], 
      ["P4338", "LOINC ID"], //? how to rep labs ? 
      ["P5446", "reference value"], 
      ["P4954", "may prevent"],
      ["P5133", "has evaluation"],

    ],
    'backward' : [
	["P5134", "evaluation of"],       	
    ]    
} 



//now we build convenient structures 

export const property_tree : any  = { 
    diagnostic_properties, 
    descriptive_properties, 
    informational_properties, 
    drug_properties, 
    additional_properties, 
} 

export var properties_by_type : any = {} 
export var properties : any = { 'by_id' : {} , 'by_label' : {}  } 

//helpers for populating the properties structure 
let flip = function(arr2 : any) { return [ arr2[1], arr2[0] ]} 
let add_direction_annotation = (ann : string) => (
    function(arr2 :any) {
	return [ arr2[0], { direction : ann, 
			    property : arr2[1] }]
    }
) 
    
//populate the properties structure structures 
for (var k of fp.keys(property_tree)) {
    
    let newk = k.replace("_properties","")
    
    //by_id
    let flist_id   = fp.map(property_tree[k].forward, 
			    add_direction_annotation('forward') )
    let blist_id   = fp.map(property_tree[k].backward, 
			    add_direction_annotation('backward') )
    
    let id_dic     = fp.list_to_dict(fp.concat(flist_id,blist_id))
    
    //by_label
    let flist_lab  = fp.map(property_tree[k].forward.map(flip), 
			    add_direction_annotation('forward') )
    let blist_lab  = fp.map(property_tree[k].backward.map(flip), 
			    add_direction_annotation('backward') )
    let label_dic  = fp.list_to_dict(fp.concat(flist_lab,blist_lab))
    
    //add properties by type 
    properties_by_type[newk] = { 
	'by_id' : id_dic,
	'by_label' : label_dic,
    } 
    
    //and add to structure holding unsorted properties 
    fp.map_items(id_dic).map( (kv :any)=> {
	properties['by_id'][kv[0]] = kv[1]
    })

    fp.map_items(label_dic).map( (kv : any)=> {
	properties['by_label'][kv[0]] = kv[1]
    })
    
} 


export function property_ids_of_type(t : string, d : string) {
    t= t + "_properties"
    return fp.map(property_tree[t][d],fp.first)
} 
export function property_labels_of_type(t : string, d : string) {
    t= t + "_properties"    
    return fp.map(property_tree[t][d],fp.second)
} 

export function properties_of_type(t : string, d : string) {
    t= t + "_properties"        
    return property_tree[t][d]
} 




