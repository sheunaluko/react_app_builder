import React from "react";
import { useState, useRef } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./EntityEditor_Context";
import * as smgr from "../state_manager" 
import ResolvableInput from "./WikiResolvableInput" 

let {
    Container,
    Grid,
    SaveIcon,
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

var res_db = tsw.apis.db.GET_DB("wiki_resolution")
var entity_db = tsw.apis.db.GET_DB("entity_info")

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
   
   
   [x] delete/removing resolvable input (onDeleted) 
   [x] top toast
   [x] autotracking resolution (onResolved)    
   [x] unresolved selection (AS is ) - defer resolution  

   [x] saving state for entity 
   [x] loading state for entity  
   [ ] switch entity in one command 
   [ ] turn off voice with command 
   [ ] delete items (x icon -- maaaybe voice) 
   [ ] create wiki item 
   [ ] db state backup ? 
   
 */




function Component() {
    
    const theme = useTheme();
    let [original_input , set_original_input] = React.useState(null) 
    let [original_input_reset, set_original_input_reset] = React.useState(0) 
    let set_entity = function(t : string) {
	log("Setting entity fn")
	set_original_input(t) ; 
	set_original_input_reset( (x:number)=> x+1 ) ; //the resolvable input listens to this change and re-renders even if original input is same as prior 
    } 
    
    let [active_field, set_active_field] = React.useState('Entity') 
    
    let empty_field_states = {
        'Entity' : [] , 
	'Symptoms' : [] , 
	'Clinical Features' : [] , 
	'Risk Factors' : [] , 
	'Diagnosis' : [], 
	'Treatments' : [], 
    }
    
    let [field_states , set_field_states] = React.useState(empty_field_states)
    
    let [current_entity , set_current_entity] = React.useState(null) 
    
    //tracks the resolved values for each state 
    let [resolved_state , set_resolved_state ] = React.useState({
        'Entity' : {} , 
	'Symptoms' : {} , 
	'Clinical Features' : {} , 
	'Risk Factors' : {} , 
	'Diagnosis' : {} , 
	'Treatments' : {} , 
    })
    
    let should_ignore = (s : any) => ( !s || s.includes("###ignore###")  )
    
    let on_resolved = async function(resolved_ops : any) { 
	
	let {k , state, suppress_link}  = resolved_ops ; 
	
	log(`On resolved: suppress=${suppress_link}, k=${k}, and state=`) 
	log(state) 
	
	let {
	    original_input , current_input , resolved_option 
	}  = state   ; 
	let {
	    label , id , description
	} = resolved_option 
	
	
	if (!suppress_link) {
	    /* Manage resolution of the resolvable inputs  */ 

	    if ( should_ignore(original_input)  )  { 
		log("Ignoring resolution for " + label ) 
	    } else { 
		let msg = `Resolved ${original_input} to ${label} (id=${id}) - ${description}`
		log(msg)      	
		smgr.get("snack_time")(msg) 
		
		//now we store it into the db after removing the function handlers, etc 
		let new_state = { resolved_option  : state.resolved_option } 
		await res_db.set(original_input , new_state ) 
		log("Stored associated resolution state") 
	    } 
	} 
	
	if (!k) { return } //only update below if there is a k
	
	/* update the state -- so it can be accessed later */ 
	set_resolved_state( (resolved_state : any) => {
	    let to_update = resolved_state[k]
	    let to_save =  {
		resolved_option , 
		original_input , 
		current_input 
	    }
	    to_update[state.original_input] = to_save 
	    log(`Updating ${k} @ ${state.original_input} with state:`)
	    log(to_save) 
	    let final_state ={
		...resolved_state, 
		[k] : to_update 
	    }
	    log("Final state:") 
	    log(final_state) 
	    return final_state 
	})
	
    } 
    
    
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
    
    let remove_field_state = function( k : string, vals : string[]) {
	log("Removing items: ") 	
	log(vals)
	set_field_states( (field_states : any) => {
	    var items = field_states[k]
	    //basically we want to remove any of 'vals' from the items array 
	    var new_items = items.filter( (i : any) => ( ! vals.includes(i.original_input) ) ) 
	    log("Keeping items: ") 
	    log(new_items) 
	    return { 
		...field_states, 
		[k] : new_items 
	    } 
	})
    }     
    
    let process_input = function(i :string) { 
	
	
	//debugger ; 
	
	log("Processing input... " + i) 
	
	if (i == "save entity") {
	    log("Detected request to save") 
	    on_save() 
	    return 
	} 
	
	
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

	    let active = smgr.get("entityActive")  ; 
		
	    if (active == "Entity") { 
		log("Entity is active... routing") 
		set_entity(i)
	    } else { 
		log("Entity not active...")
		log(active + " is active... routing")
		let vals = i.split(" and ") 	
		set_field_state(active, vals)
	    } 
	    

	}
	
	log("Done") 
    } 
    
    
    let on_save = async function() {
	
	set_current_entity( (current_entity :any) => {
	    
	    log("On save:: current entity is ->") ; log(current_entity) ; 
	    
	    (async function on_save_2() {
		let current_option = current_entity.resolved_option 
		/* 
		   now we need a reference to the entire current state 
		   fortunately, that is stored in 'resolved_state' :
		 */
		await entity_db.set(current_option.id ,  fp.clone(resolved_state) ) 
		let save_msg = `Saved current properties for: ${current_option.label}` ; 
		smgr.get("snack_time")(save_msg) 
	    })() 
	    
	    return current_entity //return same (hack to access it) 
	})
	
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
       Listen and load 
     */
    React.useEffect( ()=> {
	(async function load_current_entity() {
	    
	    log("Attempting to load data for current entity:" )
	    log(current_entity) 
	    if(!current_entity || !current_entity.resolved_option) { log("Current entity is missing or not resolved so will discontinue load attempt");return} 
	    
	    let current_option = current_entity.resolved_option 
	    
	    let data  = await entity_db.get(current_option.id) 
	    
	    if (data ) { 
		log("Found data!")
		
		//the question here is how to deal with the data, which is resolution data 
		//and has keys -- resolved_option, original_input, and current_input 
		//cannot simply use original input because sometimes that is "false" 
		//so... the way is to be able to DIRECTLY set the resolved input 
		//unfortunately the way I started is by by only specifying 'original_input' in the state
		//but! I did make the state and array of {k , original_input} so I can add an extra key
		//which will be {resolved_option} and then pass that to the ResolvableInput 
		//so... for EACH of the keys i must build this 
		let state_to_set = {} 
		let ks = fp.keys(data) 
		for (var k of ks ) { 
		    
		    let dta = data[k]
		    let vals = fp.values(dta) //this is the [{keys mentioned above}]
		    let new_vals = vals.map((v:any)=> ({
			original_input : v.original_input, 
			resolved_option : v.resolved_option,
			current_input : v.current_input, 
			k : v.resolved_option.id , 
		    }))
		    state_to_set[k] = new_vals
		    
		} 
		//set the state 
		log("Setting field states with: ")
		log(state_to_set) 
		set_field_states(state_to_set)
		
	    } else { 
		log("No data found for: " + current_option.label)
		//set empty state 
		set_field_states(empty_field_states) 
	    } 
		
	})()
    },[current_entity])
    
    
    /* 
       Try the smgr bindings 
     */
    React.useEffect( ()=> { 
	smgr.register("entityProcessInput" , process_input) 	
	smgr.register("entitySetInput" , set_original_input) 
	smgr.register("entitySetFieldState" , set_field_state) 	
	smgr.register("entitySetActive" , set_active_field) 
	smgr.register("entityActive" , active_field) 		
	smgr.register("entitySetEntity" , set_entity)     
    })
    
    /* 
       And a callback
     */

    let add_item  = function(t : string) {
	set_field_state(t , ["###ignore###_" + tsw.util.uuid() ])
    } 
    
    let delete_item  = function(k : string, id : string) {
	log(`Removing item from field state: ${id}`)
	remove_field_state( k , [id]) 
	// [ ] also have to delete it from the resolved states! 
	// yes TODo!!! 
	log(`Removing item from resolved state too: ${id}`)
	
	set_resolved_state( (rs :any) => {
	    
	    let to_update = rs[k] 
	    delete to_update[id]  //remove the key 
	    let new_state = {
		...rs ,
		[k] : to_update 
	    } 
	    log("New state:")
	    log(new_state) 
	    return new_state 
	})
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
	        on_resolved={(state:any,meta:any)=> {
			let {suppress_link}  = meta ; 
			let ops = {  
			    k : null , 
			    suppress_link , 
			    state 
			}
			on_resolved(ops) 
			//AND update the current entity regardless 
			log("updating current entity!") 
			set_current_entity(state) 
		}}
	        original_input={original_input}
	        original_input_reset={original_input_reset}	    
	    /> 
	</Box>

	<Box style={{flexGrow : 1}} /> 
	
	
	<IconButton onClick={()=>{ 
		on_save() 
	} }> 

	    <SaveIcon/> 
	</IconButton>
	
	
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
				    on_resolved={on_resolved} 
				    items={field_states[x]} 
				    title={x} 
				    add_item={add_item}
				        delete_item={delete_item}
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
    let {active,
	 items,
	 title,
	 add_item,
	 on_resolved, 
	 delete_item} = props 
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
				    <ResolvableInput 
				    on_resolved={(state:any,meta:any)=> {
					    let {suppress_link}  = meta ; 
					    let ops = {  
						k : title , 
						suppress_link , 
						state 
					    }
					    on_resolved(ops) 
				    }}
				    original_input={i.original_input} 
				    on_delete={()=>delete_item(title,i.original_input)}
                 		        delete_on_unfocus={true}
				        resolved_option={i.resolved_option} //may start resolved
				    />
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
