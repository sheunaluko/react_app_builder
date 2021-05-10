import React from "react";
import { useTheme } from "@material-ui/core/styles";
import * as mui from "./list";
import * as tsw from "tidyscripts_web" 
import SearchCard from "./SearchCard" 


let log = tsw.util.common.Logger("wiki_search")

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


export default function WikiSearch(props : any) {
    
    let {set_selected, search_term, search_id , should_select_first}  =  props ; 

    const theme = useTheme() 
    
    const [state, setState] = React.useState<any>({
	options : [] , 
	progress :false, 
	should_select_first : should_select_first , 
    });
    
    /*
       When we render we check some things 
    */
    React.useEffect( ()=> {
	if (search_term) {
	    //if active current input then we auto search for it 
	    log("Detected search term=" + search_term)
	    log("Automating query") 
	    automate_input(search_id, search_term) 
	}  else { 
	    log("No search term to retrieve automatically...disable select first")
	    setState({
		...state, 
		should_select_first : false 
	    }) 
	    
	} 
    }, [search_term])

    let WikiInputChanged = fp.make_debouncer(500, async function(args : any[]) {
	// --  
	log("Input changed!")  
	log(args[0]) 
	log("Current props:")
	log(props) 
	log("Querying wikidata..")
	if (fp.is_empty(args[0])) { 
	    log("Ignoring empty")
	    setState( { options : [] , 
			progress : false}  ) 
	    return 
	} 
	setState({...state,
		  progress : true})
	let result = await apis.wikidata.WikidataSearchAsList(args[0]) //cached request 
	debug.add("wiki_query" , result) 
	
	
	//also will add a default option 
	let default_op = { 
	    label : args[0], 
	    concepturi : null ,
	    id : args[0] + "_unlinked" , 
	    description : "[unlinked]"
	} 
	
	
	setState( { ...state, 
		    options :  fp.concat([default_op],result) , 
		    progress :false    })
        /* 
	   Determine if we should auto return 1st result
	*/
	if (state.should_select_first) {
	    log("selecting first result") 
	    let sel = result[0]
	    if (!sel) {
		log(`search_term=${search_term} -> No results!`); 
	    } else { 
	    log(`search_term=${search_term} -> Selecting first (${sel.label}`)
	    log(sel) 
	    setTimeout( ()=> {
		set_selected(sel)
	    },400)
	    }
	} else { 
	    log("Not selecting 1st result") 
	} 
	
    }) 

    let SearchResults = () => ( 
	<Grid container spacing={3}>
	    { 
		state.options.map(function(option :any ){ 
		    return ( 
			<Grid key={option.id} item xs={12} >
			    <SearchCard option={option} set_selected={set_selected}  />  
			</Grid>
		    ) 
		})
	    } 
	</Grid>
    ) 
    
    return ( 
	<Box style={{ 
	    width : "100%", 
	    height : "100%" ,
	}}>
	    <div style={{ 
		width : "100%" , 
		height : "100%" ,
		boxSizing : "border-box", 
		padding : "3%" , 
		borderRadius : "7px"  , 
		borderStyle : "solid" , 
		borderWidth : "1px" , 
		borderColor : theme.palette.primary.light , 
		display : "flex" , 
		flexDirection : "column" , 
 	    }}>
		<br/> 
		<Box style={{display:"flex" , flexDirection : "row" }}>
		    <Box>
			<FormControl fullWidth variant="outlined">
			    <InputLabel htmlFor="outlined-adornment-amount">Wikidata</InputLabel>
			    <OutlinedInput
			    id={search_id}
			    onChange={ function(e:any) {
				    let val = e.target.value
				    WikiInputChanged([val])
				}}
			    startAdornment={<InputAdornment position="start">></InputAdornment>}
			    labelWidth={60}
			    />
			</FormControl>
		    </Box>
		    { 
			state.progress ?  
			( <Box style={{marginLeft : "4%" }}> 
			    <Box style={{height : "100%" , display :'flex' , flexDirection : "column", justifyContent : 'center'}}> 
				<CircularProgress /> 
			    </Box>
			</Box>  
			)  :  null 
		    } 
		</Box>
		<br/> 
		<div style={{ flexGrow: 1 , padding : "2%",  overflow : "auto"   }}>		
		    { 
			<SearchResults /> 
		    } 
		</div>			    
	    </div>  
	</Box > 			
    )
}



export function automate_input(id : string, q : string) { 
    
    /* 
       Interesting discussion here about programmatically triggering onChange for react input elements 
       https://hustle.bizongo.in/simulate-react-on-change-on-controlled-components-baa336920e04
     */ 
    let input = (document.getElementById(id) as any) 
    if (input) { 
	var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
	nativeInputValueSetter.call(input, q);
	var inputEvent = new Event('input', { bubbles: true});
	input.dispatchEvent(inputEvent);
    } 
    
} 
