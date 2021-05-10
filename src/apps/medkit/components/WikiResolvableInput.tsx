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
    CancelIcon, 
    Icon,
    CircularProgress, 
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
   Now its more like tasty udon noodles ;) 
   Wed 24 Mar 2021 20:27:54 PDT
*/



var res_db = tsw.apis.db.GET_DB("wiki_resolution") 

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
    
    //extract ops 
    let { current_input, 
	  search_id, 
	  should_select_first, 
	  on_delete, 
	  delete_on_unfocus, 
	  original_input } = state    
    
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
	    
	    if (delete_on_unfocus) {
		log("Should delete on unfocus... running handler")
		on_delete() 
	    } 
	    
	} 
    };
    
   
    
    //create the ops that we pass to the wiki search element here...     
    let WikiSearchOps = { 
	search_term : (current_input || (should_ignore(original_input) ? null : original_input)) , 
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
    },[state.search_open, state.search_auto_open])
    
    return (
	<div>
	    <Box style={{
		padding : "5px", 
		borderStyle : "solid" , 
		borderWidth : "1px" , 
		borderRadius : "4px" , 
		display : "flex" , 
		flexDirection : "row" , 
		borderColor : theme.palette.primary.light , 
	    }}   > 
		<Button  
		    ref={button_ref} 
		    variant="contained" 
		    color="primary" 
		    onClick={handleClick}> 	Select  </Button>

		{
		    on_delete ?  
		    (<React.Fragment> 
			<Box style={{flexGrow: 1}} /> 
		    <IconButton onClick={on_delete} > 
			<CancelIcon /> 
		    </IconButton>  
		    </React.Fragment> ) : null
	
		} 
	    </Box>
	    
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


let should_ignore = (s : any) => ( !s || s.includes("###ignore###")  )

export default function Component(props : any) {
    
    let { 
	original_input, 
	original_input_reset , 
	on_delete , 
	delete_on_unfocus , 
	on_resolved ,
	resolved_option  , 
    } = props ; 
    
    var is_resolved = false 
    var current_resolution_from_props = false 

    
    if ( resolved_option ) {
	/* 
	   Sometimes component will be initialized with resolution available 
	   In this case we should just auto resolve it... 
	*/ 
	is_resolved = true ; 
	current_resolution_from_props = true ; 
	
    }  else { 
	/* 
	   Sometimes the component will get initialized with special input with header
	   ###ignore### ... 
	 */ 
	if (original_input && should_ignore(original_input) ) {
	    log("Detected ignore: not doing anything yet") 
	}	
    } 
    
    const theme = useTheme();
    
    const [state, setState] = React.useState<any>({
	// -- status of resolution 
	is_resolved : is_resolved, 
	// -- if resolved then there should be a resolved option for display 
	resolved_option : resolved_option || false, 
	// -- search open | auto open
	search_open : false, 
	search_auto_open : false, 
	// -- the wikisearch id (for automatic filling) 
	search_id : tsw.util.uuid() , 
	// -- tracking the original and current inputs 
	original_input : (original_input || false) , 
	current_input  : false , 
	// -- whether or not the first retrieved result should be autoselected
	should_select_first : false, 
	// -- set on_delete 
	on_delete : on_delete || null , 
	// --
	delete_on_unfocus : delete_on_unfocus || null , 
	// --	
	loaded_from_db  : false ,
	// --	
	auto_loading_flag : false, 
	// --	
	awaiting_db  : true , 
	// --
	current_resolution_from_props : current_resolution_from_props  ,  
    });
    

    
    React.useEffect( function input_change(){
	
	log(`Detected changed in input...`) 
	log("Current state is:")
	log(JSON.stringify(state)) 
	
	if (state.current_resolution_from_props) {
	    // the component was just initialized and the resolution is included
	    // in the props... thus we will simply unset the awaiting_db flag
	    log("Detected resolution from props.. ") 
	    
	    //NOT WORKING!! 
	    setState({ 
		...state ,
		resolved_option : state.resolved_option , 
		is_resolved : true, 
		search_open : false, 
		awaiting_db : false, 
		auto_loading_flag : true , 
	    })	    
	    return 
	} 
	
	
	if ( props.original_input ) {
	    log(`Detected original input: ${props.original_input}`)
	    if (should_ignore(props.original_input)) {
		log("Ignoring it and setting awaiting_db=false,search_auto_open=true")
		setState({
		    ...state, 
		    awaiting_db : false , 
		    search_auto_open : true, 
		})	   		
	    } else { 
		log(`Detected and NOT ignoring original input: ${props.original_input}`); //aaaahhh need a semicolon here because of the function next 		
		/* 
		   so... in this case there is a new input that we need to resolve 
		   We know that it was not auto_resolve because that was the first 
		   if clause up there 
		*/
		
		(async function check_resolution(){
		    log("Checking for resolution for: " + props.original_input) 
		    
		    let res = await res_db.get(props.original_input) 
		    if (res) { 
			log("Got res: ")
			log(res) 
			log("Setting --> ")
			let { 
			    resolved_option 
			}  = res ; 
			setState({
			    ...state ,
			    resolved_option , 
			    is_resolved : true, 
			    search_open : false, 
			    loaded_from_db : true, 
			    auto_loading_flag : true, 
			    awaiting_db : false
		
			})
			return 
		    } else {
			log("No result for that original input") 
			update_patterns['new_original_input_no_db'](state,setState,props.original_input)
			return 
		    }
		    
		})()
		
		
		
		
	    } 
	    
	    
	} else {
	    
	    log("No original input detected... setting awaiting_db=false")
	    setState({
		...state, 
		awaiting_db : false 
	    })	    
	    return 
	} 
		    
		    
	    
        //update_patterns['new_original_input'](state,setState,original_input)

	
	
    },   [props.original_input_reset])   
    
    
    React.useEffect( ()=> {
	/*
	if (state.is_resolved ) {
	    log("Detected resolution... calling handler")
	    
	    var suppress_link = false ; 
	    
	    if ( state.auto_loading_flag ) { 
		log("Detected resolution during auto loading... will suppress link")
		suppress_link = true ; 
	    } 
	    
	    if (on_resolved) {
		
		let the_state = 
		
		on_resolved(state,{suppress_link})
		log("Updating current_resolution_from_props=false and autoload flag")
		setState({
		    ...state ,
		    current_resolution_from_props : false 
		})
		
	    } else {
		log("No handler available! ")
		if (suppress_link) { 
		    log("Will unset auto_loading")
		    setState({
			...state, 
			auto_loading_flag : false 
		    })
		}
		
	    } 
	} 
	*/ 
	setState( (state:any)=> {
	    log("Handling resolution in state subfunction") 
	    log("State is:")
	    log(JSON.stringify(state)) 
	    
	    if (!state.is_resolved) {
		log("State is not resolved so will return now") ;  
		return state //have to return the state here!!!!!! lmao 
	    } 
	    
	    if (!on_resolved) {
		log("Error: on resolved not defined!"); 
		return state 
	    }
	    // --
	    let suppress_link = false 
	    if (state.auto_loading_flag ){ 
		suppress_link = true 
	    } 
	    let new_state = fp.clone(state) 
	    // -- also can edit the state here 
	    new_state['auto_loading_flag'] = false 
	    new_state['search_open'] = false  // ? 
	    // -- call the handler  
	    //>
	    setTimeout( ()=> on_resolved(new_state, {suppress_link}), 0) 
	    
	    log("New state is:")
	    log(new_state)
	    return new_state
	})
	
	
    }, [state.is_resolved , state.resolved_option] )  //need to listen to both because sometimes we go from 1 resolved to another resolved 
    
    let ResolvedUIComponent = <ResolvedUI/> 
    let PoppableUIComponent = <PoppableSelection/> 
    
    let AwaitingCheckUI = <CircularProgress /> 

    
    
    return (
	<Context.Provider value={{ state, setState }}>
	    <Box >
		{
		    (function() {
			if (state.awaiting_db) { 
			    return AwaitingCheckUI 
			} else { 
			    if (state.is_resolved) { 
				return ResolvedUIComponent 
			    } else { 
				return  PoppableUIComponent   			    
			    } 
			}
		    })() 
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
2	   User clicks on a resolved card to edit it 
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
	let original_input = ("###ignore###_" + tsw.util.uuid())
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
    }, 	  
    
    'new_original_input' : function(state :any,setState:any, oi: string) {
	/* 
	   Externally a new original input has been supplied
	 */		
	log("State change => new original input") 
	let search_open  = state.is_resolved ? false :  true
	let search_auto_open = true
	let should_select_first = true //
	let is_resolved = false //no longer resolved 
	let resolved_option = false //erase the resolved option 
	let original_input = oi
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
    
    'new_original_input_no_db' : function(state :any,setState:any, oi: string) {
	/* 
	   Externally a new original input has been supplied
	 */		
	log("State change => new original input") 
	let search_open  = false  // state.is_resolved ? false :  true
	let search_auto_open = true
	let should_select_first = true //
	let is_resolved = false //no longer resolved 
	let resolved_option = false //erase the resolved option 
	let original_input = oi
	let current_input = false 
	let awaiting_db = false 
	let new_state = { 
	    ...state, 
	    search_open, 
	    awaiting_db , 
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
