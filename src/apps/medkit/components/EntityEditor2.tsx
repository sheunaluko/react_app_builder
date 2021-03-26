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
  MicIcon ,
  MicOffIcon , 
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

let vi = tsw.util.voice_interface 
let vi_enabled = () => (vi.recognition_state == "LISTENING" || vi.recognition_state == "PAUSED" )
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
   
   Learned LOTS of stuff about react  CODING THIS STATEFUL COMPONENT 
   NAMELY -- the cleanest way to update state in react is to pass a callback function that takes the current state 
   ALSO -- when using my state_manager pattern it is best to set the bindings INSIDE a useEFFECT hook!! or else some of the bindings will not be initialized... basically i am enforcing control 
   about the context that my bindings are being run in 
   
   
   [ ] delete/removing resolvable input (onDeleted) 
   [ ] autotracking resolution (onResolved)    
   [ ] unresolved selection (AS is ) - defer resolution  
   [ ] create wiki item 
   [ ] saving state for entity (save button - can do DB but should periodically BACK UP!)
   [ ] loading state for entity -- 

   
 */

function Component() {
    
    const theme = useTheme();
    let [original_input , set_original_input] = React.useState(null) 
    let [original_input_reset, set_original_input_reset] = React.useState(0) 
    let set_entity = function(t : string) {
	set_original_input(t) ; 
	set_original_input_reset( (x:number)=> x+1 ) ; //the resolvable input listens to this change and re-renders even if original input is same as prior 
    } 
    
    let [active_field, set_active_field] = React.useState('Entity') 
    let [field_states , set_field_states] = React.useState({
        'Entity' : [] , 
	'Symptoms' : [] , 
	'Clinical Features' : [] , 
	'Risk Factors' : [] , 
	'Diagnosis' : [], 
	'Treatments' : [], 
    })
    
    let set_field_state = function( k : string, vals : string[]) {
	set_field_states( (field_states : any) => {
	    var items = field_states[k]
	    var item_vals = fp.map_get(items,"original_input")
	    vals.map((val:string) => {
		if (item_vals.includes(val)) {
		    //already has it 
		    log("Ignoring duplicate! :" + val)
		} else { 
		    log("Adding item:" + val)		    
		    items.push( {original_input : val , k : val})
		} 
	    })
	    return { 
		...field_states, 
		[k] : items 
	    } 
	})
    } 
    
    let process_input = function(i :string) { 
	log("Processing input... " + i) 
	if (i.split(" ")[0] == "select") { 
	    let selection = i.split(" ").slice(1).join(" ").toLowerCase()
	    EditableFields.map( (ef : string) => {
		if (selection == ef.toLowerCase() ) {
		    log("Setting selection: " + ef)
		    set_active_field(ef)
		    return 
		} 
	    })
	    log("Selection unrecognized: " + selection)
	} else { 
	    /* 
	       check the active field
	       I did this to ACCESS the currently active field as I was having problems 
	       using the ref directly  
	     */ 
	    set_active_field( (active:string)=> {
		if (active == "Entity") { 
		    log("Entity is active... routing") 
		    set_entity(i)
		} else { 
		    log(active + " is active... routing")
		    let vals = i.split(" and ") 	
		    set_field_state(active, vals)
		} 
		return active //should not change the active field 
	    })
	    

	}
	log("Done") 
    } 
    
    
    let voice_result_handler =  async function(e :any) {
	log("Got recognition result!") 
	let text = e.detail.trim().toLowerCase()
	log(text) 
	process_input(text)
	tsw.util.sounds.proceed()
    }
    
    React.useEffect( () => { 
	log("Attached voice listener")
	window.addEventListener('tidyscripts_web_speech_recognition_result' , voice_result_handler) 
	return function result_cleanup() {
	    log("Removing voice listener")	    
	    window.removeEventListener('tidyscripts_web_speech_recognition_result' , voice_result_handler) 
	} 
    }, [])
    
    
    /* 
       Try the smgr bindings 
     */
    React.useEffect( ()=> { 
	smgr.register("entityProcessInput" , process_input) 	
	smgr.register("entitySetInput" , set_original_input) 
	smgr.register("entitySetFieldState" , set_field_state) 	
	smgr.register("entitySetActive" , set_active_field) 
	smgr.register("entitySetEntity" , set_entity)     
    }, [])
    
    /* 
       And a callback
     */

    let add_item  = function(t : string) {
	set_field_state(t , ["###ignore###_" + tsw.util.uuid() ])
    } 
    
    
    // ehh 
    let [micState, setMicState] = React.useState( vi_enabled() ) 
    
    
    return (
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
			    { 
				(active_field == "Entity") ? ( <Typography variant="h5" color="primary">{"Entity: "}</Typography>):(<Typography color="secondary">{"Entity: "}</Typography>) 
			    } 
			</Box>
	
	&nbsp;&nbsp;
	
	<Box> 
	    <ResolvableInput 
	        original_input={original_input}
	        original_input_reset={original_input_reset}	    
	    /> 
	</Box>

	<Box style={{flexGrow : 1}} /> 
	
	<IconButton onClick={()=>{ 
		if (vi_enabled() ) {
		    vi.stop_recognition() 
		    setMicState(false)
		} else { 
		    vi.initialize_recognition() 
		    setMicState(true) 
		} 
	} }> 
	    { 
		vi_enabled() ? <MicIcon />  : < MicOffIcon />
	    } 
	</IconButton>
	
	
		    </Box>
		    
		    <br/> 
		    
		    <Box>
			{
			    EditableFields.slice(1).map( (x:string) => ( 
				
				<Box key={x} onClick={()=> set_active_field(x) }> 
				    <EditableField  
					items={field_states[x]} 
					title={x} 
					add_item={add_item}
					active={  active_field == x } /> 
				</Box>
			    ) ) 
			} 
		    </Box>
		    
		</div>
		
		
	    </div>
	</Container>
    );
}




function EditableField(props :any ) { 
    const myRef = useRef(null)
    const executeScroll = () => myRef.current.scrollIntoView()        
    let {active,items,title,add_item} = props 
    const theme = useTheme();
    let active_title = 	(
	<Typography  variant="h5" color="primary" > 
	    {title}: 
	</Typography>
    ) 
    let default_title = (
	<Typography  color="secondary"  > 
	    {title}: 
	</Typography>
    ) 
    
    React.useEffect( ()=> {
	if (active) { 
	    executeScroll()
	} 
    }, [active]) 
    
    return ( 
	<Container 
	    ref={myRef}
	    style={{ 
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
		<IconButton onClick={()=> add_item(title) } > 
		    <AddCircle /> 
		</IconButton>
	    </Box>
	    <Box  
		style={{
		borderStyle : "solid" , 
		borderRadius : "5px" , 
		borderColor : active ? theme.palette.primary.dark  : theme.palette.secondary.dark  , 
		borderWidth : "2px" , 
		minHeight : active ? "50vh" : "5vh", 		
		boxSizing : "borderBox" , 
		padding :  "2%" , 
		maxHeight : "15vh" , 
		overflow : "auto" , 
	    }}> 
		
		<Grid container spacing={2}>
		    {
			items.map( (i:any) => { 
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
