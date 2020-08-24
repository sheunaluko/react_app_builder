import React from 'react';
import {useState} from 'react' ; 
import * as util_components from "./utils" 
import { useTheme } from '@material-ui/core/styles';
import { ObjectInspector, TableInspector } from "react-inspector";
import * as tsw from "tidyscripts_web" 
import * as mui from "./list" 
//import TextEditor from "./TextEditor" 
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/theme-github";


import {handleMeshQuery} from "./mesh_query" 
import MeshTreeAccordion from "./MeshTreeAccordion" 

interface State { 
    state : any, 
    setState : any 
} 

const SWContext = React.createContext<State>({state: null, setState : null})  ; 


let { Container, 
      Grid, 
      Paper, 
      SpeedDial,
      SpeedDialIcon,
      SpeedDialAction,
      AddCircleOutlineIcon,      
      Link, 
      TextField, 
      FormControl,
      Box, 
      FormHelperText, 
      Breadcrumbs, 
      Chip,
      FaceIcon, 
      IconButton, 
      Accordion,
      AccordionSummary, 
      AccordionDetails,
      ExpandMoreIcon, 
      Icon, 
      InputLabel,
      OutlinedInput, 
      InputAdornment, 
      DoneIcon,
      Avatar,
      Button, 
      Visibility, 
      VisibilityOff, 
      Typography } = mui 


let fp = tsw.util.common.fp
let mesh = tsw.apis.mesh 
let wikidata = tsw.apis.wikidata 
let log = console.log 
let debug = tsw.util.common.debug 

let mesh_ep = "https://id.nlm.nih.gov/mesh/sparql" 
let wiki_ep = "https://query.wikidata.org/sparql" 


export default function Widget(args? : any) {  
    
    
    let {blah} = (args || {}) ; 

    const theme = useTheme();
    
		  
    const [state, setState] = React.useState<any>({
        foo : 20, 
	endpoint : mesh_ep , 
	sparql_result : { 
	    status : "Awaiting request" 
	} , 
	sparql_text : "" , 
	me : "you" , 
	
    }) 
    
    let paper_style = { 
	padding : "2%" , 
	margin : "10px" , 
    } 
    
    
    const [open, setOpen] = React.useState(false);
    
    
    const handleClose = () => {
	setOpen(false);
    };

    const handleOpen = () => {
	setOpen(true);
    };


    return (
	<SWContext.Provider value={{ state , setState }} > 
    	    
	    <Container > 
		
		<div style={{ 
		    backgroundColor : theme.palette.background.paper , 
		    padding : "2%",  
		    borderRadius : "15px",
		    
 		}}>		
		    <Typography variant="h4" > 
			SPARQL Tool
		    </Typography> 
		    
		    <br /> 
		    
		    <Box> 
			<Accordion > 
			    <AccordionSummary
				expandIcon={<ExpandMoreIcon /> }
			    > 
				<Typography> 
				    Presets 
				</Typography>
			    </AccordionSummary> 
			    <AccordionDetails>  
				
				<Box style={{width : "100%"}}> 
				    
				    
				    <Accordion> 
					<AccordionSummary 
					    expandIcon={<ExpandMoreIcon /> }
					> 
					    <Typography >
						MeSH
					    </Typography>
					</AccordionSummary>
					<AccordionDetails> 
					    <Button 
						onClick={()=>activate_preset({...presets.mesh.descriptor_search, state, setState})}
					    > 
						Descriptor Search 
					    </Button> 
					</AccordionDetails>
				    </Accordion>

				    
				    <Accordion> 
					<AccordionSummary 
					    expandIcon={<ExpandMoreIcon /> }
					> 
					    <Typography >
						Wikidata
					    </Typography>
					</AccordionSummary>
					<AccordionDetails> 
					    <Button
						onClick={()=>activate_preset({...presets.wikidata.label_for_meshid,state,setState})}
					    > 
						Label for MeSH ID
					    </Button> 
					</AccordionDetails>
				    </Accordion>
				    
				    
				</Box>
				
			    </AccordionDetails>
			    
			</Accordion>
		    </Box>
		    
		    <br /> 
		    
		    <TextField
		        style={{ 
			    width :"30%" ,
			    marginBottom : "10px",
			}}
		    
			label="Endpoint"
		        value={state.endpoint}
		        onChange={function(e:any){ 
				setState({...state, endpoint : e.target.value})
			    }}
			variant="outlined"	  /> 
		    
		    
		    <Typography variant="subtitle1"> 
			Input a sparql query below: 
		    </Typography>
		    
		    <AceEditor
		    debounceChangePeriod={1000}
		    width="100%"
		    value={state.sparql_text}
		    mode="mysql"
		    theme="github"
		    name="ace_editor_sparql"
		    onChange={(sparql_text:string)=> setState({...state,sparql_text })}
		    editorProps={{ $blockScrolling: true }}
		    />		    
		    
		    
		    <br /> 
		    <Button 
			variant="outlined"
			onClick={
			    async function(){
				let op = { 
				    endpoint : state.endpoint , 
				    query : state.sparql_text , 
				}
				
				let result = await sparql_helper(op) 
				debug.add("sparql_helper.result", result) 
				debug.log("Saved sparql result to sparql_helper.result, updating state now")
				setState({...state, sparql_result : result }) 
				
				
			    } 
			}
		    > 
			Run
		    </Button>
		    
		    
		    <br /> 
		    <br /> 
		    <br /> 		    
		    
		    <ObjectInspector data={state.sparql_result} /> 
		    
		</div>
		
	    </Container> 
	</SWContext.Provider > 
    ) 
    
} 


