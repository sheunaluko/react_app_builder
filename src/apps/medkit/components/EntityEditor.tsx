import React from "react";
import { useState, useRef } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./EntityEditor_Context";
import * as smgr from "../state_manager" 
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
   
   REMAKE INTO CONTEXT BASED ARCH 
   
 */


let EditableFields = [ 
    "Entity" , 
    "Symptoms" , 
    "Clinical Features",     
    "Risk Factors" , 
    "Diagnosis" , 
    "Treatments" ,
] 

/*
   COMPONENT STARTS HERE -- >
   
 */

function Component() {
     
    const theme = useTheme();
    
    const [state, setState] = React.useState({
	entity_original_input : false , 
	entity_input_reset : 0 , 
	active_field : "Entity" , 
	field_states : {    } , 
    });
    
    
    let setField  = function( k : string, val : any) {
	let fs  = fp.clone(state.field_states)
	fs[k] = val 
	setState({ ...state , 
		   field_states : fs }) 
    } 
    
    let addToField = function( k : string , vals : string[]) {
	let val = {} 
	vals.map((s:string)=> val[s] = {original_input  : s , k : s } ) 
	setField(k,val) 
    } 
    
    
    let setActive = function( a : string) { 
	setState({ 
	    ...state , 
	    active_field : a 
	})
    } 
    
    let getActive = function() {
	return state.active_field ; 
    } 
    
    let cnt = 0 
    let entity_reset = function(){
	cnt = cnt + 1 ; 
	return cnt 
    }
    
    let entity_parse = function(i : string) {
	log("Processing entity input: " + i) 
	setState({
	    ...state, 
	    entity_original_input : i , 
	    entity_input_reset : entity_reset()
	})
    }    
    
    
    let generic_processor = function(t : string) {
	
	t = t.toLowerCase() 
	if (t.split(" ")[0] == "select" ) { 
	    log("Parsing select") 
	    EditableFields.map( (f : string) => { 
		let fl = f.toLowerCase() ; 
		if (t == `select ${fl}`) {
		    //match 
		    setActive(f) 
		} else {
		    //pass 
		} 
	    })
	    return 
	} 
	
	log("Getting active") 
	let active = getActive() 
	log(active) 
	
	if (active == "Entity") { 
	    entity_parse(t) 
	    return 
	} 
	
	log("Processing new input: " + t) 
	let terms = t.split(" and ").map( (x:string)=> x.trim()) 
	let to_add = terms.map( (term:string) => ({ 
	    original_input : term , 
	    k  : term , 
	}))
	log("Items to add: ") 
	log(to_add) 

	log("Getting active fields info")
	let existing = fp.clone(state.field_states[active])
	log(existing) 
	for (var i of to_add) {
	    log("Adding key: " + i.k)
	    existing[i.k] = i 
	} 
	log("new items:")
	log(existing) 
	setField( active  ,  existing) 
	log("Done") 
    } 
    
    smgr.register("setFieldData", setField) 
    smgr.register("addToField" , addToField)     
    smgr.register("setActive" , setActive) 
    smgr.register("getActive" , getActive)     
    smgr.register("entity_generic_processor" , generic_processor )         
    
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
    
    let EntityActive = (getActive() == "Entity" )
    
    let title = EntityActive ? active_title : default_title ; 
    
   
    
    

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
				    
				    <Box key={x} onClick={()=> setActive(x) }> 
					<EditableField  field_states={state.field_states} title={x} active={ getActive() == x } /> 
				    </Box>
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
    
    let {active,field_states} = props 
    
    let items = field_states[props.title] || {} 
    
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
		
		
		<IconButton onClick={()=> null } > 
		    <AddCircle /> 
		</IconButton>
		
	    </Box>
	    
	    
	    <Box  style={{
		borderStyle : "solid" , 
		borderRadius : "5px" , 
		borderColor : active ? theme.palette.primary.dark  : theme.palette.secondary.dark  , 
		borderWidth : "2px" , 
		minHeight : "5vh", 		
		boxSizing : "borderBox" , 
		padding :  "2%" , 
		maxHeight : "15vh" , 
		overflow : "auto" , 
	    }}> 
		
		<Grid container spacing={2}>
		    {
			fp.keys(items).map( (k:any) => { 
			    let i = items[k]
			    return ( 
				<Grid item xs={4} key={i.k} >    
				    <ResolvableInput original_input={i.original_input} /> 
				</Grid>
			    ) 
			})
		    }
		</Grid>
		
		
		
	    </Box>
	    
	</Container> 
    ) 
    
} 




export default Component ; 
