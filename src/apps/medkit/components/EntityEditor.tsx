import React from "react";
import { useState, useRef } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./EntityEditor_Context";
import * as smgr from './state_manager' 
import ResolvableInput from "./WikiResolvableInput" 


//import { ObjectInspector, TableInspector } from "react-inspector";

let {
  Container,
  Grid,
  Paper,
  AddCircleOutlineIcon,
  Link,
  TextField,
  Box,
  FormControl,
  FormHelperText,
  Breadcrumbs,
  Tabs,
  Tab,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ExpandMoreIcon,
  FaceIcon,
  IconButton,
  Icon,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  DoneIcon,
  Avatar,
  Button,
  Popover, 
  AddCircle, 
  CircularProgress, 
  Visibility,
  VisibilityOff,
  Typography
} = mui;

let fp = tsw.util.common.fp;
let mesh = tsw.apis.mesh;
let wikidata = tsw.apis.wikidata;
let log = tsw.util.common.Logger("entity_editor") 
let debug = tsw.util.common.debug;
declare var window: any;

var res_db = tsw.apis.db.GET_DB("input_resolution")


/* 
   
   UTILS 
   
 */


let EditableFields = [ 
    "Entity" , 
    "Symptoms" , 
    "Clinical Features",     
    "Risk Factors" , 
    "Diagnosis" , 
    "Treatments" ,
    
] 



var global_input_processor = function(i  : string) { 
    console.log("Default input processor: " + i ) 
} 

var keyword_input_processor = function(i : string) { 
    
    EditableFields.map( (f : string) => { 
	let fl = f.toLowerCase() ; 
	
	if (i == `select ${fl}`) {
	    //match 
	    smgr.get('setActiveField')(f) 
	} else {
	    //pass 
	} 
    })
    
} 

export function process_input(i : string) {
    i = i.toLowerCase() 
    if (i.split(" ")[0] == "select" ) { 
	keyword_input_processor(i)
    } else { 
	global_input_processor(i) 
    } 
} 

window.entity_process_input = process_input 


/*
   COMPONENT STARTS HERE -- >
   
 */



export default function Component() {
    
    const theme = useTheme();
    const [state, setState] = React.useState<any>({
	displayName : "unkown" , 
	userInput : null , 
	active_field : "Entity" ,
	entity_original_input : false , 
	entity_input_reset : 0 , 
    });
    
    let setActive = function( i  : string) {
	setState({ 
	    ...state, 
	    active_field : i 
	})
    } 
    
    smgr.register("setActiveField" , setActive) 
    
    let active_title = 	(
	<Typography  variant="h5" color="primary" > 
	    {"Entity: "}  
	</Typography>
    ) 

    let default_title = (
	<Typography  color="secondary"  > 
	    {"Entity: "}  	    
	</Typography>
    ) 
    
    let EntityActive = (state.active_field == "Entity" )
    
    let title = EntityActive ? active_title : default_title ; 
    
    let cnt = 0 
    let entity_reset = function(){
	cnt = cnt + 1 ; 
	return cnt 
    }
    
    React.useEffect( ()=> {
	if (EntityActive) { 
	    log("Rerouted gp") 
	    global_input_processor = function(t:string){
		log("Processing new input: " + t) 
		setState({
		    ...state, 
		    entity_original_input : t , 
		    entity_input_reset : entity_reset()
		})
	    } 
	} 
    },[state.active_field])
    

    return (
	<Context.Provider value={{ state, setState }}>
	    
	    <Container>
		
		<div
		    style={{
			backgroundColor: theme.palette.background.paper,
			padding: "2%",
			borderRadius: "15px"
		    }}
		>
		    
		    
		    <div style={{ display: "flex", flexDirection: "column" }}>
			
			<Box style={{ display: "flex", 
				      flexDirection: "row" , 
				      alignItems:"center" }} > 
			    <Box> 
				{title}
			    </Box>
	
	&nbsp;&nbsp;
	
	<Box> 
	    <ResolvableInput 
	        original_input={state.entity_original_input}
	        original_input_reset={state.entity_input_reset}	    
	    /> 
	</Box>
			</Box>
			
			<br/> 
			
			<Box>
			    {
				EditableFields.slice(1).map( (x:string) => ( 
				    
				    <EditableField key={x} title={x} active={ state.active_field == x } /> 
				) ) 
			    } 
			</Box>
			
		    </div>
		    
		    
		</div>
	    </Container>
	</Context.Provider>
    );
}




function EditableField(props :any ) { 
    
    let {active} = props 
    
    const theme = useTheme();
    
    let active_title = 	(
	<Typography  variant="h5" color="primary" > 
	    {props.title}: 
	</Typography>
    ) 

    let default_title = (
	<Typography  color="secondary"  > 
	    {props.title}: 
	</Typography>
    ) 
    
    return ( 
	<Container style={{ 
	    boxSizing : "border-box" , 
	    padding : "1%" , 

	}}  > 
	    
	    
	    <Box style={{ 
		display: "flex", 
		flexDirection: "row" , 
		alignItems:"center"
	    }} > 
		
		{
		    active ? active_title : default_title  		
		} 
		
		
		<IconButton> 
		    <AddCircle /> 
		</IconButton>
		
	    </Box>
	    
	    
	    <Box  style={{
		borderStyle : "solid" , 
		borderRadius : "5px" , 
		borderColor : active ? theme.palette.primary.dark  : theme.palette.secondary.dark  , 
		borderWidth : "2px" , 
		minHeight : "5vh", 			  
	    }}> 
		
		
		
		
		
	    </Box>
	    
	</Container> 
    ) 
    
} 