interface POp { 
    ep : string, 
    query : string ,
    state : any , 
    setState :any , 
} 

function activate_preset (op : POp) { 
    
    let {ep, 
	 query,
	 state, 
	 setState 
    } = op  
    
    state = fp.update_at(state, ["endpoint"] , (e:any)=> ep )
    state = fp.update_at(state, ["sparql_text"] , (e:any)=> query )    
    
    debug.add("activate_preset.state[postUpdates]", state) 
    
    setState(fp.clone(state))
    
} 



// define preset states for the sparql widget 
// the user will be able to select these from the dropdown menu 
export var presets = { 
    
    'mesh': { 
	'descriptor_search'  : { 
	    ep : mesh_ep , 
	    query : `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX meshv: <http://id.nlm.nih.gov/mesh/vocab#>
PREFIX mesh: <http://id.nlm.nih.gov/mesh/>
PREFIX mesh2020: <http://id.nlm.nih.gov/mesh/2020/>
PREFIX mesh2019: <http://id.nlm.nih.gov/mesh/2019/>
PREFIX mesh2018: <http://id.nlm.nih.gov/mesh/2018/>

SELECT DISTINCT ?d ?dName ?treeNum
FROM <http://id.nlm.nih.gov/mesh>
WHERE {
  ?d a meshv:Descriptor .
  ?d meshv:treeNumber ?treeNum . 
  ?d meshv:concept ?c .
  ?d rdfs:label ?dName .
  ?c rdfs:label ?cName . 
  VALUES ?term {'cellulitis'} .  

  FILTER(REGEX(?dName,?term,'i') || REGEX(?cName,?term,'i')) 
} 
ORDER BY ?d` 
	} 
    } , 
    
    'wikidata' : { 
	'label_for_meshid'  : {
	    ep : wiki_ep , 
	    query : `
SELECT ?item ?itemLabel 
WHERE 
{
  ?item wdt:P486 "D002481" .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}`
	    
	}
    } , 
}



interface SOps { 
    endpoint : string, 
    query: string, 
} 

export async function sparql_helper(ops : SOps) {
    let {endpoint, 
	 query} = ops  
    
    //the url params might depend on the specific endpoint 
    //will abstract over this using a settings map 
    let default_url_params = { 
	format : 'json' 
    } 
    var settings : any  = {} 
    settings[mesh_ep] = { 
	url_params : { 
	    format : 'json', 
	    inference: true , 
	} 
    } 
    
    settings[wiki_ep] = { 
	url_params : { 
	    format : 'json', 
	} 
    } 
    
    var url_params :any = null; 
    let current_settings = settings[endpoint] 
    
    if (current_settings) {
	url_params = current_settings.url_params 
    } else { 
	url_params = default_url_params 
    } 
    
    //ok at this point we should have our endpoint, the sparql query, and url_params 
    return mesh.sparql_template_fn({ 
	template : query ,
	replacers : [] , 
	url_base : endpoint , 
	url_params, 
	param_key  : "query" , 
    })
    
} 

