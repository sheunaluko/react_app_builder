import React from "react";
import { useState,useRef } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./WikiResolvableInput_Context";
import SearchCard from "./SearchCard" 
import WikiSearch from "./WikiSearch" 

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
    Popover,
    InputAdornment,
    DoneIcon,
    Avatar,
    Button,
    Visibility,
    VisibilityOff,
    Typography
} = mui;

let fp = tsw.util.common.fp;
let mesh = tsw.apis.mesh;
let wikidata = tsw.apis.wikidata;
let log = tsw.util.common.Logger("wikiresolvableinput") 
let debug = tsw.util.common.debug;
declare var window: any;



/*
   CLEAN WIKI RESOLVABLE INPUT 
   HAD SPAGHETTI CODE BEFORE 
   Wed 24 Mar 2021 20:27:54 PDT

 */


function ResolvedUI() {
    const theme = useTheme();
    return (
	<Context.Consumer> 
	    {
		function({state,setState}) { 
		    let ops = { 
			option : state.resolved_option , 
			set_selected : function(opt : any) {
			    // - call the appropriate state update 
			    update_patterns['user_reselect'](state,setState)
			} 
		    } 
		    
		    return (
			<Box style={{maxWidth : "25vw"}}> 		    
			    <SearchCard {...ops} />  
			</Box> 
		    )
		} 
	    } 
	</Context.Consumer>
    ) 
}


function PoppableSelection() {
    
    const theme = useTheme();
    const button_ref = useRef(null) 
    
    let {state,setState} = React.useContext(Context) ; 
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
	log("button clicked")
	// - 
	update_patterns['user_init'](state,setState)	
    };
    const handleClose = function(event: object, reason: string) {
	log(`Popover closed: ${reason}`) 
	/* 
	   When the popover is closed because of the background being clicked, 
	   then a custom state transition should occur...
	 */
	if (reason == "backdropClick") { 
	    log("Backdrop was clicked... running state transition")
	    update_patterns['reset'](state,setState)
	} 
    };
    
    //create the ops that we pass to the wiki search element here... 
    let { current_input, search_id, should_select_first } = state
    
    let WikiSearchOps = { 
	current_input, 
	search_id , 
	should_select_first , 
	set_selected : function(op:any) {
	    //what should happen? 
	    update_patterns['selection'](state,setState,op)		    
	} 
    } 
    
    React.useEffect( ()=> {
	if (state.search_auto_open) {
	    setState({
		...state, 
		search_open : true , 
	    })
	} 
    },[])
    
    return (
	<div>
	    <Button  
		ref={button_ref} 
		variant="contained" 
		color="primary" 
		onClick={handleClick}> 	Select  </Button>
	    <Popover
		open={state.search_open}
		anchorEl={ button_ref.current }
		onClose={handleClose}
		anchorOrigin={{
		    vertical: 'bottom',
		    horizontal: 'right',
		}}
		transformOrigin={{
		    vertical: 'top',
		    horizontal: 'left',
		}}
	    >
		
		<Box style={{ 
		    height : "60vh" , 
		    width  : "24vw" , 
		}}>
		    <WikiSearch {...WikiSearchOps} /> 
		</Box>
		
	    </Popover>
	</div>
    )
}




/* 
   COMPONENT 
*/ 


export default function Component() {
    
    const theme = useTheme();
    
    const [state, setState] = React.useState<any>({
	// -- status of resolution 
	is_resolved : false, 
	// -- if resolved then there should be a resolved option for display 
	resolved_option : false, 
	// -- search open | auto open
	search_open : false, 
	search_auto_open : false, 
	// -- the wikisearch id (for automatic filling) 
	search_id : tsw.util.uuid() , 
	// -- tracking the original and current inputs 
	original_input : false , 
	current_input  : false , 
	// -- whether or not the first retrieved result should be autoselected
	should_select_first : false, 
	    
	
    });
    
    function stateSetter(state :any) {
	setState(state) 
	log("New state=>")
	log(state) 
    }
    
    let ResolvedUIComponent = <ResolvedUI/> 
    let PoppableUIComponent = <PoppableSelection/> 

    
    return (
	<Context.Provider value={{ state, setState }}>
	    <Box >
		{
		    state.is_resolved ?  ResolvedUIComponent  : PoppableUIComponent   
		} 
	    </Box> 
	</Context.Provider>
    );
}




/* 
   some shared patterns for updating state
 */
var update_patterns =  {  
    
    'user_init' : function(state :any,setState:any) {
	/* 
	   User clicks on 'SELECT' button to start searching 
	 */		
	log("State change => user_init") 
	let search_open  = true
	let search_auto_open = true
	let should_select_first = false //user will want to pick 
	let is_resolved = false //no longer resolved 
	let resolved_option = false //erase the resolved option 
	let new_state = {
	    ...state, 
	    search_open, 
	    search_auto_open, 
	    should_select_first, 
	    is_resolved, 
	    resolved_option ,
	} 
	state_set(new_state,setState)
    }  , 
    
    'user_reselect' : function(state :any,setState:any) {
	/* 
	   User clicks on a resolved card to edit it 
	 */		
	log("State change => user_reselect") 
	let new_state = {
	    ...state, 
	    is_resolved : false , 
	    search_open : false, 
	    search_auto_open : true , 
	    should_select_first : false, 
	} 
	state_set(new_state,setState)	
    }  , 	    
    
    'reset' : function(state :any,setState:any) {
	/* 
	   User clicks on a the backdrop and popover goes away 
	   nothing was selected however so will do full reset 
	 */		
	log("State change => reset") 
	let search_open  = false
	let search_auto_open = false
	let should_select_first = true //
	let is_resolved = false //no longer resolved 
	let resolved_option = false //erase the resolved option 
	let original_input = false
	let current_input = false 
	let new_state = { 
	    ...state, 
	    search_open, 
	    should_select_first, 
	    is_resolved, 
	    resolved_option ,
	    search_auto_open, 
	    original_input, 
	    current_input
	}
	state_set(new_state,setState)		
    }  , 	  
    
    'selection' : function(state :any,setState:any,op : any) {
	/* 
	   A selection is made 
	 */		
	log("State change => selection") 
	let search_open  = false
	let search_auto_open  = false		
	let should_select_first = true //
	let is_resolved = true 
	let resolved_option = op //got the option
	let current_input = op.label //should be the selected label
	let new_state = {
	    ...state, 
	    search_open, 
	    should_select_first, 
	    is_resolved, 
	    resolved_option ,
	    current_input
	}
	state_set(new_state,setState)			
    }  , 	  	    
    
}



function state_set(new_state,setState) {
    log("New state=>")
    log(new_state) 
    setState(new_state) 
} 
